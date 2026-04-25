# Prompt For Claude Or Gemini

Create a clean enterprise-style system architecture diagram for a project named **AccessiMed**.

The diagram should be presentation-ready for a hackathon judging panel and should look polished, modern, and easy to understand in under 10 seconds. Use a white background, teal and slate accents, clean arrows, subtle shadows, and readable labels. Avoid cartoon styling.

Show these layers from top to bottom:

1. **Frontend (React / Vite)**
   Include:
   - Scan Form
   - Results Dashboard
   - Single Fix Modal
   - Severity Summary

2. **Backend API (FastAPI)**
   Include:
   - `POST /api/v1/scans`
   - `GET /api/v1/scans/{scan_id}`
   - `GET /api/v1/scans/{scan_id}/report`
   - `POST /api/v1/fixes/single`
   - `POST /api/v1/fixes/bulk`

3. **Workflow / Service Layer**
   Show:
   - Crawler Service
   - Auditor Service
   - Reporter Service
   - Fix Service
   - Local Code Service
   - CLI Entry Point

   Show the primary scan path as:
   `URL input -> crawl pages -> audit pages -> persist results -> generate PDF report`

   Show the remediation path as:
   `selected violation -> generate fix -> store fix -> expose remediation output`

   Show a separate developer workflow path as:
   `local codebase -> CLI scan -> severity-scored findings -> optional local fix apply`

4. **Persistence Layer**
   Show SQLite with three tables:
   - scans
   - violations
   - fixes

   Visually emphasize lineage:
   `scan -> violations -> fixes`

5. **External Integrations**
   Include:
   - Playwright
   - axe-core
   - Anthropic Claude API
   - OpenAI API

Add side callouts for:
- Async FastAPI architecture
- WCAG 2.1 AA focus
- Heuristic fallback for demo reliability
- Snyk-style CLI workflow for developers
- Migration path from SQLite to PostgreSQL

The final image should feel like a serious enterprise AI system diagram suitable for judges scoring:
- technical architecture
- scalability and performance
- data governance
- functionality and demo readiness

Render the output as a single slide-style architecture diagram, not a poster, not a UI mockup, and not a flowchart with excessive text.
