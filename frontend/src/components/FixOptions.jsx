import { useMemo, useState } from 'react'
import axios from 'axios'
import PropTypes from 'prop-types'

function FixOptions({ apiUrl, scanId, violation, onClose, onNotify }) {
  const [singleFix, setSingleFix] = useState(null)
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleError, setSingleError] = useState('')

  const [githubRepo, setGithubRepo] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [prLoading, setPrLoading] = useState(false)
  const [prResult, setPrResult] = useState(null)
  const [prError, setPrError] = useState('')
  const [activeTab, setActiveTab] = useState('single')

  const violationIndex = useMemo(() => violation?.index ?? 0, [violation])

  const handleGenerateSingleFix = async () => {
    setSingleError('')
    setSingleLoading(true)
    try {
      const { data } = await axios.post(`${apiUrl}/api/fix/single`, {
        scan_id: scanId,
        violation_index: violationIndex,
      })
      setSingleFix(data)
    } catch (error) {
      setSingleError(error?.response?.data?.detail || 'Failed to generate single fix.')
      setSingleFix(null)
    } finally {
      setSingleLoading(false)
    }
  }

  const handleCreatePr = async (event) => {
    event.preventDefault()
    setPrError('')
    setPrLoading(true)
    try {
      const { data } = await axios.post(`${apiUrl}/api/fix/all`, {
        scan_id: scanId,
        github_repo: githubRepo,
        github_token: githubToken,
      })
      setPrResult(data)
    } catch (error) {
      setPrError(error?.response?.data?.detail || 'Failed to create GitHub PR.')
      setPrResult(null)
    } finally {
      setPrLoading(false)
    }
  }

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      onNotify('Copied to clipboard.', 'success')
    } catch (_error) {
      onNotify('Unable to copy to clipboard in this browser.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="glass-panel max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl p-6 shadow-panel">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-100">Fix Options</h2>
            <p className="mt-1 text-sm text-slate-300">
              Rule: {violation.violation_id || 'Unknown'} | Impact: {violation.impact || 'N/A'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-500/40 bg-slate-900/30 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-800/50"
          >
            Close
          </button>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'single' ? 'bg-primary text-white shadow-glow' : 'border border-slate-500/40 bg-slate-900/30 text-slate-200'}`}
          >
            Single Fix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pr')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === 'pr' ? 'bg-accent text-white shadow-glow' : 'border border-slate-500/40 bg-slate-900/30 text-slate-200'}`}
          >
            Auto-fix + PR
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`rounded-xl border border-slate-500/35 bg-slate-900/35 p-4 ${activeTab !== 'single' ? 'opacity-60' : ''}`}>
            <h3 className="mb-2 font-semibold text-slate-100">Option 2: Generate Fix for This Issue</h3>
            <button
              type="button"
              onClick={handleGenerateSingleFix}
              disabled={singleLoading}
              className="mb-3 rounded-xl bg-gradient-to-r from-primary to-neon px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {singleLoading ? 'Generating...' : 'Generate Fix'}
            </button>

            {singleError && (
              <p
                className="mb-3 rounded-xl border border-red-400/40 bg-red-500/10 p-2 text-sm text-red-200"
                role="alert"
                aria-live="assertive"
              >
                {singleError}
              </p>
            )}

            {singleFix && (
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-200">Original HTML</p>
                    <button
                      type="button"
                      className="text-xs font-medium text-cyan-300 hover:underline"
                      onClick={() => copyText(singleFix.original_html || '')}
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100">
                    {singleFix.original_html || 'No original HTML provided.'}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-200">Fixed HTML</p>
                    <button
                      type="button"
                      className="text-xs font-medium text-cyan-300 hover:underline"
                      onClick={() => copyText(singleFix.fixed_html || '')}
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100">
                    {singleFix.fixed_html || 'No fixed HTML returned.'}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">Explanation</p>
                  <p className="mt-1 rounded-xl border border-slate-600/35 bg-slate-900/55 p-3 text-sm text-slate-200">
                    {singleFix.explanation || 'No explanation returned.'}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className={`rounded-xl border border-slate-500/35 bg-slate-900/35 p-4 ${activeTab !== 'pr' ? 'opacity-60' : ''}`}>
            <h3 className="mb-2 font-semibold text-slate-100">Option 3: Create GitHub PR for All Fixes</h3>
            <form onSubmit={handleCreatePr} className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">GitHub Repo</label>
                <input
                  required
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="username/repository"
                  className="w-full rounded-xl border border-slate-600/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">GitHub Token</label>
                <input
                  required
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full rounded-xl border border-slate-600/70 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
                />
              </div>
              <button
                type="submit"
                disabled={prLoading}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.01] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {prLoading ? 'Creating PR...' : 'Create GitHub PR'}
              </button>
            </form>

            {prError && (
              <p
                className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-2 text-sm text-red-200"
                role="alert"
                aria-live="assertive"
              >
                {prError}
              </p>
            )}
            {prResult && (
              <div
                className="mt-4 rounded-xl border border-emerald-300/35 bg-emerald-500/10 p-3 text-sm text-emerald-200"
                role="status"
                aria-live="polite"
              >
                <p className="font-semibold">PR created successfully!</p>
                <p>Fixes generated: {prResult.fixes_generated ?? 'N/A'}</p>
                {prResult.pr_url && (
                  <a
                    href={prResult.pr_url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-emerald-100 underline"
                  >
                    Open Pull Request
                  </a>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

FixOptions.propTypes = {
  apiUrl: PropTypes.string.isRequired,
  scanId: PropTypes.string.isRequired,
  violation: PropTypes.shape({
    index: PropTypes.number,
    violation_id: PropTypes.string,
    impact: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onNotify: PropTypes.func.isRequired,
}

export default FixOptions
