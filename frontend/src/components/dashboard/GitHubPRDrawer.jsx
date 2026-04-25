import PropTypes from 'prop-types'

const steps = ['Connect Repo', 'Generate Fixes', 'Create Branch', 'Commit Changes', 'Open Pull Request']

function GitHubPRDrawer({ open, stepIndex, onClose, onAdvance }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[75] flex justify-end bg-black/55 backdrop-blur-sm">
      <aside className="glass-panel h-full w-full max-w-md border-l border-secondary/20 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-textPrimary">GitHub PR Workflow</h2>
          <button type="button" onClick={onClose} className="rounded-lg border border-secondary/30 px-3 py-2 text-sm text-textSecondary">
            Close
          </button>
        </div>

        <ol className="mt-6 space-y-3">
          {steps.map((step, idx) => (
            <li
              key={step}
              className={`rounded-lg border px-3 py-3 text-sm ${
                idx <= stepIndex
                  ? 'border-primary/40 bg-primary/12 text-textPrimary'
                  : 'border-secondary/20 bg-bg/50 text-textSecondary'
              }`}
            >
              <span className="mr-2 text-xs text-secondary">{idx + 1}</span>
              {step}
            </li>
          ))}
        </ol>

        <button
          type="button"
          onClick={onAdvance}
          className="mt-6 min-h-11 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-light disabled:opacity-70"
          disabled={stepIndex >= steps.length - 1}
        >
          {stepIndex >= steps.length - 1 ? 'PR Ready' : 'Advance Step'}
        </button>
      </aside>
    </div>
  )
}

GitHubPRDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  stepIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdvance: PropTypes.func.isRequired,
}

export default GitHubPRDrawer
