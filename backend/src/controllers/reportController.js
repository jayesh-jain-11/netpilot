const express = require("express")
const { v4: uuidv4 } = require("uuid")
const geminiService = require("../services/geminiService")
const router = express.Router()

// Get all reports
router.get("/", (req, res) => {
  res.json(global.reports)
})

// Get specific report
router.get("/:id", (req, res) => {
  const report = global.reports.find((r) => r.id === req.params.id)
  if (!report) {
    return res.status(404).json({ error: "Report not found" })
  }
  res.json(report)
})

// Generate AI report
router.post("/generate", async (req, res) => {
  const { scanId } = req.body

  if (!scanId) {
    return res.status(400).json({ error: "Scan ID is required" })
  }

  const scan = global.scans.find((s) => s.id === scanId)
  if (!scan) {
    return res.status(404).json({ error: "Scan not found" })
  }

  if (scan.status !== "completed") {
    return res.status(400).json({ error: "Scan must be completed to generate report" })
  }

  try {
    console.log(`📄 Generating AI report for scan: ${scanId}`)

    // Generate AI analysis
    const analysis = await geminiService.analyzeVulnerabilities(scan.vulnerabilities, scan.target)
    const executiveSummary = await geminiService.generateExecutiveSummary({
      target: scan.target,
      vulnerabilities: scan.vulnerabilities,
      scanType: scan.scanType,
      duration: scan.duration,
    })

    // Create comprehensive report
    const report = {
      id: uuidv4(),
      scanId: scan.id,
      target: scan.target,
      scanType: scan.scanType,
      createdAt: new Date().toISOString(),

      // Executive Summary
      executiveSummary: executiveSummary,

      // AI Analysis
      summary: analysis.summary,
      riskAssessment: analysis.riskAssessment,
      detailedAnalysis: analysis.detailedAnalysis,
      recommendations: analysis.recommendations,
      remediationSteps: analysis.remediationSteps,

      // Vulnerability Statistics
      vulnerabilityBreakdown: {
        total: scan.vulnerabilities.length,
        critical: scan.vulnerabilities.filter((v) => v.severity === "critical").length,
        high: scan.vulnerabilities.filter((v) => v.severity === "high").length,
        medium: scan.vulnerabilities.filter((v) => v.severity === "medium").length,
        low: scan.vulnerabilities.filter((v) => v.severity === "low").length,
      },

      // Detailed Vulnerabilities
      vulnerabilities: scan.vulnerabilities.map((vuln) => ({
        ...vuln,
        riskScore: calculateRiskScore(vuln),
        businessImpact: assessBusinessImpact(vuln),
      })),

      // Scan Metadata
      scanMetadata: {
        duration: scan.duration,
        scanType: scan.scanType,
        completedAt: scan.completedAt,
        toolsUsed: ["Nmap", "Custom Vulnerability Scanner", "AI Analysis Engine"],
      },

      // Compliance Information
      compliance: generateComplianceInfo(scan.vulnerabilities),

      // Next Steps
      nextSteps: generateNextSteps(scan.vulnerabilities),
    }

    global.reports.push(report)
    console.log(`✅ Report generated successfully: ${report.id}`)

    res.status(201).json(report)
  } catch (error) {
    console.error("Error generating report:", error)
    res.status(500).json({
      error: "Failed to generate report",
      message: error.message,
    })
  }
})

// Helper function to calculate risk score
function calculateRiskScore(vulnerability) {
  const severityScores = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1,
  }

  const baseScore = severityScores[vulnerability.severity] || 1
  const portMultiplier = [21, 22, 23, 80, 443].includes(vulnerability.port) ? 1.2 : 1.0

  return Math.min(10, Math.round(baseScore * portMultiplier * 10) / 10)
}

// Helper function to assess business impact
function assessBusinessImpact(vulnerability) {
  const impacts = {
    critical: "High - Potential for complete system compromise, data breach, or service disruption",
    high: "Medium-High - Significant security risk with potential for unauthorized access",
    medium: "Medium - Moderate security risk requiring attention during maintenance cycles",
    low: "Low - Minor security concern with limited impact",
  }

  return impacts[vulnerability.severity] || "Unknown impact level"
}

// Helper function to generate compliance information
function generateComplianceInfo(vulnerabilities) {
  const hasHighRisk = vulnerabilities.some((v) => ["critical", "high"].includes(v.severity))
  const hasEncryptionIssues = vulnerabilities.some(
    (v) => v.name.toLowerCase().includes("ssl") || v.name.toLowerCase().includes("encryption"),
  )
  const hasAccessControls = vulnerabilities.some(
    (v) => v.name.toLowerCase().includes("credential") || v.name.toLowerCase().includes("authentication"),
  )

  return {
    pciDss: hasEncryptionIssues ? "Non-Compliant - Encryption vulnerabilities detected" : "Review Required",
    iso27001: hasHighRisk ? "Non-Compliant - High-risk vulnerabilities present" : "Compliant",
    nist: hasAccessControls ? "Non-Compliant - Access control issues identified" : "Review Required",
    gdpr: hasHighRisk ? "Risk Present - Data protection measures may be compromised" : "Acceptable Risk",
  }
}

// Helper function to generate next steps
function generateNextSteps(vulnerabilities) {
  const steps = []
  const hasCritical = vulnerabilities.some((v) => v.severity === "critical")
  const hasHigh = vulnerabilities.some((v) => v.severity === "high")

  if (hasCritical) {
    steps.push({
      priority: "IMMEDIATE",
      action: "Address critical vulnerabilities within 24-48 hours",
      timeline: "1-2 days",
    })
  }

  if (hasHigh) {
    steps.push({
      priority: "HIGH",
      action: "Remediate high-severity vulnerabilities",
      timeline: "1-2 weeks",
    })
  }

  steps.push({
    priority: "MEDIUM",
    action: "Schedule regular security assessments",
    timeline: "Quarterly",
  })

  steps.push({
    priority: "LOW",
    action: "Implement continuous monitoring",
    timeline: "Ongoing",
  })

  return steps
}

// Export report as PDF (placeholder)
router.get("/:id/export/pdf", (req, res) => {
  const report = global.reports.find((r) => r.id === req.params.id)
  if (!report) {
    return res.status(404).json({ error: "Report not found" })
  }

  // In a real implementation, this would generate a PDF
  res.json({
    message: "PDF export functionality would be implemented here",
    report: report,
  })
})

module.exports = router
