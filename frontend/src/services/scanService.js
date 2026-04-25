import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function summarizeByImpact(violations) {
  return violations.reduce(
    (acc, violation) => {
      const key = violation.impact || 'minor'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    { critical: 0, serious: 0, moderate: 0, minor: 0 },
  )
}

function mapScanError(error) {
  const detail = error?.response?.data?.detail
  if (typeof detail === 'string' && detail.trim().length > 0) return detail
  if (error?.code === 'ECONNABORTED') return 'Scan timed out. Please retry with a reachable public URL.'
  if (!error?.response) return 'Unable to reach the scanning service. Check that the backend is running.'
  if (error?.response?.status >= 500) return 'The scanning service is temporarily unavailable. Please retry shortly.'
  return 'Unable to start this scan right now. Verify the URL and try again.'
}

async function scanWebsite({ url, maxPages = 5 }) {
  try {
    const { data } = await axios.post(
      `${API_URL}/api/scan`,
      { url, max_pages: maxPages },
      { timeout: 45000 },
    )

    const violations = Array.isArray(data?.violations) ? data.violations : []
    return {
      scan_id: data?.scan_id || `scan-${Date.now()}`,
      pages_scanned: data?.pages_scanned ?? maxPages,
      total_violations: data?.total_violations ?? violations.length,
      severity_counts: summarizeByImpact(violations),
      violations,
      report_ready: true,
      source: 'api',
    }
  } catch (error) {
    throw new Error(mapScanError(error))
  }
}

async function getReportBlob(scanId) {
  const response = await axios.get(`${API_URL}/api/report/${scanId}`, {
    responseType: 'blob',
    timeout: 30000,
  })
  return response.data
}

export { scanWebsite, getReportBlob }
