import { useMemo } from 'react'
import PropTypes from 'prop-types'

function buildFixPreview(violation) {
  if (!violation) return { original: '', fixed: '', explanation: '' }
  const original = violation.snippet
  let fixed = original

  if (violation.ruleId === 'color-contrast') {
    fixed = '<button class="hero-book-now text-white bg-[#005d66]">Book Appointment</button>'
  } else if (violation.ruleId === 'label') {
    fixed = '<label for="patientName">Patient name</label>\n<input id="patientName" name="patientName" />'
  } else if (violation.ruleId === 'image-alt') {
    fixed = '<img src="/images/cardiology.png" alt="Cardiology department illustration" />'
  } else if (violation.ruleId === 'link-name') {
    fixed = '<a href="/insurance">View accepted insurance plans</a>'
  }

  return {
    original,
    fixed,
    explanation:
      'This remediation addresses the accessibility rule while preserving expected functionality and maintaining clean, reviewable markup.',
  }
}

function FixModal({ violation, loading, onClose, onRegenerate, onCopy, onAddToPr }) {
  const preview = useMemo(() => buildFixPreview(violation), [violation])
  if (!violation) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="AI fix preview">
      <div className="glass-panel w-full max-w-5xl rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-secondary">AI Fix Preview</p>
            <h2 className="mt-1 font-display text-2xl font-bold text-textPrimary">{violation.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg border border-secondary/25 px-3 py-2 text-sm text-textSecondary">
            Close
          </button>
        </div>

        {loading ? (
          <div className="mt-6 rounded-xl border border-secondary/20 bg-bg/50 p-6 text-sm text-textSecondary">
            Generating remediation suggestion...
          </div>
        ) : (
          <>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-textSecondary">Original code</p>
                <pre className="min-h-44 overflow-auto rounded-xl border border-secondary/20 bg-bg/70 p-4 font-mono text-xs text-danger">{preview.original}</pre>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wider text-textSecondary">Fixed code</p>
                <pre className="min-h-44 overflow-auto rounded-xl border border-secondary/20 bg-bg/70 p-4 font-mono text-xs text-warning">{preview.fixed}</pre>
              </div>
            </div>
            <p className="mt-4 rounded-lg border border-secondary/20 bg-surface/70 p-3 text-sm text-textSecondary">{preview.explanation}</p>
          </>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => onCopy(preview.fixed)} className="rounded-lg border border-secondary/30 px-3 py-2 text-sm text-textPrimary">
            Copy Fix
          </button>
          <button type="button" onClick={onRegenerate} className="rounded-lg border border-secondary/30 px-3 py-2 text-sm text-textPrimary">
            Regenerate
          </button>
          <button type="button" onClick={onAddToPr} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-light">
            Add to PR
          </button>
        </div>
      </div>
    </div>
  )
}

FixModal.propTypes = {
  violation: PropTypes.shape({
    title: PropTypes.string,
    snippet: PropTypes.string,
    ruleId: PropTypes.string,
  }),
  loading: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onRegenerate: PropTypes.func.isRequired,
  onCopy: PropTypes.func.isRequired,
  onAddToPr: PropTypes.func.isRequired,
}

FixModal.defaultProps = {
  violation: null,
}

export default FixModal
