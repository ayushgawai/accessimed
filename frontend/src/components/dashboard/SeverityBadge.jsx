import PropTypes from 'prop-types'

const severityStyles = {
  critical: 'border-danger/45 bg-danger/15 text-danger',
  serious: 'border-deepSoft/35 bg-deepSoft/12 text-deep',
  moderate: 'border-secondary/40 bg-secondary/12 text-secondary',
  minor: 'border-secondary/30 bg-secondary/10 text-deepSoft',
}

function SeverityBadge({ severity }) {
  const normalized = String(severity || 'minor').toLowerCase()
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${severityStyles[normalized] || severityStyles.minor}`}>
      {normalized}
    </span>
  )
}

SeverityBadge.propTypes = {
  severity: PropTypes.string.isRequired,
}

export default SeverityBadge
