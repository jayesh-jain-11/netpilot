"use client"
import { CheckCircle, Clock, AlertTriangle, FileText, StopCircle } from "lucide-react"

const ScanResults = ({ scans, onGenerateReport, loading }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "cancelled":
        return <StopCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-blue-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  if (scans.length === 0) {
    return (
      <div className="card p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Scans Yet</h3>
        <p className="text-gray-600 mb-4">Start your first penetration test to see results here</p>
        <button className="btn btn-primary">Start New Scan</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {scans.map((scan) => (
        <div key={scan.id} className="card p-6">
          {/* Scan Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {getStatusIcon(scan.status)}
              <div>
                <h3 className="text-lg font-semibold">{scan.target}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Type: {scan.scanType}</span>
                  <span>Started: {new Date(scan.createdAt).toLocaleString()}</span>
                  {scan.duration && <span>Duration: {formatDuration(scan.duration)}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  scan.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : scan.status === "running"
                      ? "bg-blue-100 text-blue-800"
                      : scan.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {scan.status}
              </span>
            </div>
          </div>

          {/* Progress Bar for Running Scans */}
          {scan.status === "running" && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{scan.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scan.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{scan.currentStep || "Processing..."}</p>
            </div>
          )}

          {/* Description */}
          {scan.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">{scan.description}</p>
            </div>
          )}

          {/* Vulnerabilities */}
          {scan.vulnerabilities && scan.vulnerabilities.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Vulnerabilities Found ({scan.vulnerabilities.length})</h4>
                {scan.vulnerabilityStats && (
                  <div className="flex gap-2">
                    {scan.vulnerabilityStats.critical > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        {scan.vulnerabilityStats.critical} Critical
                      </span>
                    )}
                    {scan.vulnerabilityStats.high > 0 && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                        {scan.vulnerabilityStats.high} High
                      </span>
                    )}
                    {scan.vulnerabilityStats.medium > 0 && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        {scan.vulnerabilityStats.medium} Medium
                      </span>
                    )}
                    {scan.vulnerabilityStats.low > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {scan.vulnerabilityStats.low} Low
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="grid gap-3">
                {scan.vulnerabilities.map((vuln, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{vuln.name}</h5>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{vuln.description}</p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>Port: {vuln.port}</span>
                          <span>Service: {vuln.service}</span>
                          {vuln.cve && <span>CVE: {vuln.cve}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate Report Button */}
              {scan.status === "completed" && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => onGenerateReport(scan.id)}
                    disabled={loading}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Generate AI Report
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : scan.status === "completed" ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">No Vulnerabilities Found</h4>
              <p className="text-sm text-gray-600">The target appears to be secure based on our assessment</p>
            </div>
          ) : scan.status === "failed" ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">Scan Failed</h4>
              <p className="text-sm text-gray-600">{scan.error || "An error occurred during scanning"}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600">Scan in progress...</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ScanResults
