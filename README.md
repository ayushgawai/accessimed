# AccessiMed

AccessiMed is an accessibility auditing and remediation platform for healthcare websites. It supports two complementary workflows:

- `Website scan workflow`
  Scan a live public website, detect WCAG 2.1 AA issues, store findings, and generate a PDF report plus remediation suggestions.
- `Developer workflow`
  Run a local CLI against a codebase, get severity-scored findings in the terminal, and optionally apply exact-match fixes directly in source files.

That gives us a cleaner story than “automatic GitHub PRs everywhere.” It is much closer to how developer-first platforms like Snyk fit into real workflows.

## Product direction

AccessiMed is meant to make accessibility work actionable instead of report-only:

- discover issues on a live site
- classify them by severity
- generate code-level remediation guidance
- support a CLI-based developer workflow for local code

So the product is now positioned as:

`live website accessibility scanning + Snyk-style developer tooling`

## Repository layout

```text
AccessiMed/
  backend/      FastAPI backend, CLI, scan pipeline, remediation services, tests
  demo-site/    intentionally inaccessible healthcare site for demos
  docs/         testing summary, validation notes, backend handoff, architecture prompt
```

## What works now

- FastAPI backend with async request handling
- live website scanning
- browser audit with Playwright + axe-core
- heuristic fallback checks for reliability
- SQLite persistence
- PDF report generation
- single-fix and bulk-fix APIs
- Anthropic and OpenAI provider support for remediation generation
- local CLI for developer workflow usage
- exact-match in-place fixes for controlled static HTML codebases
- automated tests and live smoke-tested flows

## Severity model

AccessiMed reports issues using a Snyk-style severity band:

| Level | Score Range | Meaning |
|---|---:|---|
| Critical | 9.0 - 10.0 | High impact, low complexity; immediate fix recommended |
| High | 7.0 - 8.9 | Significant accessibility risk and likely user harm |
| Medium | 4.0 - 6.9 | Important issue but narrower in impact or scope |
| Low | 0.0 - 3.9 | Lower impact or harder to trigger consistently |

Current example mappings:

- missing image alt text -> `Critical 9.4`
- missing form labels -> `High 8.1`
- empty buttons -> `High 7.8`
- empty links -> `High 7.7`
- low contrast -> `High 7.5`
- missing `lang` -> `Medium 4.8`

## Architecture

The backend is intentionally small and service-oriented.

- `backend/app/api`
  FastAPI endpoints for scans, reports, and fixes
- `backend/app/services/crawler.py`
  page discovery for live websites
- `backend/app/services/auditor.py`
  browser-based and heuristic accessibility auditing
- `backend/app/services/workflow.py`
  LangGraph orchestration of the scan pipeline
- `backend/app/services/fixes.py`
  remediation generation and persistence
- `backend/app/services/llm.py`
  Anthropic and OpenAI provider abstraction
- `backend/app/services/local_code.py`
  local codebase scan and apply workflow for the CLI
- `backend/app/cli.py`
  command-line entrypoint for developer workflow usage

## Setup

### 1. Install dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
playwright install chromium
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Supported provider settings:

- `ACCESSIMED_ANTHROPIC_API_KEY`
- `ACCESSIMED_ANTHROPIC_MODEL`
- `ACCESSIMED_OPENAI_API_KEY`
- `ACCESSIMED_OPENAI_MODEL`

If no provider key is configured, AccessiMed falls back to deterministic remediation rules for the main demo issue types.

### 3. Start the backend

```bash
uvicorn app.main:app --reload --port 8000
```

API docs:

- `http://127.0.0.1:8000/api/v1/docs`

### 4. Run tests

```bash
pytest -q
```

## Backend API

### `GET /api/v1/health`

Health check.

### `POST /api/v1/scans`

Scan a public website.

```json
{
  "url": "https://example.com"
}
```

### `GET /api/v1/scans/{scan_id}`

Fetch stored scan results, including severity-scored violations.

### `GET /api/v1/scans/{scan_id}/report`

Download the PDF report for a scan.

### `POST /api/v1/fixes/single`

Generate or retrieve one remediation.

```json
{
  "violation_id": 12
}
```

### `POST /api/v1/fixes/bulk`

Generate remediations for all violations in a scan.

```json
{
  "scan_id": "scan-uuid"
}
```

## CLI workflow

The CLI is the developer path.

### Scan a local codebase

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
```

JSON output:

```bash
accessimed code test ../demo-site --json
```

Behavior:

- scans local HTML files
- reports findings by severity
- exits with code `1` when findings exist

That exit code makes it useful in CI checks, which is one of the key reasons this workflow is defensible.

### Generate and apply fixes locally

```bash
accessimed code fix ../demo-site --apply
```

Current auto-apply behavior is intentionally conservative:

- only exact one-time HTML matches are replaced automatically
- ambiguous cases are left for manual review

## Demo flows

### 1. Public website demo

Use a real public site and show:

1. enter website URL
2. run scan
3. show severity-scored findings
4. download PDF report
5. show one generated remediation

### 2. Developer workflow demo

Use the included [demo-site/README.md](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/README.md):

1. run `accessimed code test ../demo-site`
2. show findings and severity levels
3. run `accessimed code fix ../demo-site --apply`
4. show the updated source files

This is a much stronger story than promising blind repo automation.

## Verification

Artifacts:

- [docs/testing-summary.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/testing-summary.md)
- [docs/demo-validation.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/demo-validation.md)
- [docs/ayush-backend-guide.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/ayush-backend-guide.md)

Most recent automated result:

```text
7 passed
```

Live-verified in this repo:

- backend startup
- website scan flow
- PDF report generation
- single-fix flow
- bulk-fix flow
- local CLI scan flow against the demo site

## Why this Snyk-style direction is possible

Yes, this direction is completely reasonable. Based on Snyk’s official docs, their platform is heavily centered around CLI, IDE, and CI/CD integrations so developers can test code locally and in pipelines, not only after deployment. We are applying that same workflow idea to accessibility scanning and remediation.

Sources:

- Snyk CLI getting started: https://docs.snyk.io/cli-ide-and-ci-cd-integrations/snyk-cli/getting-started-with-the-snyk-cli
- Snyk CLI, IDE, and CI/CD integrations overview: https://docs.snyk.io/cli-ide-and-ci-cd-integrations

## Current boundaries

This repo is demo-ready, not full production software yet.

Not in scope yet:

- auth and multi-tenant access control
- queue-based background execution
- framework-aware source patching beyond static exact-match edits
- full WCAG certification coverage across every rule and edge case
