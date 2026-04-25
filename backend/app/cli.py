from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path

from app.core.config import Settings
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


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="accessimed")
    subparsers = parser.add_subparsers(dest="surface", required=True)

    code_parser = subparsers.add_parser("code", help="Scan local website code like a developer workflow tool.")
    code_subparsers = code_parser.add_subparsers(dest="action", required=True)

    test_parser = code_subparsers.add_parser("test", help="Scan a local static site codebase for accessibility issues.")
    test_parser.add_argument("path", help="Root directory containing HTML files.")
    test_parser.add_argument("--json", action="store_true", help="Emit JSON instead of terminal text.")

    fix_parser = code_subparsers.add_parser("fix", help="Generate and optionally apply fixes to a local codebase.")
    fix_parser.add_argument("path", help="Root directory containing HTML files.")
    fix_parser.add_argument("--apply", action="store_true", help="Apply exact-match fixes in place.")
    fix_parser.add_argument(
        "--finding",
        type=int,
        help="Only operate on one finding index from the code test output.",
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


async def handle_code_test(args: argparse.Namespace, settings: Settings) -> int:
    root = Path(args.path).resolve()
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


async def handle_code_fix(args: argparse.Namespace, settings: Settings) -> int:
    root = Path(args.path).resolve()
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
    return 1 if findings else 0


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    settings = Settings()
    settings.ensure_runtime_dirs()

    if args.surface == "code" and args.action == "test":
        raise SystemExit(asyncio.run(handle_code_test(args, settings)))
    if args.surface == "code" and args.action == "fix":
        raise SystemExit(asyncio.run(handle_code_fix(args, settings)))
    parser.error("Unsupported command.")
