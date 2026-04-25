# Complete Demo Guide

## What AccessiMed is

AccessiMed has two demo surfaces:

1. `Website scan workflow`
   Scan a live healthcare website, find accessibility issues, score them by severity, and generate a report plus remediation suggestions.
2. `Developer CLI workflow`
   Run a CLI on a local medical website codebase, surface issues in terminal output, and apply safe fixes for controlled static HTML cases.

This is why the Snyk comparison works:

- Snyk scans and surfaces issues in the developer workflow
- AccessiMed does that for accessibility, while also scanning deployed websites

## Very important CLI note

If you see:

```bash
zsh: command not found: accessimed
```

that means the CLI is not installed in your current shell.

Use one of these two setups.

### Setup option A: backend virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
playwright install chromium
```

Run CLI commands from there:

```bash
accessimed code test ../demo-site
```

### Setup option B: install into your current environment

From the repo root:

```bash
python3 -m pip install -e ./backend
playwright install chromium
```

Then run:

```bash
accessimed code test demo-site
```

## Environment setup

The backend reads `.env` from `backend/.env`.

Create it with:

```bash
cp backend/.env.example backend/.env
```

Add your keys there:

```env
ACCESSIMED_OPENAI_API_KEY=...
ACCESSIMED_OPENAI_MODEL=gpt-5
ACCESSIMED_ANTHROPIC_API_KEY=...
ACCESSIMED_ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

Provider behavior:

- try OpenAI first
- if OpenAI fails or rate-limits, use Anthropic
- if both fail, use deterministic fallback

## Demo assets

### Local demo codebase

Use:

- [demo-site/index.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/index.html)
- [demo-site/appointments.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/appointments.html)
- [demo-site/portal.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/portal.html)

### Good public healthcare websites for live scan demo

See:

- [docs/live-demo-sites.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/live-demo-sites.md)

Best order:

1. `https://www.providence.org/`
2. `https://stanfordhealthcare.org/`
3. `https://healthy.kaiserpermanente.org/front-door`
4. `https://www.ucsfhealth.org/`
5. `https://www.mayoclinic.org/`

## Demo flow A: website scan

This is the “look, we can scan a real healthcare website” part.

### 1. Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 2. Use the frontend or curl

If frontend is not ready yet, use curl:

```bash
curl -X POST http://127.0.0.1:8000/api/v1/scans \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.providence.org/"}'
```

### 3. What to show

- returned scan id
- pages scanned
- number of violations
- severity levels
- one or two example findings

### 4. Download the PDF report

```bash
curl -O http://127.0.0.1:8000/api/v1/scans/<scan-id>/report
```

### 5. Generate one remediation

```bash
curl -X POST http://127.0.0.1:8000/api/v1/fixes/single \
  -H 'Content-Type: application/json' \
  -d '{"violation_id":<violation-id>}'
```

### What to say

“Here we’re acting like an external compliance scanner. We take a public healthcare website, find WCAG issues, assign severity, and generate a report and fix guidance.”

## Demo flow B: developer CLI workflow

This is the “Snyk-like developer workflow” part.

### 1. Run CLI scan

If using backend virtual environment:

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
```

If installed into the current environment:

```bash
accessimed code test demo-site
```

### What to show

- findings printed in terminal
- severity levels like `Critical`, `High`, `Medium`
- nonzero exit behavior when issues exist

### 2. Run CLI apply

Safer version on a temp copy:

```bash
cp -R demo-site /tmp/accessimed-demo-run
accessimed code fix /tmp/accessimed-demo-run --apply
```

Or from inside backend venv:

```bash
cp -R ../demo-site /tmp/accessimed-demo-run
accessimed code fix /tmp/accessimed-demo-run --apply
```

### 3. Show the code changes

Example:

```bash
diff -u demo-site/index.html /tmp/accessimed-demo-run/index.html
```

### What to say

“Now we’re acting like a developer tool. A team working on a medical website can run our CLI locally, get accessibility findings in their workflow, and apply safe fixes to controlled code.”

## Best full demo sequence

Use this order:

1. Explain the problem
2. Scan a real healthcare website
3. Show findings and severity
4. Download report
5. Generate one fix suggestion
6. Switch to local demo-site code
7. Run CLI scan
8. Run CLI fix apply
9. Show the diff

This sequence is strong because it proves both:

- external website auditing
- internal developer workflow support

## Recommended commands cheat sheet

### Start backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Scan public site

```bash
curl -X POST http://127.0.0.1:8000/api/v1/scans \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://www.providence.org/"}'
```

### Generate one fix

```bash
curl -X POST http://127.0.0.1:8000/api/v1/fixes/single \
  -H 'Content-Type: application/json' \
  -d '{"violation_id":123}'
```

### CLI scan

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
```

### CLI fix apply

```bash
cp -R ../demo-site /tmp/accessimed-demo-run
accessimed code fix /tmp/accessimed-demo-run --apply
```

## Honest language to use with judges

Say:

“AccessiMed is Snyk-like in workflow, not identical in scope. We support both live website scanning and a developer CLI. A developer can run our CLI on a medical website codebase, get severity-scored accessibility findings, and receive remediation guidance directly in their workflow.”

Do not say:

- “we automatically fix every website”
- “we support every frontend framework deeply”
- “we are identical to Snyk”

## If something goes wrong live

### If `accessimed` is not found

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
```

### If OpenAI rate-limits

No panic.

Your backend is already configured to:

- try OpenAI first
- fall back to Anthropic next

### If a public site blocks scanning

Switch quickly to one of the working backups from:

- [docs/live-demo-sites.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/live-demo-sites.md)

### If you need a guaranteed working demo

Use the local `demo-site/` plus the CLI workflow. That is your most reliable path.
