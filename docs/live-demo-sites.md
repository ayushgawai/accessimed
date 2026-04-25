# Live Demo Site Shortlist

## Date tested

April 25, 2026

## Best live demo choices

These were tested against the running AccessiMed backend and returned usable results.

### 1. Providence

URL:

`https://www.providence.org/`

Why it is strong:

- recognizable healthcare brand
- scan completed successfully
- high number of findings
- good mix of issue types

Observed result:

- pages scanned: `5`
- total violations: `37`

Best use:

- strongest choice if you want a dramatic “big name, lots of issues” moment

### 2. Stanford Health Care

URL:

`https://stanfordhealthcare.org/`

Why it is strong:

- recognizable healthcare brand
- scan completed successfully
- large number of findings
- good for showing severity variety

Observed result:

- pages scanned: `5`
- total violations: `29`

Best use:

- excellent primary or backup live demo site

### 3. Kaiser Permanente

URL:

`https://healthy.kaiserpermanente.org/front-door`

Why it is usable:

- very recognizable healthcare brand
- scan completed successfully
- decent number of findings

Observed result:

- pages scanned: `5`
- total violations: `11`

Best use:

- good backup if you want a familiar brand name in the demo

### 4. UCSF Health

URL:

`https://www.ucsfhealth.org/`

Why it is usable:

- recognizable academic medical center
- scan completed successfully
- stable enough for demo

Observed result:

- pages scanned: `5`
- total violations: `7`

Best use:

- safer backup when you want a clean, moderate-sized result set

### 5. Mayo Clinic

URL:

`https://www.mayoclinic.org/`

Why it is usable:

- very recognizable healthcare brand
- scan completed successfully
- returned real findings

Observed result:

- pages scanned: `5`
- total violations: `6`

Best use:

- good brand recognition, but fewer findings than Providence or Stanford

## Sites to avoid live

These were blocked or unreliable during testing:

### Cleveland Clinic

- `https://my.clevelandclinic.org/`
- returned `403`

### Johns Hopkins Medicine

- `https://www.hopkinsmedicine.org/`
- returned `403`

### Cedars-Sinai

- `https://www.cedars-sinai.org/`
- returned `403`

## Recommended order for your live demo

### Primary recommendation

1. `https://www.providence.org/`
2. `https://stanfordhealthcare.org/`
3. `https://healthy.kaiserpermanente.org/front-door`

### Safer fallback order

1. `https://www.ucsfhealth.org/`
2. `https://www.mayoclinic.org/`

## Provider note for live fixes

Your current provider behavior is:

- `OpenAI` is tried first
- `Anthropic` is the fallback
- deterministic fixes are the last fallback

Important note:

During testing, your `gpt-5` OpenAI account hit an RPM limit of `3 requests/min`. That means OpenAI is fine for a small number of demo remediation calls, but you should not rely on it for a burst of many fixes in a row during the demo.

Practical guidance:

- use public websites mainly for scan + report + one single fix
- use the CLI demo site for the code workflow
- if OpenAI rate-limits mid-demo, AccessiMed can fall back to Anthropic

## Recommended demo split

### Public website

Use one of the sites above for:

1. enter URL
2. run scan
3. show severity-scored findings
4. download report
5. optionally generate one fix

### Developer workflow

Use the local `demo-site/` codebase for:

1. `accessimed code test ../demo-site`
2. `accessimed code fix ../demo-site --apply`
3. show source-file changes
