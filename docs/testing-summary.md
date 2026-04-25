# Testing Summary

## Date

April 25, 2026

## Automated tests

Command run:

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Result:

```text
7 passed
```

Covered areas:

- health endpoint
- scan endpoint end to end
- PDF report download
- single-fix generation
- bulk-fix generation
- deterministic remediation utilities
- contrast scoring utility
- local code scanning
- local code fix application flow

Test files:

- [backend/tests/test_api.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/test_api.py)
- [backend/tests/test_services.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/test_services.py)
- [backend/tests/test_local_code.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/test_local_code.py)

## Live API smoke test

I ran the backend with `uvicorn` and exercised the API manually.

Verified:

- `GET /api/v1/health` returned `200`
- `POST /api/v1/scans` completed successfully
- findings were persisted
- PDF report download returned `application/pdf`
- `POST /api/v1/fixes/single` returned a remediation
- `POST /api/v1/fixes/bulk` returned remediations for all violations

Observed live website scan result:

- pages scanned: `2`
- violations found: `8`

## Playwright runtime path

Chromium was installed with:

```bash
cd backend
source .venv/bin/activate
playwright install chromium
```

The live smoke test used the browser-enabled scan path and returned real axe-core findings.

## CLI verification

I also ran the local CLI workflow against the included demo site:

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site --json
```

Observed CLI result:

- findings detected: `12`
- severity values returned in output
- exit code: `1` when findings exist

That makes the CLI usable in a developer or CI workflow.

## What is working now

- backend API boots successfully
- database tables are created automatically
- live website scan workflow runs
- crawl and audit run on a real site
- PDF report generation works
- deterministic remediation works
- bulk remediation works
- severity scoring is returned in findings
- local CLI scan works
- local CLI apply flow works for exact-match static HTML cases

## What is credential-dependent

These provider-backed paths are implemented but were not executed against your personal keys because no credentials were provided:

- Anthropic remediation path
- OpenAI remediation path

## How AI works right now

The remediation service has three effective modes:

1. `Anthropic mode`
   Used only when `ACCESSIMED_ANTHROPIC_API_KEY` is set.
2. `OpenAI mode`
   Used when Anthropic is unavailable and `ACCESSIMED_OPENAI_API_KEY` is set.
3. `Deterministic fallback mode`
   Used when no provider key is configured or an API call fails.

The deterministic path covers:

- missing alt text
- missing labels
- empty button names
- empty link names
- missing `lang`
- low contrast inline styles

## Compliance scope implemented

The backend audits WCAG-oriented issues through:

- axe-core browser audit when available
- heuristic fallback checks for demo reliability

Current implemented rules focus on the most common issues:

- image alt text
- form labels
- button accessible names
- link accessible names
- document language
- color contrast

## Honest note

This is a strong hackathon backend and demo-ready implementation, but it is not a full legal compliance certification engine for every WCAG 2.1 AA criterion. It is a practical accessibility audit and remediation platform centered on the most important workflows.
