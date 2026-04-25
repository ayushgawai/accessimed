# AccessiMed Workflow

This document explains AccessiMed in plain language.

## What AccessiMed is

AccessiMed is an accessibility workflow tool for healthcare websites.

It helps with two different but related jobs:

1. `Find problems on a live website`
2. `Help developers review and apply fixes inside the codebase`

## Workflow 1: live website scan

This is the compliance and discovery side.

### Step 1

A user enters a public healthcare website URL.

### Step 2

AccessiMed crawls a small number of key pages, up to 5.

### Step 3

Each page is analyzed for WCAG accessibility issues using browser-based automation and rule checks.

### Step 4

The issues are grouped into `Critical`, `High`, `Medium`, and `Low`.

### Step 5

The frontend dashboard shows:

- total pages scanned
- total issues found
- severity breakdown
- issue details
- AI remediation previews

### Step 6

The team can download a PDF report for sharing or documentation.

## Workflow 2: developer remediation flow

This is the engineering side.

### Step 1

A developer runs the CLI on a local website codebase.

### Step 2

The CLI scans HTML files and prints numbered findings in the terminal.

### Step 3

The developer chooses a specific finding to fix.

### Step 4

AccessiMed generates a suggested HTML remediation.

### Step 5

The developer can apply one exact-match fix directly to a file.

### Step 6

The result appears as a normal file change, which means the developer can review it in Git with `git diff`.

## Why the product story works

AccessiMed is not only a scanner.

It also provides a developer workflow:

- scan
- prioritize
- preview a fix
- apply a local change
- review it in Git

That is why the Snyk comparison works at the workflow level.

## Simple mental model

If someone asks what AccessiMed does, the simplest explanation is:

“AccessiMed finds accessibility issues on healthcare websites, explains what matters most, and helps developers move those findings into reviewable code changes.”
