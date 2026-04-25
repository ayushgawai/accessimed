from __future__ import annotations

from io import BytesIO
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.core.config import Settings


class ReporterService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def build_report(self, scan_id: str, url: str, findings: list[dict[str, str]]) -> Path:
        buffer = BytesIO()
        document = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()

        rows = [["Rule", "Impact", "Page", "Element"]]
        for finding in findings:
            rows.append(
                [
                    finding["rule_id"],
                    finding["impact"],
                    finding["page_url"],
                    finding["target"],
                ]
            )

        summary_table = Table(rows, repeatRows=1, colWidths=[95, 70, 220, 110])
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f766e")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )

        story = [
            Paragraph("AccessiMed WCAG 2.1 AA Report", styles["Title"]),
            Spacer(1, 12),
            Paragraph(f"Scan ID: {scan_id}", styles["BodyText"]),
            Paragraph(f"Target URL: {url}", styles["BodyText"]),
            Paragraph(f"Total violations: {len(findings)}", styles["BodyText"]),
            Spacer(1, 12),
            summary_table,
        ]
        document.build(story)

        report_path = self.settings.report_dir / f"{scan_id}.pdf"
        report_path.write_bytes(buffer.getvalue())
        return report_path
