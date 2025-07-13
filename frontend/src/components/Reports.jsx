"use client"

import { useState } from "react"
import { FileText, Download, Eye, Calendar, Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react"

const Reports = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState(null)

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "low":
        return "text-blue-600 bg-blue-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getRiskLevelColor = (riskAssessment) => {
    const riskLevel = riskAssessment?.toLowerCase() || ""
    if (riskLevel.includes("critical")) return "text-red-600 bg-red-100"
    if (riskLevel.includes("high")) return "text-orange-600 bg-orange-100"
    if (riskLevel.includes("medium")) return "text-yellow-600 bg-yellow-100"
    return "text-blue-600 bg-blue-100"
  }

  if (reports.length === 0) {
    return (
      <div className="card p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Generated</h3>
        <p className="text-gray-600 mb-4">Complete a scan and generate a report to see detailed analysis here</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedReport ? (
        // Reports List View
        <div className="grid gap-6">
          {reports.map((report) => (
            <div key={report.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Report Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Security Assessment Report</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {report.target}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Report
                  </button>
                  <button className="btn btn-secondary flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Executive Summary Preview */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Executive Summary</h4>
                <p className="text-sm text-gray-700 line-clamp-3">{report.executiveSummary || report.summary}</p>
              </div>

              {/* Vulnerability Stats */}
              {report.vulnerabilityBreakdown && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{report.vulnerabilityBreakdown.critical}</div>
                    <div className="text-xs text-red-600">Critical</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{report.vulnerabilityBreakdown.high}</div>
                    <div className="text-xs text-orange-600">High</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{report.vulnerabilityBreakdown.medium}</div>
                    <div className="text-xs text-yellow-600">Medium</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{report.vulnerabilityBreakdown.low}</div>
                    <div className="text-xs text-blue-600">Low</div>
                  </div>
                </div>
              )}

              {/* Risk Assessment Preview */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Risk Level:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getRiskLevelColor(report.riskAssessment)}`}>
                  {report.riskAssessment?.split("\n")[0]?.replace("Risk Level:", "").trim() || "Assessment Available"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Detailed Report View
        <div className="space-y-6">
          {/* Back Button */}
          <button onClick={() => setSelectedReport(null)} className="btn btn-secondary">
            ← Back to Reports
          </button>

          {/* Report Header */}
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Security Assessment Report</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Target: {selectedReport.target}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Generated: {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                  <span>Type: {selectedReport.scanType}</span>
                </div>
              </div>
              <button className="btn btn-primary flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>

            {/* Vulnerability Overview */}
            {selectedReport.vulnerabilityBreakdown && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {selectedReport.vulnerabilityBreakdown.critical}
                  </div>
                  <div className="text-sm text-red-600">Critical</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{selectedReport.vulnerabilityBreakdown.high}</div>
                  <div className="text-sm text-orange-600">High</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-3xl font-bold text-yellow-600">
                    {selectedReport.vulnerabilityBreakdown.medium}
                  </div>
                  <div className="text-sm text-yellow-600">Medium</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{selectedReport.vulnerabilityBreakdown.low}</div>
                  <div className="text-sm text-blue-600">Low</div>
                </div>
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Executive Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{selectedReport.executiveSummary || selectedReport.summary}</p>
          </div>

          {/* Risk Assessment */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans">{selectedReport.riskAssessment}</pre>
            </div>
          </div>

          {/* Detailed Analysis */}
          {selectedReport.detailedAnalysis && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700 font-sans">{selectedReport.detailedAnalysis}</pre>
              </div>
            </div>
          )}

          {/* Remediation Steps */}
          {selectedReport.remediationSteps && selectedReport.remediationSteps.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Remediation Steps
              </h3>
              <div className="space-y-3">
                {selectedReport.remediationSteps.map((step, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {selectedReport.recommendations && selectedReport.recommendations.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Long-term Recommendations</h3>
              <div className="space-y-2">
                {selectedReport.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {selectedReport.nextSteps && selectedReport.nextSteps.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Next Steps</h3>
              <div className="space-y-3">
                {selectedReport.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{step.action}</p>
                      <p className="text-sm text-gray-600">Timeline: {step.timeline}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        step.priority === "IMMEDIATE"
                          ? "bg-red-100 text-red-800"
                          : step.priority === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : step.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {step.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compliance Information */}
          {selectedReport.compliance && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-3">Compliance Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(selectedReport.compliance).map(([standard, status]) => (
                  <div key={standard} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium uppercase">{standard}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        status.toLowerCase().includes("compliant") && !status.toLowerCase().includes("non")
                          ? "bg-green-100 text-green-800"
                          : status.toLowerCase().includes("non-compliant")
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {status.split(" - ")[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
