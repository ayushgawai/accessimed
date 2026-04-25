# Technical Architecture

This document explains how the current AccessiMed implementation is structured.

## Frontend

The frontend is a React + Vite application.

Main responsibilities:

- accept website scan input
- show scan progress
- render dashboard results
- request AI fix previews
- download PDF reports

Primary files:

- [frontend/src/pages/AboutPage.jsx](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/pages/AboutPage.jsx)
- [frontend/src/pages/ScanPage.jsx](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/pages/ScanPage.jsx)
- [frontend/src/pages/DashboardPage.jsx](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/pages/DashboardPage.jsx)
- [frontend/src/services/scanService.js](/Users/spartan/Documents/GitHub/AccessiMed/frontend/src/services/scanService.js)

## Backend API

The backend is a FastAPI application.

Primary responsibilities:

- accept scan requests
- orchestrate crawl and audit work
- persist results
- generate PDF reports
- generate fix suggestions
- expose local-code workflow endpoints

Primary files:

- [backend/app/main.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/main.py)
- [backend/app/api/routes.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/api/routes.py)

## Service layer

The service layer is intentionally small and modular.

### Crawler service

[backend/app/services/crawler.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/crawler.py)

Discovers up to 5 pages from the provided website.

### Auditor service

[backend/app/services/auditor.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/auditor.py)

Runs accessibility analysis using browser automation and rule evaluation.

### Scan workflow

[backend/app/services/workflow.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/workflow.py)

Coordinates crawl plus audit execution.

### Scan service

[backend/app/services/scan.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/scan.py)

Stores scan results and prepares response payloads.

### Fix service

[backend/app/services/fixes.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/fixes.py)

Generates fix suggestions for stored violations and saves them to the database.

### Local code service

[backend/app/services/local_code.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/local_code.py)

Supports the developer workflow:

- scan local HTML files
- assign finding numbers
- generate fixes
- apply one finding or multiple exact-match fixes

### LLM service

[backend/app/services/llm.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/llm.py)

Handles provider-backed remediation generation:

- OpenAI first
- Anthropic fallback
- deterministic fallback when both are unavailable

### Reporter service

[backend/app/services/reporter.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/services/reporter.py)

Generates PDF outputs from stored scan results.

## Persistence

The current persistence layer uses SQLite.

Tables:

- `scans`
- `violations`
- `fixes`

Relationship:

- one scan has many violations
- one violation can have many fixes

Primary files:

- [backend/app/db/models.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/db/models.py)
- [backend/app/repositories/scans.py](/Users/spartan/Documents/GitHub/AccessiMed/backend/app/repositories/scans.py)

## External dependencies

### Playwright

Used for browser-based page loading and scanning.

### axe-core

Used for core accessibility rule detection.

### OpenAI and Anthropic

Used for remediation suggestions and explanation generation.

## Why the architecture is reasonable for this project

The architecture is intentionally simple:

- frontend is separate from backend
- service layer is modular
- persistence is small and transparent
- CLI and API share the same local remediation logic

That keeps the demo reliable and makes the product easier to explain.
