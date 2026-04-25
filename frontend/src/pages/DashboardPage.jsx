import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Section from '../components/ui/Section'
import DashboardSummaryCard from '../components/dashboard/DashboardSummaryCard'
import FilterPanel from '../components/dashboard/FilterPanel'
import ViolationCard from '../components/dashboard/ViolationCard'
import UtilityPanel from '../components/dashboard/UtilityPanel'
import ViolationDetailsModal from '../components/dashboard/ViolationDetailsModal'
import EmptyState from '../components/dashboard/EmptyState'
import { getReportBlob } from '../services/scanService'

const allSeverities = ['critical', 'serious', 'moderate', 'minor']

function formatScanTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString()
}

function DashboardPage() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [selectedSeverities, setSelectedSeverities] = useState(allSeverities)
  const [selectedPage, setSelectedPage] = useState('all')
  const [search, setSearch] = useState('')
  const [unresolvedOnly, setUnresolvedOnly] = useState(false)
  const [detailsViolation, setDetailsViolation] = useState(null)
  const [notice, setNotice] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('accessimed-latest-scan')
      if (!raw) return
      const parsed = JSON.parse(raw)
      const violations = Array.isArray(parsed.violations) ? parsed.violations : []
      const mapped = violations.map((v, idx) => ({
        id: v.id || `${v.violation_id || 'rule'}-${idx}`,
        impact: (v.impact || 'minor').toLowerCase(),
        ruleId: v.violation_id || 'wcag-rule',
        title: v.description || 'Accessibility issue detected',
        description: v.description || 'Accessibility issue detected',
        pageUrl: v.page_url || parsed.siteUrl || 'Unknown page',
        target: Array.isArray(v.target) ? v.target.join(', ') : v.target || 'unknown-selector',
        snippet: v.html || '<div>Issue source unavailable</div>',
        whyItMatters: 'This issue impacts assistive technology support and clinical usability.',
        helpText: v.help || 'Refer to WCAG guidance for remediation details.',
        resolved: false,
        category: 'general',
      }))
      setDashboardData({
        siteUrl: parsed.site_url || parsed.url || 'Unknown site',
        scannedAt: parsed.scanned_at || new Date().toISOString(),
        status: parsed.report_ready ? 'Report ready' : 'Scan complete',
        pagesScanned: parsed.pages_scanned || 0,
        reportReady: Boolean(parsed.report_ready ?? true),
        githubConnected: false,
        scanId: parsed.scan_id,
        source: parsed.source || 'api',
        violations: mapped,
      })
    } catch (_err) {
      setDashboardData(null)
    }
  }, [])

  const pages = useMemo(() => {
    if (!dashboardData) return []
    return [...new Set(dashboardData.violations.map((v) => v.pageUrl))]
  }, [dashboardData])

  const summary = useMemo(() => {
    if (!dashboardData) return { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 }
    return dashboardData.violations.reduce(
      (acc, violation) => {
        acc.total += 1
        acc[violation.impact] = (acc[violation.impact] || 0) + 1
        return acc
      },
      { total: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
    )
  }, [dashboardData])

  const filteredViolations = useMemo(() => {
    if (!dashboardData) return []
    return dashboardData.violations.filter((violation) => {
      const matchesSeverity = selectedSeverities.includes(violation.impact)
      const matchesPage = selectedPage === 'all' || violation.pageUrl === selectedPage
      const matchesSearch = `${violation.title} ${violation.ruleId} ${violation.target}`
        .toLowerCase()
        .includes(search.toLowerCase())
      const matchesResolved = unresolvedOnly ? !violation.resolved : true
      return matchesSeverity && matchesPage && matchesSearch && matchesResolved
    })
  }, [dashboardData, selectedSeverities, selectedPage, search, unresolvedOnly])

  const metadata = useMemo(
    () => ({
      siteUrl: dashboardData?.siteUrl || 'No scan selected',
      scannedAt: formatScanTime(dashboardData?.scannedAt),
      status: dashboardData?.status || 'No data',
    }),
    [dashboardData],
  )

  const toggleSeverity = (level) => {
    setSelectedSeverities((prev) =>
      prev.includes(level) ? prev.filter((s) => s !== level) : [...prev, level],
    )
  }

  const handleCopySelector = async (selector) => {
    try {
      await navigator.clipboard.writeText(selector)
      setNotice('Selector copied to clipboard.')
    } catch (_err) {
      setNotice('Unable to copy selector in this browser.')
    }
  }

  const handleDownloadReport = async () => {
    if (!dashboardData?.scanId || dashboardData?.source === 'mock') {
      setNotice('Report download is available when a live backend scan is connected.')
      return
    }
    try {
      const blob = await getReportBlob(dashboardData.scanId)
      const blobUrl = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', `wcag-report-${dashboardData.scanId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (_err) {
      setNotice('Unable to download report right now.')
    }
  }

  const complianceScore = Math.max(
    0,
    100 - summary.critical * 10 - summary.serious * 6 - summary.moderate * 3 - summary.minor,
  )

  if (!dashboardData) {
    return (
      <Section className="pt-16">
        <EmptyState
          title="No scan selected"
          description="Run a website scan to populate this dashboard with actionable accessibility findings."
          actionLabel="Run New Scan"
          onAction={() => navigate('/scan')}
        />
      </Section>
    )
  }

  return (
    <div>
      <Section
        eyebrow="Accessibility Dashboard"
        title="Review and remediate accessibility violations with confidence"
        subtitle={`Scanned site: ${dashboardData.siteUrl}`}
        className="rounded-3xl bg-light/82"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-secondary/20 bg-surface/45 p-4">
          <div>
            <p className="text-sm text-textSecondary">Last scan: {formatScanTime(dashboardData.scannedAt)}</p>
            <p className="text-xs text-warning">{dashboardData.status}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleDownloadReport} className="min-h-10 rounded-lg border border-secondary/30 px-3 text-sm text-textPrimary">
              Download Report
            </button>
            <button type="button" onClick={() => navigate('/scan')} className="min-h-10 rounded-lg border border-secondary/30 px-3 text-sm text-textPrimary">
              Run New Scan
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardSummaryCard label="Pages scanned" value={dashboardData.pagesScanned} />
          <DashboardSummaryCard label="Total issues" value={summary.total} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Critical', summary.critical, 'critical', 'bg-red-600'],
            ['Serious', summary.serious, 'serious', 'bg-orange-500'],
            ['Moderate', summary.moderate, 'moderate', 'bg-blue-500'],
            ['Minor', summary.minor, 'minor', 'bg-emerald-600'],
          ].map(([label, value, tone, dotClass]) => (
            <div key={label} className="rounded-2xl border border-secondary/25 bg-light/85 p-4 shadow-panel">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-textSecondary">
                <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden />
                {label}
              </p>
              <p className={`mt-2 font-display text-4xl font-semibold ${
                tone === 'critical'
                  ? 'text-danger'
                  : tone === 'serious'
                    ? 'text-deep'
                    : tone === 'moderate'
                      ? 'text-secondary'
                      : 'text-deepSoft'
              }`}>{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-full border border-secondary/20 bg-surface/60 px-3 py-1 text-textSecondary">
            Compliance score: <span className="font-semibold text-textPrimary">{complianceScore}%</span>
          </span>
          <span className="rounded-full border border-deepSoft/25 bg-surface/20 px-3 py-1 text-deep">
            {dashboardData.reportReady ? 'Report ready' : 'Report pending'}
          </span>
          {notice && <span className="text-secondary">{notice}</span>}
        </div>
      </Section>

      <Section className="rounded-3xl bg-bgSecondary/28 pt-6">
        <div className="mb-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="min-h-10 rounded-lg border border-secondary/30 px-3 text-sm text-textPrimary"
            aria-expanded={mobileFiltersOpen}
          >
            {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[260px_1fr_280px]">
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
            <FilterPanel
              search={search}
              onSearchChange={setSearch}
              selectedSeverities={selectedSeverities}
              onToggleSeverity={toggleSeverity}
              pages={pages}
              selectedPage={selectedPage}
              onPageChange={setSelectedPage}
              unresolvedOnly={unresolvedOnly}
              onToggleUnresolved={setUnresolvedOnly}
            />
          </div>

          <div className="space-y-3">
            {filteredViolations.length === 0 ? (
              <EmptyState
                title={summary.total === 0 ? 'No issues found' : 'No matching results'}
                description={
                  summary.total === 0
                    ? 'This scan currently has no recorded accessibility violations.'
                    : 'Try adjusting severity, page, or search filters to reveal more results.'
                }
              />
            ) : (
              filteredViolations.map((violation) => (
                <ViolationCard
                  key={violation.id}
                  violation={violation}
                  onViewDetails={setDetailsViolation}
                  onCopySelector={handleCopySelector}
                />
              ))
            )}
          </div>

          <UtilityPanel
            metadata={metadata}
            onDownloadReport={handleDownloadReport}
          />
        </div>
      </Section>

      <ViolationDetailsModal violation={detailsViolation} onClose={() => setDetailsViolation(null)} />
    </div>
  )
}

export default DashboardPage
