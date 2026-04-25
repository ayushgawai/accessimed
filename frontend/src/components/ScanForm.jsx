import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'

function ScanForm({ onSubmit, error }) {
  const [url, setUrl] = useState('')
  const [maxPages, setMaxPages] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState('')
  const [progressIndex, setProgressIndex] = useState(0)

  const progressMessages = [
    'Crawling pages...',
    'Running WCAG checks...',
    'Generating compliance summary...',
  ]

  const isValidHttpUrl = (value) => {
    try {
      const parsed = new URL(value)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch (_error) {
      return false
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    if (!isValidHttpUrl(url)) {
      setLocalError('Please enter a valid URL starting with http:// or https://')
      return
    }
    setIsSubmitting(true)
    try {
      await onSubmit({ url, max_pages: Number(maxPages) || 5 })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isSubmitting) {
      setProgressIndex(0)
      return undefined
    }
    const timer = setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % progressMessages.length)
    }, 1400)
    return () => clearInterval(timer)
  }, [isSubmitting, progressMessages.length])

  return (
    <section className="glass-panel rounded-2xl p-6 shadow-panel sm:p-8">
      <h2 className="font-display mb-2 text-2xl font-semibold text-slate-100">Start a Website Scan</h2>
      <p className="mb-6 text-sm text-slate-300">
        Enter a public URL and we will scan up to 5 pages for WCAG 2.1 AA violations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="mb-1 block text-sm font-medium text-slate-200">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full rounded-xl border border-slate-600/70 bg-slate-900/60 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
          />
        </div>

        <div>
          <label htmlFor="maxPages" className="mb-1 block text-sm font-medium text-slate-200">
            Max Pages
          </label>
          <input
            id="maxPages"
            type="number"
            min="1"
            max="5"
            value={maxPages}
            onChange={(e) => setMaxPages(e.target.value)}
            className="w-28 rounded-xl border border-slate-600/70 bg-slate-900/60 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/30"
          />
        </div>

        {(localError || error) && (
          <p
            className="rounded-xl border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-200"
            role="alert"
            aria-live="assertive"
          >
            {localError || error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-neon px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span className="inline-block h-2 w-2 animate-pulseGlow rounded-full bg-cyan-200" />
              Scanning...
            </span>
          ) : (
            'Start Compliance Scan'
          )}
        </button>

        <p className="min-h-5 text-xs text-cyan-200" aria-live="polite">
          {isSubmitting ? progressMessages[progressIndex] : ''}
        </p>
      </form>
    </section>
  )
}

ScanForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  error: PropTypes.string,
}

ScanForm.defaultProps = {
  error: '',
}

export default ScanForm
