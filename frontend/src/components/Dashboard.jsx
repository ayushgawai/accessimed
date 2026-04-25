import { useMemo, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

const IMPACT_STYLES = {
  critical: 'border-red-400/40 bg-red-500/10 text-red-200',
  serious: 'border-orange-400/40 bg-orange-500/10 text-orange-200',
  moderate: 'border-yellow-400/40 bg-yellow-500/10 text-yellow-200',
  minor: 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
}

function Dashboard({ apiUrl, scanResult, onBack, onFixViolation, onNotify }) {
  const [downloading, setDownloading] = useState(false)

  const grouped = useMemo(() => {
    const buckets = { critical: [], serious: [], moderate: [], minor: [] }
    for (const violation of scanResult.violations || []) {
      const key = violation.impact || 'minor'
      if (!buckets[key]) buckets[key] = []
      buckets[key].push(violation)
    }
    return buckets
  }, [scanResult.violations])

  const handleDownloadReport = async () => {
    setDownloading(true)
    try {
      const response = await axios.get(`${apiUrl}/api/report/${scanResult.scan_id}`, {
        responseType: 'blob',
      })
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', `wcag-report-${scanResult.scan_id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch (_error) {
      onNotify('Unable to download report right now.', 'error')
    } finally {
      setDownloading(false)
    }
  }

  const list = ['critical', 'serious', 'moderate', 'minor']

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-2xl p-5 shadow-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-500/30 bg-slate-900/40 p-3">
              <p className="text-sm text-slate-300">Pages Scanned</p>
              <p className="text-xl font-bold text-slate-100">{scanResult.pages_scanned ?? 0}</p>
            </div>
            <div className="rounded-xl border border-slate-500/30 bg-slate-900/40 p-3">
              <p className="text-sm text-slate-300">Total Violations</p>
              <p className="text-xl font-bold text-slate-100">{scanResult.total_violations ?? 0}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onBack}
              className="rounded-xl border border-slate-400/35 bg-slate-900/30 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800/50"
            >
              New Scan
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              disabled={downloading}
              className="rounded-xl bg-gradient-to-r from-primary to-neon px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {downloading ? 'Downloading...' : 'Download PDF Report'}
            </button>
          </div>
        </div>
      </div>

      {list.map((impact) => {
        const violations = grouped[impact] || []
        return (
          <div key={impact} className={`rounded-2xl border p-4 backdrop-blur-sm ${IMPACT_STYLES[impact]}`}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold capitalize">{impact}</h3>
              <span className="rounded-full border border-white/25 bg-slate-900/25 px-3 py-1 text-xs font-semibold">
                {violations.length} issues
              </span>
            </div>

            {violations.length === 0 ? (
              <p className="text-sm">No {impact} violations found.</p>
            ) : (
              <div className="space-y-3">
                {violations.map((violation, index) => (
                  <article key={`${violation.violation_id}-${index}`} className="rounded-xl border border-white/20 bg-slate-900/35 p-4 text-slate-100 transition hover:translate-y-[-2px]">
                    <p className="text-sm font-semibold tracking-wide">{violation.violation_id || 'Unknown Rule'}</p>
                    <p className="mt-1 text-sm text-slate-200">{violation.description}</p>
                    <p className="mt-2 break-all font-mono text-xs text-slate-300">
                      Target: {Array.isArray(violation.target) ? violation.target.join(', ') : violation.target || 'N/A'}
                    </p>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => onFixViolation(violation)}
                        className="rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:scale-[1.03] hover:opacity-90"
                      >
                        Fix This
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="grid gap-4 md:grid-cols-3">
        <article className="glass-panel rounded-2xl p-4 shadow-panel">
          <h4 className="font-semibold text-slate-100">Option 1: Manual Fix</h4>
          <p className="mt-2 text-sm text-slate-300">Use this report to fix issues directly in your codebase.</p>
        </article>
        <article className="glass-panel rounded-2xl p-4 shadow-panel">
          <h4 className="font-semibold text-slate-100">Option 2: Generate Single Fix</h4>
          <p className="mt-2 text-sm text-slate-300">Click "Fix This" on any violation and get AI-generated HTML.</p>
        </article>
        <article className="glass-panel rounded-2xl p-4 shadow-panel">
          <h4 className="font-semibold text-slate-100">Option 3: Auto-fix All + PR</h4>
          <p className="mt-2 text-sm text-slate-300">Open Fix This and use the GitHub PR section to create a PR with all fixes.</p>
        </article>
      </div>

      {(scanResult.total_violations ?? 0) === 0 && (
        <div
          className="rounded-2xl border border-emerald-300/35 bg-emerald-500/10 p-5 text-emerald-100"
          role="status"
          aria-live="polite"
        >
          <h4 className="font-display text-lg font-semibold">Congratulations! No WCAG violations detected.</h4>
          <p className="mt-1 text-sm text-emerald-200">
            This scan indicates the checked pages are compliant with WCAG 2.1 AA for tested rules.
          </p>
        </div>
      )}
    </section>
  )
}

Dashboard.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  scanResult: PropTypes.shape({
    scan_id: PropTypes.string.isRequired,
    pages_scanned: PropTypes.number,
    total_violations: PropTypes.number,
    violations: PropTypes.arrayOf(
      PropTypes.shape({
        violation_id: PropTypes.string,
        impact: PropTypes.string,
        description: PropTypes.string,
        target: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
        index: PropTypes.number,
      }),
    ),
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onFixViolation: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
}

export default Dashboard
