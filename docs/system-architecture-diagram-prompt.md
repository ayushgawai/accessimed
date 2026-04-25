# System Architecture Diagram Prompt

Create a clean enterprise-style system architecture diagram for a project named **AccessiMed**.

The audience is a hackathon judging panel. The result should be presentation-ready, modern, and easy to understand quickly. Use a light background, teal and slate accents, clean arrows, subtle shadows, and readable labels. Avoid poster clutter and avoid cartoon styling.

Render the output as **one polished slide-style architecture diagram**.

## Main layers to show

### 1. Frontend layer

Label this section:

`React / Vite Frontend`

Include these UI surfaces:

- About / landing page
- Scan page
- Dashboard page
- AI fix preview modal

Optional caption:

`User-facing workflow for scans, review, reports, and remediation previews`

### 2. Backend API layer

Label this section:

`FastAPI Backend`

Show these endpoints:

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`
- `POST /api/v1/fixes/bulk`
- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

### 3. Service layer

Label this section:

`Application Services`

Include:

- Crawler Service
- Auditor Service
- Scan Service
- Reporter Service
- Fix Service
- Local Code Service
- LLM Service
- CLI Entry Point

Show the main scan path:

`URL input -> crawl pages -> audit pages -> persist findings -> generate PDF report`

Show the fix path:

`selected violation -> generate remediation -> store fix -> expose preview`

Show the developer path:

`local codebase -> CLI scan -> finding selection -> exact-match file apply`

### 4. Persistence layer

Label this section:

`SQLite Persistence`

Show three tables:

- `scans`
- `violations`
- `fixes`

Emphasize lineage:

`scan -> violations -> fixes`

### 5. External integrations

Label this section:

`External Tools and Providers`

Include:

- Playwright
- axe-core
- OpenAI API
- Anthropic API

## Side callouts

Add small, tasteful callouts for:

- WCAG 2.1 AA focus
- Severity scoring model
- OpenAI-first with Anthropic fallback
- PDF reporting
- Snyk-style CLI workflow for developers
- Migration path from SQLite to PostgreSQL

## Style constraints

- Keep the diagram clean and not overcrowded
- Use clear directional arrows
- Prefer grouped layers over scattered icons
- Make the frontend and CLI both visible
- Keep text short enough to be readable on one slide
- Make it feel like a serious technical architecture diagram, not a UI mockup
