from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from app.core.config import Settings
from app.services.auditor import AuditorService
from app.services.llm import RemediationLlmService
from app.services.local_code import LocalCodeService


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
    fix_parser.add_argument("--json", action="store_true", help="Emit JSON instead of terminal text.")
    return parser


def render_terminal_report(findings: list[dict[str, str | float]], root: Path) -> None:
    print(f"AccessiMed code scan for {root}")
    print(f"Findings: {len(findings)}")
    for finding in findings:
        print(
            f"[{finding['severity']} {finding['severity_score']}] "
            f"{finding['rule_id']} :: {finding['source_file']} :: {finding['target']}"
        )


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
        payload["apply_result"] = await service.apply_fixes(root, findings)

    if args.json:
        print(json.dumps(payload, indent=2))
    else:
        render_terminal_report(findings, root)
        print(f"Generated fixes: {len(generated)}")
        if args.apply:
            apply_result = payload["apply_result"]
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
