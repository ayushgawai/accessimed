# Demo Validation

## Demo assets used

### API demo site

The local website used for backend API validation is:

- [backend/tests/fixtures/site/index.html](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/fixtures/site/index.html)
- [backend/tests/fixtures/site/forms.html](/Users/spartan/Documents/GitHub/AccessiMed/backend/tests/fixtures/site/forms.html)

### Developer workflow demo site

The local codebase used for CLI validation is:

- [demo-site/index.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/index.html)
- [demo-site/appointments.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/appointments.html)
- [demo-site/portal.html](/Users/spartan/Documents/GitHub/AccessiMed/demo-site/portal.html)

## Backend API demo commands

### Start backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --port 8000
```

### Serve local API demo site

```bash
python3 -m http.server 8765 --directory backend/tests/fixtures/site
```

### Run a scan

```bash
curl -X POST http://127.0.0.1:8000/api/v1/scans \
  -H 'Content-Type: application/json' \
  -d '{"url":"http://127.0.0.1:8765/index.html"}'
```

### Generate one remediation

```bash
curl -X POST http://127.0.0.1:8000/api/v1/fixes/single \
  -H 'Content-Type: application/json' \
  -d '{"violation_id":1}'
```

### Generate all remediations

```bash
curl -X POST http://127.0.0.1:8000/api/v1/fixes/bulk \
  -H 'Content-Type: application/json' \
  -d '{"scan_id":"<scan-id>"}'
```

## Developer workflow demo commands

```bash
cd backend
source .venv/bin/activate
accessimed code test ../demo-site
accessimed code fix ../demo-site --apply
```

Recommended public demo sites are listed in:

- [docs/live-demo-sites.md](/Users/spartan/Documents/GitHub/AccessiMed/docs/live-demo-sites.md)

## What the demo proves

- backend starts cleanly
- live crawl and audit work
- real findings are returned
- PDF report generation works
- remediation generation works without provider keys
- severity scoring is visible
- local CLI workflow works for developers
- controlled local code updates are possible on a static demo site

## What the demo does not prove yet

- Anthropic output quality on your real key
- OpenAI output quality on your real key
- remediation against a large production healthcare codebase
- framework-aware source patching for arbitrary app architectures

## About code updates

AccessiMed currently supports two update surfaces:

1. remediation snippets returned by the backend fix endpoints
2. local code remediation through the CLI for exact-match static HTML updates

It does **not** blindly patch arbitrary third-party website source code from scraped DOM alone. That would be unsafe and hard to defend technically.
