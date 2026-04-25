import PropTypes from 'prop-types'

function Toast({ toast, onClose }) {
  if (!toast) return null

  const toneStyles =
    toast.type === 'error'
      ? 'border-red-400/45 bg-red-500/20 text-red-100'
      : toast.type === 'success'
        ? 'border-emerald-400/45 bg-emerald-500/20 text-emerald-100'
        : 'border-cyan-300/45 bg-cyan-500/20 text-cyan-100'

  return (
    <div
      className={`fixed right-4 top-4 z-[60] max-w-sm rounded-xl border px-4 py-3 shadow-panel backdrop-blur-md ${toneStyles}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-white/30 px-2 py-1 text-xs text-white/90 transition hover:bg-white/15"
          aria-label="Close notification"
        >
          Close
        </button>
      </div>
    </div>
  )
}

Toast.propTypes = {
  toast: PropTypes.shape({
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['info', 'success', 'error']),
  }),
  onClose: PropTypes.func.isRequired,
}

Toast.defaultProps = {
  toast: null,
}

export default Toast
