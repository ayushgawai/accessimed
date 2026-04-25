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
        for index, finding in enumerate(findings, start=1):
            finding["finding_index"] = index
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

    async def apply_single_finding(self, root: Path, finding_index: int) -> dict[str, object]:
        findings = self.scan_path(root)
        finding = next((item for item in findings if item["finding_index"] == finding_index), None)
        if finding is None:
            raise ValueError(f"Finding {finding_index} not found.")
        return await self.apply_finding(finding)

    async def apply_finding(self, finding: dict[str, str | float]) -> dict[str, object]:
        source_file = Path(str(finding["source_file"]))
        content = source_file.read_text(encoding="utf-8")
        fix = await self.generate_fix(finding)
        original_html = str(finding["html"])

        result: dict[str, object] = {
            "finding_index": finding["finding_index"],
            "source_file": source_file.as_posix(),
            "changed": False,
            "skipped_reason": None,
            "fix": fix,
        }

        if fix["fixed_html"] == original_html:
            result["skipped_reason"] = "Generated fix did not change the source snippet."
            return result

        if content.count(original_html) != 1:
            result["skipped_reason"] = "Exact-match replacement was ambiguous in this file."
            return result

        updated = content.replace(original_html, str(fix["fixed_html"]), 1)
        if updated == content:
            result["skipped_reason"] = "No file content changed after applying the fix."
            return result

        source_file.write_text(updated, encoding="utf-8")
        result["changed"] = True
        return result

    async def apply_fixes(self, root: Path, findings: list[dict[str, str | float]]) -> dict[str, list[str] | int]:
        patched_files: set[str] = set()
        skipped: list[str] = []
        for finding in findings:
            result = await self.apply_finding(finding)
            if result["changed"]:
                patched_files.add(str(result["source_file"]))
            else:
                skipped.append(f"{result['source_file']}:{finding['rule_id']}")

        return {
            "patched_files": sorted(patched_files),
            "skipped": sorted(skipped),
            "patched_count": len(patched_files),
        }
