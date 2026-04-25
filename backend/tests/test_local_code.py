from pathlib import Path

from app.core.config import Settings
from app.services.auditor import AuditorService
from app.services.llm import RemediationLlmService
from app.services.local_code import LocalCodeService


def test_local_code_scan_finds_demo_issues(demo_site_root: Path):
    settings = Settings(enable_playwright=False, openai_api_key=None, anthropic_api_key=None)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(demo_site_root)

    assert findings
    assert any(finding["rule_id"] == "image-alt" for finding in findings)
    assert any(finding["severity"] == "Critical" for finding in findings)
    assert all("source_file" in finding for finding in findings)


async def test_local_code_fix_apply_updates_files(tmp_path: Path, demo_site_root: Path):
    target = tmp_path / "demo-site"
    target.mkdir()
    for source in demo_site_root.glob("*.html"):
        (target / source.name).write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
    (target / "styles.css").write_text((demo_site_root / "styles.css").read_text(encoding="utf-8"), encoding="utf-8")

    settings = Settings(enable_playwright=False, openai_api_key=None, anthropic_api_key=None)
    service = LocalCodeService(AuditorService(settings), RemediationLlmService(settings))
    findings = service.scan_path(target)
    result = await service.apply_fixes(target, findings)

    assert result["patched_count"] >= 1
    updated_index = (target / "index.html").read_text(encoding="utf-8")
    assert 'aria-label="Button action"' in updated_index or 'alt="Descriptive image text"' in updated_index
