from __future__ import annotations

import argparse
import asyncio
import json
import os
import shutil
import sys
from pathlib import Path

from app.core.config import Settings
from app.core.user_config import (
    CliConfig,
    default_config_path,
    load_cli_config,
    render_default_config,
)
from app.services.auditor import AuditorService
from app.services.llm import RemediationLlmService
from app.services.local_code import LocalCodeService


RESET = "\033[0m"
SEVERITY_STYLES = {
    "Critical": {"icon": "🔴", "color": "\033[91m"},
    "High": {"icon": "🟠", "color": "\033[33m"},
    "Medium": {"icon": "🟡", "color": "\033[93m"},
    "Low": {"icon": "🔵", "color": "\033[94m"},
}

ISSUE_SUMMARIES = {
    "image-alt": "Image missing alt text",
    "label": "Form control missing label",
    "button-name": "Button missing accessible name",
    "link-name": "Link missing accessible name",
    "html-has-lang": "<html> missing lang attribute",
    "color-contrast": "Text contrast fails WCAG AA",
    "duplicate-id": "Duplicate id attribute",
    "duplicate-id-aria": "Duplicate id used by ARIA or labels",
}

PROVIDER_CHOICES = ("local", "auto", "openai", "anthropic")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="accessimed",
        description="Open-source WCAG accessibility scanning and remediation CLI for website codebases.",
    )
    parser.add_argument(
        "--config",
        help="Path to an AccessiMed CLI config file. Defaults to .accessimed.toml in the current directory.",
    )
    parser.add_argument("--no-color", action="store_true", help="Disable colorized terminal output.")
    subparsers = parser.add_subparsers(dest="surface", required=True)

    init_parser = subparsers.add_parser("init", help="Create a starter .accessimed.toml config file.")
    init_parser.add_argument("--path", help="Directory where the config file should be created. Defaults to the current directory.")
    init_parser.add_argument("--force", action="store_true", help="Overwrite an existing config file.")

    config_parser = subparsers.add_parser("config", help="Inspect the current CLI configuration.")
    config_subparsers = config_parser.add_subparsers(dest="action", required=True)
    config_subparsers.add_parser("path", help="Print the config path that AccessiMed will use.")
    config_subparsers.add_parser("show", help="Print the loaded config values as JSON.")

    doctor_parser = subparsers.add_parser("doctor", help="Check runtime dependencies, provider keys, and local setup.")
    doctor_parser.add_argument("--json", action="store_true", help="Emit JSON instead of terminal text.")

    code_parser = subparsers.add_parser("code", help="Scan local website code like a developer workflow tool.")
    code_subparsers = code_parser.add_subparsers(dest="action", required=True)

    test_parser = code_subparsers.add_parser("test", help="Scan a local static site codebase for accessibility issues.")
    test_parser.add_argument("path", nargs="?", help="Root directory containing HTML files.")
    test_parser.add_argument("--json", action="store_true", help="Emit JSON instead of terminal text.")

    fix_parser = code_subparsers.add_parser("fix", help="Generate and optionally apply fixes to a local codebase.")
    fix_parser.add_argument("path", nargs="?", help="Root directory containing HTML files.")
    fix_parser.add_argument("--apply", action="store_true", help="Apply exact-match fixes in place.")
    fix_parser.add_argument(
        "--finding",
        type=int,
        help="Only operate on one finding index from the code test output.",
    )
    fix_parser.add_argument(
        "--provider",
        choices=PROVIDER_CHOICES,
        help="Choose remediation mode: local (deterministic), auto, openai, or anthropic.",
    )
    fix_parser.add_argument("--json", action="store_true", help="Emit JSON instead of terminal text.")
    return parser


def use_color() -> bool:
    return os.getenv("NO_COLOR") is None


def colorize(text: str, severity: str) -> str:
    if not use_color():
        return text
    color = SEVERITY_STYLES.get(severity, {}).get("color", "")
    return f"{color}{text}{RESET}" if color else text


def summarize_issue(finding: dict[str, str | float]) -> str:
    rule_id = str(finding["rule_id"])
    if rule_id in ISSUE_SUMMARIES:
        return ISSUE_SUMMARIES[rule_id]
    description = str(finding.get("description") or "").strip()
    help_text = str(finding.get("help_text") or "").strip()
    return description or help_text or rule_id


def render_terminal_report(findings: list[dict[str, str | float]], root: Path) -> None:
    print(f"AccessiMed code scan for {root}")
    counts: dict[str, int] = {}
    for finding in findings:
        severity = str(finding["severity"])
        counts[severity] = counts.get(severity, 0) + 1

    summary_parts = []
    for severity in ("Critical", "High", "Medium", "Low"):
        count = counts.get(severity, 0)
        if count:
            icon = SEVERITY_STYLES[severity]["icon"]
            summary_parts.append(colorize(f"{icon} {count} {severity}", severity))

    print(f"Findings: {len(findings)}" + (f"  {' | '.join(summary_parts)}" if summary_parts else ""))
    for finding in findings:
        severity = str(finding["severity"])
        severity_score = float(finding["severity_score"])
        icon = SEVERITY_STYLES.get(severity, {}).get("icon", "•")
        issue = summarize_issue(finding)
        source_file = Path(str(finding["source_file"])).resolve()
        location = source_file.relative_to(root.parent) if root.parent in source_file.parents or source_file == root.parent else source_file.name
        badge = colorize(f"{icon} {severity} {severity_score:.1f}", severity)
        print(f"{badge}  #{finding['finding_index']}  {issue}")
        print(f"   {location} :: {finding['target']}")


def resolve_root(path_argument: str | None, cli_config: CliConfig) -> Path:
    if path_argument:
        return Path(path_argument).expanduser().resolve()
    if cli_config.root is not None:
        return cli_config.root
    raise ValueError("No path provided. Pass a path or set accessimed.root in .accessimed.toml.")


def build_settings(cli_config: CliConfig, provider_override: str | None = None) -> Settings:
    settings = Settings()
    settings.max_pages = cli_config.max_pages
    settings.enable_playwright = cli_config.enable_playwright
    if cli_config.openai_model:
        settings.openai_model = cli_config.openai_model
    if cli_config.anthropic_model:
        settings.anthropic_model = cli_config.anthropic_model
    settings.remediation_provider = provider_override or cli_config.remediation_provider or "local"
    settings.ensure_runtime_dirs()
    return settings


def doctor_payload(settings: Settings, config_path: Path, cli_config: CliConfig) -> dict[str, object]:
    return {
        "python_version": sys.version.split()[0],
        "config_path": str(config_path),
        "config_exists": config_path.exists(),
        "resolved_root": str(cli_config.root) if cli_config.root else None,
        "remediation_provider": settings.remediation_provider,
        "playwright_installed": shutil.which("playwright") is not None,
        "openai_key_configured": bool(settings.openai_api_key),
        "anthropic_key_configured": bool(settings.anthropic_api_key),
    }


def render_doctor(payload: dict[str, object]) -> None:
    checks = [
        ("Config file", "ok" if payload["config_exists"] else "missing", payload["config_path"]),
        ("Python", "ok", payload["python_version"]),
        ("Playwright CLI", "ok" if payload["playwright_installed"] else "missing", "playwright"),
        ("Provider mode", "ok", payload["remediation_provider"]),
        ("OpenAI key", "ok" if payload["openai_key_configured"] else "missing", "configured via ACCESSIMED_OPENAI_API_KEY"),
        ("Anthropic key", "ok" if payload["anthropic_key_configured"] else "missing", "configured via ACCESSIMED_ANTHROPIC_API_KEY"),
    ]
    for label, status, detail in checks:
        prefix = "✓" if status == "ok" else "!"
        print(f"{prefix} {label}: {detail}")


def handle_init(args: argparse.Namespace) -> int:
    target_dir = Path(args.path).expanduser().resolve() if args.path else Path.cwd()
    target_dir.mkdir(parents=True, exist_ok=True)
    config_path = target_dir / default_config_path(target_dir).name
    if config_path.exists() and not args.force:
        print(f"Config already exists at {config_path}. Use --force to overwrite.")
        return 2
    config_path.write_text(render_default_config(root=target_dir), encoding="utf-8")
    print(f"Created {config_path}")
    print("Next steps:")
    print("1. Set accessimed.root if your codebase lives in a different folder.")
    print("2. Choose remediation_provider = \"local\" for deterministic fixes or \"auto\" to use configured LLM keys.")
    print("3. Run `accessimed doctor` to verify your setup.")
    return 0


def handle_config_path(config_path: Path) -> int:
    print(config_path)
    return 0


def handle_config_show(cli_config: CliConfig, config_path: Path) -> int:
    payload = {
        "config_path": str(config_path),
        "config_exists": config_path.exists(),
        "root": str(cli_config.root) if cli_config.root else None,
        "remediation_provider": cli_config.remediation_provider,
        "max_pages": cli_config.max_pages,
        "enable_playwright": cli_config.enable_playwright,
        "openai_model": cli_config.openai_model,
        "anthropic_model": cli_config.anthropic_model,
    }
    print(json.dumps(payload, indent=2))
    return 0


def handle_doctor(args: argparse.Namespace, settings: Settings, config_path: Path, cli_config: CliConfig) -> int:
    payload = doctor_payload(settings, config_path, cli_config)
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        render_doctor(payload)
    return 0


async def handle_code_test(args: argparse.Namespace, settings: Settings, cli_config: CliConfig) -> int:
    root = resolve_root(args.path, cli_config)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(root)
    payload = {
        "path": str(root),
        "findings_count": len(findings),
        "findings": findings,
    }
    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        render_terminal_report(findings, root)
    return 1 if findings else 0


async def handle_code_fix(args: argparse.Namespace, settings: Settings, cli_config: CliConfig) -> int:
    root = resolve_root(args.path, cli_config)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(root)
    if args.finding is not None:
        findings = [finding for finding in findings if finding["finding_index"] == args.finding]
        if not findings:
            print(f"Finding #{args.finding} was not found in {root}")
            return 2
    generated = []
    for finding in findings:
        fix = await service.generate_fix(finding)
        generated.append({"finding": finding, "fix": fix})

    payload: dict[str, object] = {
        "path": str(root),
        "findings_count": len(findings),
        "generated_fixes": generated,
    }
    if args.apply:
        if args.finding is not None and findings:
            payload["apply_result"] = await service.apply_single_finding(root, args.finding)
        else:
            payload["apply_result"] = await service.apply_fixes(root, findings)

    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        render_terminal_report(findings, root)
        print(f"Generated fixes: {len(generated)}")
        if args.apply:
            apply_result = payload["apply_result"]
            if args.finding is not None:
                print(f"Applied finding: #{apply_result['finding_index']}")
                print(f"Changed file: {apply_result['source_file']}")
                print(f"Provider: {apply_result['fix']['provider']}")
                if apply_result["changed"]:
                    print("Status: file updated")
                else:
                    print(f"Status: skipped - {apply_result['skipped_reason']}")
            else:
                print(f"Patched files: {apply_result['patched_count']}")
                if apply_result["skipped"]:
                    print("Skipped exact-match replacements:")
                    for item in apply_result["skipped"]:
                        print(f"- {item}")
    if args.apply:
        if args.finding is not None:
            return 0 if payload["apply_result"]["changed"] else 2
        return 0 if payload["apply_result"]["patched_count"] > 0 else (1 if findings else 0)
    return 1 if findings else 0


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.no_color:
        os.environ["NO_COLOR"] = "1"

    config_path = Path(args.config).expanduser().resolve() if args.config else default_config_path()

    if args.surface == "init":
        raise SystemExit(handle_init(args))

    cli_config, resolved_config_path = load_cli_config(config_path)
    provider_override = getattr(args, "provider", None)
    settings = build_settings(cli_config, provider_override=provider_override)

    if args.surface == "config" and args.action == "path":
        raise SystemExit(handle_config_path(resolved_config_path))
    if args.surface == "config" and args.action == "show":
        raise SystemExit(handle_config_show(cli_config, resolved_config_path))
    if args.surface == "doctor":
        raise SystemExit(handle_doctor(args, settings, resolved_config_path, cli_config))
    if args.surface == "code" and args.action == "test":
        raise SystemExit(asyncio.run(handle_code_test(args, settings, cli_config)))
    if args.surface == "code" and args.action == "fix":
        raise SystemExit(asyncio.run(handle_code_fix(args, settings, cli_config)))
    parser.error("Unsupported command.")
