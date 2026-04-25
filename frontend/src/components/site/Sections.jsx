import { useState } from 'react'
import { Button, Section } from './Layout'

const stats = [
  { label: 'Audit time', value: 'Under 5 minutes' },
  { label: 'Scan scope', value: 'Up to 5 pages' },
  { label: 'Fix quality', value: 'AI-guided remediation' },
  { label: 'Dev handoff', value: 'GitHub pull requests' },
]

const workflow = [
  ['Scan Website', 'Enter any healthcare URL and launch an automated multi-page crawl.'],
  ['Detect WCAG Issues', 'axe-core identifies violations with severity and selector context.'],
  ['Review Results', 'See critical, serious, moderate, and minor issues in one control center.'],
  ['Generate AI Fix', 'AccessiMed proposes before/after code with plain-language rationale.'],
  ['Open Pull Request', 'Push fixes into your repo as a reviewable GitHub PR workflow.'],
]

const features = [
  'Multi-page scanning with healthcare-safe defaults',
  'Severity-grouped violation intelligence',
  'Single-click AI remediation previews',
  'Downloadable compliance evidence reports',
  'GitHub-native developer workflow',
  'Audit-ready, accessibility-first interface design',
]

const faqs = [
  ['How long does a scan take?', 'Most scans complete in 10-30 seconds depending on site responsiveness and page complexity.'],
  ['What violations are detected?', 'AccessiMed evaluates WCAG 2.1 A/AA rule sets via axe-core, including contrast, alt text, labels, semantic issues, and more.'],
  ['Can we review fixes before applying?', 'Yes. Every generated fix includes original and updated HTML with explanation before you merge.'],
  ['Does it work with GitHub?', 'Yes. Teams can provide repository credentials to create a branch and open a pull request with fix outputs.'],
  ['Is this interface accessible?', 'Yes. We prioritize semantic structure, keyboard navigation, visible focus states, and contrast-safe color usage.'],
  ['Can healthcare teams use this pre-audit?', 'Absolutely. AccessiMed is designed as a readiness layer before external audits and compliance submissions.'],
]

function HeroSection() {
  return (
    <Section id="platform" className="pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="mb-4 w-fit rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Healthcare Accessibility Compliance
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-textPrimary sm:text-5xl">
            Audit and remediate healthcare website accessibility in minutes.
          </h1>
          <p className="mt-4 max-w-xl text-textSecondary">
            AccessiMed combines automated WCAG scanning, AI-generated fixes, and GitHub-ready workflows to help healthcare organizations move from diagnosis to remediation fast.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="#final-cta">Start Free Scan</Button>
            <Button href="#dashboard" variant="secondary">See Dashboard Preview</Button>
          </div>
          <div className="mt-7 flex flex-wrap gap-2 text-xs">
            {['AI Fixes', 'PDF Reports', 'GitHub PRs', 'WCAG 2.1 AA'].map((pill) => (
              <span key={pill} className="rounded-full border border-secondary/20 bg-surface/70 px-3 py-1 text-textSecondary">{pill}</span>
            ))}
          </div>
        </div>

        <div className="glass-panel section-ring site-grid rounded-2xl p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-textPrimary">AccessiMed Scanner Console</p>
            <span className="rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-xs text-success">Live</span>
          </div>
          <div className="rounded-xl border border-secondary/20 bg-bg/60 p-3">
            <p className="mb-2 text-xs text-textSecondary">Website URL</p>
            <div className="flex gap-2">
              <input readOnly value="https://clinic-example.org" className="w-full rounded-lg border border-secondary/15 bg-surface/80 px-3 py-2 text-sm text-textPrimary" aria-label="URL preview" />
              <button className="min-h-10 rounded-lg bg-primary px-3 text-sm font-semibold text-bg shadow-glow">Scan</button>
            </div>
            <div className="mt-3 h-2 rounded-full bg-surface">
              <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-primary to-secondary bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-textSecondary">
            {['Playwright', 'axe-core', 'Claude', 'GitHub'].map((t) => (
              <span key={t} className="rounded-md border border-secondary/20 bg-surface px-2 py-1">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}

function StatsBand() {
  return (
    <Section id="proof" className="py-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="glass-panel section-ring rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-textSecondary">{stat.label}</p>
            <p className="mt-2 font-display text-lg font-semibold text-textPrimary">{stat.value}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function ComplianceSection() {
  return (
    <Section
      id="compliance"
      eyebrow="Why It Matters"
      title="Compliance pressure is rising. Manual remediation cannot keep up."
      subtitle="Healthcare organizations need accessibility outcomes, not static reports that stall implementation."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <article className="glass-panel rounded-2xl p-6">
          <p className="text-sm font-semibold text-danger">Regulatory urgency</p>
          <p className="mt-2 text-textSecondary">WCAG conformance is now business-critical for digital healthcare properties.</p>
          <ul className="mt-4 space-y-2 text-sm text-textSecondary">
            <li>- Manual audits are expensive and slow.</li>
            <li>- Engineering teams receive static PDFs without implementation path.</li>
            <li>- Compliance teams need evidence and remediation traceability.</li>
          </ul>
        </article>
        <article className="glass-panel rounded-2xl p-6">
          <p className="text-sm font-semibold text-success">AccessiMed approach</p>
          <p className="mt-2 text-textSecondary">Transform accessibility findings into actionable, reviewable code changes.</p>
          <div className="mt-4 space-y-3 text-sm">
            {['Scan and classify issues', 'Generate AI code remediation', 'Export audit-ready PDF', 'Open GitHub PR for engineering review'].map((line) => (
              <div key={line} className="rounded-lg border border-secondary/15 bg-bg/50 px-3 py-2 text-textSecondary">{line}</div>
            ))}
          </div>
        </article>
      </div>
    </Section>
  )
}

function WorkflowSection() {
  return (
    <Section id="workflow" eyebrow="How It Works" title="A precise workflow from scan to pull request">
      <div className="grid gap-4 md:grid-cols-5">
        {workflow.map(([title, desc], idx) => (
          <article key={title} className="relative glass-panel rounded-xl p-4 transition hover:-translate-y-1 hover:border-secondary/30">
            <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-secondary/25 bg-bg/70 text-xs font-semibold text-secondary">
              {idx + 1}
            </span>
            <h3 className="text-sm font-semibold text-textPrimary">{title}</h3>
            <p className="mt-2 text-xs text-textSecondary">{desc}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function FeatureGridSection() {
  return (
    <Section id="features" eyebrow="Platform" title="Built for healthcare teams and developer velocity">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map((item) => (
          <article key={item} className="glass-panel rounded-xl p-5 transition hover:-translate-y-1 hover:shadow-panel">
            <p className="text-sm font-semibold text-textPrimary">{item}</p>
            <p className="mt-2 text-sm text-textSecondary">Designed for high-trust environments where accessibility and auditability both matter.</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function DashboardPreviewSection() {
  const rows = [
    ['critical', 'color-contrast', 'Text below 4.5:1 ratio', '.hero-subtitle'],
    ['serious', 'label', 'Form control missing accessible label', 'input[name="patientName"]'],
    ['moderate', 'image-alt', 'Image missing alternative text', '.clinic-logo'],
  ]
  const tone = { critical: 'text-danger', serious: 'text-warning', moderate: 'text-secondary', minor: 'text-success' }

  return (
    <Section id="dashboard" eyebrow="Dashboard Preview" title="Severity-focused remediation workspace">
      <div className="glass-panel rounded-2xl p-5">
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          {['Critical 3', 'Serious 7', 'Moderate 11', 'Minor 6'].map((kpi) => (
            <div key={kpi} className="rounded-lg border border-secondary/15 bg-bg/60 px-3 py-2 text-sm text-textPrimary">{kpi}</div>
          ))}
        </div>
        <div className="space-y-3">
          {rows.map(([severity, rule, description, selector]) => (
            <article key={rule} className="rounded-xl border border-secondary/15 bg-bg/55 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`rounded-full border border-current/30 px-2 py-0.5 text-xs font-semibold ${tone[severity]}`}>{severity}</span>
                  <span className="font-mono text-textSecondary">{rule}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button className="rounded-md border border-secondary/20 px-2 py-1 text-textSecondary hover:text-textPrimary">View Details</button>
                  <button className="rounded-md border border-secondary/20 px-2 py-1 text-textSecondary hover:text-textPrimary">Copy Selector</button>
                  <button className="rounded-md bg-primary px-2 py-1 font-semibold text-bg">Fix This</button>
                </div>
              </div>
              <p className="mt-2 text-sm text-textPrimary">{description}</p>
              <p className="mt-1 font-mono text-xs text-textSecondary">{selector}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

function AiFixSection() {
  return (
    <Section id="fix-preview" eyebrow="AI Fix Preview" title="Before/after remediation with explainable output">
      <div className="glass-panel rounded-2xl p-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-textSecondary">Original HTML</p>
            <pre className="min-h-44 overflow-auto rounded-xl border border-secondary/20 bg-bg/70 p-4 font-mono text-xs text-danger">{`<img src="/clinic-logo.png">\n<button style="background:red;color:red">Book</button>\n<input placeholder="Patient name">`}</pre>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-textSecondary">Fixed HTML</p>
            <pre className="min-h-44 overflow-auto rounded-xl border border-secondary/20 bg-bg/70 p-4 font-mono text-xs text-success">{`<img src="/clinic-logo.png" alt="AccessiMed Clinic logo">\n<button class="btn-primary" aria-label="Book appointment">Book</button>\n<label for="patientName">Patient name</label>\n<input id="patientName" placeholder="Patient name">`}</pre>
          </div>
        </div>
        <p className="mt-4 rounded-lg border border-secondary/15 bg-surface/55 p-3 text-sm text-textSecondary">
          AI explanation: Added missing alternative text, ensured visible button contrast and label clarity, and associated input with a semantic label to satisfy WCAG guidance.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="rounded-lg border border-secondary/25 px-3 py-2 text-sm text-textSecondary">Copy Fix</button>
          <button className="rounded-lg border border-secondary/25 px-3 py-2 text-sm text-textSecondary">Regenerate</button>
          <button className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-bg">Add to PR</button>
        </div>
      </div>
    </Section>
  )
}

function DevWorkflowSection() {
  const steps = ['Connect Repo', 'Generate Fixes', 'Create Branch', 'Commit Changes', 'Open Pull Request']
  return (
    <Section id="dev-workflow" eyebrow="Developer Workflow" title="GitHub-native remediation pipeline">
      <div className="glass-panel rounded-2xl p-5">
        <ol className="grid gap-3 md:grid-cols-5">
          {steps.map((step, i) => (
            <li key={step} className="rounded-lg border border-secondary/15 bg-bg/60 px-3 py-3 text-sm text-textSecondary">
              <span className="mr-2 text-xs text-secondary">{i + 1}</span>{step}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}

function AccessibilitySection() {
  return (
    <Section id="accessibility" eyebrow="Accessibility-First" title="The interface itself follows accessible design standards">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Keyboard-friendly navigation', 'Visible focus states and contrast-safe palette', 'Semantic headings and landmarks', 'Screen-reader friendly component behaviors'].map((item) => (
          <article key={item} className="glass-panel rounded-xl p-4 text-sm text-textSecondary">
            <p className="font-semibold text-textPrimary">✓ {item}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}

function FaqSection() {
  const [open, setOpen] = useState(0)
  return (
    <Section id="faq" eyebrow="FAQ" title="Answers for compliance and engineering teams">
      <div className="space-y-3">
        {faqs.map(([q, a], idx) => (
          <div key={q} className="glass-panel rounded-xl">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-4 text-left"
              onClick={() => setOpen((v) => (v === idx ? -1 : idx))}
              aria-expanded={open === idx}
            >
              <span className="font-semibold text-textPrimary">{q}</span>
              <span className="text-secondary">{open === idx ? '−' : '+'}</span>
            </button>
            {open === idx && <p className="px-4 pb-4 text-sm text-textSecondary">{a}</p>}
          </div>
        ))}
      </div>
    </Section>
  )
}

function FinalCtaSection() {
  return (
    <Section id="final-cta" className="pb-24">
      <div className="glass-panel section-ring rounded-3xl px-6 py-12 text-center sm:px-12">
        <h2 className="font-display text-3xl font-bold text-textPrimary sm:text-4xl">Get healthcare web compliance moving this week.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-textSecondary">Run a scan, prioritize high-risk issues, and ship AI-assisted fixes through your existing engineering process.</p>
        <div className="mx-auto mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input
            type="url"
            placeholder="https://your-healthcare-site.org"
            className="min-h-12 flex-1 rounded-xl border border-secondary/20 bg-bg/60 px-4 text-textPrimary placeholder:text-textSecondary"
            aria-label="Website URL for scan"
          />
          <button className="min-h-12 rounded-xl bg-primary px-5 font-semibold text-bg shadow-glow">Start Free Scan</button>
        </div>
      </div>
    </Section>
  )
}

export {
  HeroSection,
  StatsBand,
  ComplianceSection,
  WorkflowSection,
  FeatureGridSection,
  DashboardPreviewSection,
  AiFixSection,
  DevWorkflowSection,
  AccessibilitySection,
  FaqSection,
  FinalCtaSection,
}
