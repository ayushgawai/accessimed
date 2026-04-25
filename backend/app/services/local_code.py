from __future__ import annotations

from pathlib import Path

from app.services.auditor import AuditorService
from app.services.llm import RemediationLlmService
from app.services.accessibility import deterministic_fix


class LocalCodeService:
    def __init__(self, auditor: AuditorService, llm_service: RemediationLlmService) -> None:
        self.auditor = auditor
        self.llm_service = llm_service

    def scan_path(self, root: Path) -> list[dict[str, str | float]]:
        findings: list[dict[str, str | float]] = []
        for file_path in sorted(root.rglob("*.html")):
            html = file_path.read_text(encoding="utf-8")
            file_findings = self.auditor.audit_html_content(html, file_path.as_posix())
            for finding in file_findings:
                finding["source_file"] = file_path.as_posix()
            findings.extend(file_findings)
        return findings

    async def generate_fix(self, finding: dict[str, str | float]) -> dict[str, str | float]:
        try:
            provider, fixed_html, explanation, confidence = await self.llm_service.generate_fix(finding)
        except Exception:
            fixed_html, explanation, confidence = deterministic_fix(str(finding["rule_id"]), str(finding["html"]))
            provider = "deterministic"
        return {
            "provider": provider,
            "fixed_html": fixed_html,
            "explanation": explanation,
            "confidence": confidence,
        }

    async def apply_fixes(self, root: Path, findings: list[dict[str, str | float]]) -> dict[str, list[str] | int]:
        patched_files: set[str] = set()
        skipped: list[str] = []
        grouped: dict[str, list[dict[str, str | float]]] = {}
        for finding in findings:
            source_file = str(finding["source_file"])
            grouped.setdefault(source_file, []).append(finding)

        for source_file, file_findings in grouped.items():
            file_path = Path(source_file)
            content = file_path.read_text(encoding="utf-8")
            updated = content
            changed = False
            for finding in file_findings:
                fix = await self.generate_fix(finding)
                original_html = str(finding["html"])
                if updated.count(original_html) == 1:
                    updated = updated.replace(original_html, str(fix["fixed_html"]), 1)
                    changed = True
                else:
                    skipped.append(f"{source_file}:{finding['rule_id']}")
            if changed and updated != content:
                file_path.write_text(updated, encoding="utf-8")
                patched_files.add(source_file)

        return {
            "patched_files": sorted(patched_files),
            "skipped": sorted(skipped),
            "patched_count": len(patched_files),
        }
