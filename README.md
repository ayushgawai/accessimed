# AccessiMed

AccessiMed is a WCAG-focused accessibility platform for healthcare websites. It combines a live website scanner with a developer workflow so teams can move from findings to reviewable fixes without leaving their normal engineering process.

## What it does

AccessiMed supports two connected workflows:

1. `Website scan workflow`
   Enter a live healthcare website URL, scan up to 5 pages, group issues by severity, generate AI fix previews, and download a PDF report.
2. `Developer workflow`
   Run a local CLI against a website codebase, surface severity-scored issues in terminal output, and optionally apply one safe exact-match fix at a time so the result shows up as a normal Git diff.

That makes the product closer to a Snyk-style workflow for accessibility than a report-only scanner.

## Current product surface

- React/Vite frontend for scan, dashboard, and remediation preview
- FastAPI backend for scanning, reporting, and fix generation
- Playwright + axe-core accessibility auditing
- Severity model: `Critical`, `High`, `Medium`, `Low`
- OpenAI-first remediation with Anthropic fallback
- SQLite persistence for scans, violations, and generated fixes
- PDF report generation
- CLI and local-code API for developer workflow usage

## Severity model

| Level | Score Range | Description |
|---|---:|---|
| Critical | 9.0 - 10.0 | High impact, low complexity; immediate fix recommended |
| High | 7.0 - 8.9 | Significant accessibility risk and likely user harm |
| Medium | 4.0 - 6.9 | Important issue but narrower in scope |
| Low | 0.0 - 3.9 | Lower impact or harder to trigger consistently |

Examples in the current rule mapping:

- missing image alt text -> `Critical 9.4`
- missing form labels -> `High 8.1`
- empty buttons -> `High 7.8`
- empty links -> `High 7.7`
- low contrast -> `High 7.5`
- missing `lang` attribute -> `Medium 4.8`

## Repository structure

```text
AccessiMed/
  backend/      FastAPI API, CLI, scan services, persistence, tests
  frontend/     React/Vite product UI
  demo-site/    intentionally inaccessible healthcare site for CLI and local remediation demos
  docs/         demo guide, testing summary, architecture notes, diagram prompts
```

## Architecture at a glance

### Frontend

- `frontend/src/pages/AboutPage.jsx`
- `frontend/src/pages/ScanPage.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/services/scanService.js`

### Backend

- `backend/app/api/routes.py`
- `backend/app/services/crawler.py`
- `backend/app/services/auditor.py`
- `backend/app/services/scan.py`
- `backend/app/services/fixes.py`
- `backend/app/services/local_code.py`
- `backend/app/services/llm.py`
- `backend/app/cli.py`

### Data

- `scans`
- `violations`
- `fixes`

## Quick start

### 1. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
playwright install chromium
```

Create the backend environment file:

```bash
cp .env.example .env
```

Supported variables:

```env
ACCESSIMED_OPENAI_API_KEY=
ACCESSIMED_OPENAI_MODEL=gpt-5
ACCESSIMED_ANTHROPIC_API_KEY=
ACCESSIMED_ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Runtime behavior:

- try `OpenAI` first
- if OpenAI fails or rate-limits, fall back to `Anthropic`
- if both are unavailable, use deterministic fallback rules

Start the backend:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend docs:

- `http://127.0.0.1:8000/api/v1/docs`

### 2. Frontend setup

```bash
cd frontend
npm install
```

Optional frontend env:

```bash
echo 'VITE_API_URL=http://127.0.0.1:8000' > .env.local
```

Start the frontend:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

### 3. Open the app

- frontend: `http://127.0.0.1:5173`
- backend: `http://127.0.0.1:8000`

## Website scan flow

1. Open `/scan`
2. Enter a public website URL
3. Choose `1-5` pages
4. Start scan
5. Review severity summary
6. Open dashboard
7. Generate a fix preview for a specific finding
8. Download the PDF report

The frontend is wired to these backend endpoints:

- `GET /api/v1/health`
- `POST /api/v1/scans`
- `GET /api/v1/scans/{scan_id}`
- `GET /api/v1/scans/{scan_id}/report`
- `POST /api/v1/fixes/single`

## CLI workflow

The CLI is the developer-facing workflow.

Activate the backend venv first:

```bash
cd backend
source .venv/bin/activate
```

### Scan a local codebase

```bash
accessimed code test ../demo-site
```

What it does:

- scans local HTML files
- prints numbered findings in the terminal
- groups them by severity
- exits with status `1` when issues exist

### Apply one specific fix

If the scan output shows a finding like `#7`, apply only that finding:

```bash
accessimed code fix ../demo-site --finding 7 --apply
```

That writes a single file change into the working tree, which means the developer can immediately inspect it with:

```bash
git diff
```

For demos, use a fresh temp copy before applying a finding. Finding numbers can shift after a fix is applied.

### Apply many exact-match fixes

```bash
accessimed code fix ../demo-site --apply
```

This is intentionally conservative:

- exact-match replacements only
- skips ambiguous replacements
- does not pretend to rewrite arbitrary frameworks safely

## Local code API workflow

These endpoints support the same developer flow over HTTP:

- `POST /api/v1/local/code/scan`
- `POST /api/v1/local/code/apply`

Example scan:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/local/code/scan \
  -H 'Content-Type: application/json' \
  -d '{"path":"/absolute/path/to/site"}'
```

Apply one finding:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/local/code/apply \
  -H 'Content-Type: application/json' \
  -d '{"path":"/absolute/path/to/site","finding_index":7}'
```

## Demo assets

- local code demo: [demo-site/README.md](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/README.md)
- full demo script: [docs/complete-demo-guide.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/complete-demo-guide.md)
- live demo website shortlist: [docs/live-demo-sites.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/live-demo-sites.md)

## Diagram support docs

- workflow explainer: [docs/accessimed-workflow.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/accessimed-workflow.md)
- architecture explainer: [docs/technical-architecture.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/technical-architecture.md)
- workflow diagram prompt: [docs/workflow-diagram-prompt.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/workflow-diagram-prompt.md)
- architecture diagram prompt: [docs/system-architecture-diagram-prompt.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/system-architecture-diagram-prompt.md)

## Validation

Latest checked state:

- backend automated tests: `9 passed`
- frontend production build: `passed`
- local demo-site scan: `passed`
- single-fix generation: `passed`
- local single-finding apply: `passed`
- public healthcare website scan: `passed`

Detailed notes:

- [docs/testing-summary.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/testing-summary.md)
- [docs/demo-validation.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/demo-validation.md)

## Honest boundaries

AccessiMed is strong for demo, prototyping, and hackathon evaluation, but it is not claiming every enterprise feature yet.

Current boundaries:

- local code auto-apply is designed for static HTML and controlled exact-match edits
- live public-site scanning is the strongest workflow today
- provider-backed remediation can still be affected by external model rate limits
- OpenAI is primary, Anthropic is the fallback path

Those boundaries are deliberate. They keep the product honest while still demonstrating a complete end-to-end workflow.
