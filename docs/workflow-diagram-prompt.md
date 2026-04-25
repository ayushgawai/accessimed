# Workflow Diagram Prompt

Create a polished slide-style workflow diagram for a project called **AccessiMed**.

The audience is a hackathon judging panel. The diagram should be easy to understand in under 10 seconds, visually clean, modern, and enterprise-ready. Use a white or very light background, teal and slate accents, rounded but restrained containers, subtle shadows, and clear directional arrows. Avoid cartoon styling.

The diagram should show **two parallel workflows** that connect into one product story.

## Workflow 1: live website scan

Show this path left to right:

1. **Healthcare team enters website URL**
2. **AccessiMed crawls up to 5 pages**
3. **Accessibility audit runs**
4. **Issues grouped by severity**
5. **Dashboard shows findings**
6. **PDF report generated**
7. **AI fix preview available**

Use a short label under the flow:

`Live website discovery and compliance reporting`

## Workflow 2: developer remediation workflow

Show this path left to right:

1. **Developer runs CLI on local codebase**
2. **CLI prints numbered findings**
3. **Developer selects one finding**
4. **AccessiMed generates fix suggestion**
5. **One file change is applied locally**
6. **Developer reviews diff in Git**

Use a short label under the flow:

`Snyk-style developer workflow for accessibility remediation`

## Shared product center

Between the two workflows, place a central AccessiMed product block with these short labels:

- WCAG 2.1 AA focus
- Severity scoring
- AI remediation guidance
- Reviewable outputs

## Visual callouts

Add small side callouts for:

- Healthcare websites
- Accessibility findings
- PDF reporting
- Developer CLI
- Git review workflow

## Style requirements

- Make the diagram feel like a product workflow, not a backend-only architecture diagram
- Keep text short and readable
- Use consistent spacing and alignment
- Make the two workflows clearly distinct but obviously part of the same product
- Render the result as one clean presentation slide
