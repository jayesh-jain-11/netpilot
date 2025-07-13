const { GoogleGenerativeAI } = require("@google/generative-ai")

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" })
    }
  }

  async testConnection() {
    if (!this.apiKey) {
      throw new Error("Gemini API key not configured")
    }

    try {
      const result = await this.model.generateContent("Hello, this is a test connection.")
      return result.response.text()
    } catch (error) {
      throw new Error(`Gemini API connection failed: ${error.message}`)
    }
  }

  async analyzeVulnerabilities(vulnerabilities, target) {
    if (!this.apiKey) {
      console.log("🤖 Using mock analysis (Gemini API key not configured)")
      return this.mockAnalysis(vulnerabilities, target)
    }

    try {
      const prompt = this.buildAnalysisPrompt(vulnerabilities, target)
      const result = await this.model.generateContent(prompt)
      const response = result.response.text()

      return this.parseAnalysisResponse(response, vulnerabilities, target)
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      return this.mockAnalysis(vulnerabilities, target)
    }
  }

  buildAnalysisPrompt(vulnerabilities, target) {
    const vulnList = vulnerabilities
      .map((v) => `- ${v.name} (${v.severity}): ${v.description} [Port: ${v.port}, Service: ${v.service}]`)
      .join("\n")

    return `
You are a cybersecurity expert analyzing penetration test results. Please analyze the following vulnerabilities found on ${target}:

${vulnList}

Please provide a structured analysis with:

1. EXECUTIVE_SUMMARY: A brief 2-3 sentence summary for management
2. RISK_ASSESSMENT: Overall risk level (Critical/High/Medium/Low) and detailed explanation
3. DETAILED_ANALYSIS: Technical analysis of each vulnerability
4. REMEDIATION_STEPS: Prioritized list of specific remediation actions
5. RECOMMENDATIONS: Long-term security recommendations

Format your response clearly with these section headers.
    `
  }

  parseAnalysisResponse(content, vulnerabilities, target) {
    try {
      const sections = {
        summary: this.extractSection(content, "EXECUTIVE_SUMMARY"),
        riskAssessment: this.extractSection(content, "RISK_ASSESSMENT"),
        detailedAnalysis: this.extractSection(content, "DETAILED_ANALYSIS"),
        remediationSteps: this.extractListSection(content, "REMEDIATION_STEPS"),
        recommendations: this.extractListSection(content, "RECOMMENDATIONS"),
      }

      // Fallback to mock if parsing fails
      if (!sections.summary || sections.summary.length < 10) {
        return this.mockAnalysis(vulnerabilities, target)
      }

      return sections
    } catch (error) {
      console.error("Error parsing Gemini response:", error)
      return this.mockAnalysis(vulnerabilities, target)
    }
  }

  extractSection(content, sectionName) {
    const patterns = [
      new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n|\\n[A-Z_]+:|$)`, "i"),
      new RegExp(`\\*\\*${sectionName}\\*\\*:?\\s*([\\s\\S]*?)(?=\\n\\n|\\n\\*\\*|$)`, "i"),
      new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=\\n\\n|\\n##|$)`, "i"),
    ]

    for (const pattern of patterns) {
      const match = content.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }

    return ""
  }

  extractListSection(content, sectionName) {
    const section = this.extractSection(content, sectionName)
    if (!section) return []

    return section
      .split("\n")
      .filter((line) => line.trim().match(/^[-*•]\s+|^\d+\.\s+/))
      .map((line) => line.replace(/^[-*•]\s+|^\d+\.\s+/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 10) // Limit to 10 items
  }

  mockAnalysis(vulnerabilities, target) {
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length
    const mediumCount = vulnerabilities.filter((v) => v.severity === "medium").length

    let riskLevel = "Low"
    if (criticalCount > 0) riskLevel = "Critical"
    else if (highCount > 0) riskLevel = "High"
    else if (mediumCount > 1) riskLevel = "Medium"

    return {
      summary: `Security assessment of ${target} identified ${vulnerabilities.length} vulnerabilities with an overall risk level of ${riskLevel}. ${criticalCount > 0 ? "Critical vulnerabilities require immediate attention to prevent potential security breaches." : "Regular security maintenance and monitoring are recommended to maintain security posture."}`,

      riskAssessment: `Risk Level: ${riskLevel}\n\nThe target system presents a ${riskLevel.toLowerCase()} risk profile based on ${vulnerabilities.length} discovered vulnerabilities. ${criticalCount > 0 ? `${criticalCount} critical vulnerabilities pose immediate security threats and require urgent remediation.` : ""} ${highCount > 0 ? `${highCount} high-severity vulnerabilities require prompt attention.` : ""} ${mediumCount > 0 ? `${mediumCount} medium-severity issues should be addressed during regular maintenance cycles.` : ""}`,

      detailedAnalysis: vulnerabilities
        .map(
          (v) =>
            `${v.name} (${v.severity.toUpperCase()}): This vulnerability affects the ${v.service} service on port ${v.port}. ${v.description} This issue could potentially allow unauthorized access or information disclosure.`,
        )
        .join("\n\n"),

      remediationSteps: this.generateRemediationSteps(vulnerabilities),

      recommendations: [
        "Implement regular security updates and patch management procedures",
        "Deploy network monitoring and intrusion detection systems",
        "Conduct periodic security assessments and penetration testing",
        "Implement multi-factor authentication for all critical services",
        "Regular backup and disaster recovery testing",
        "Security awareness training for all personnel",
        "Implement network segmentation and access controls",
      ],
    }
  }

  generateRemediationSteps(vulnerabilities) {
    const steps = []

    vulnerabilities.forEach((vuln, index) => {
      const priority =
        vuln.severity === "critical"
          ? "URGENT"
          : vuln.severity === "high"
            ? "HIGH"
            : vuln.severity === "medium"
              ? "MEDIUM"
              : "LOW"

      switch (vuln.name) {
        case "Open SSH Port":
          steps.push(
            `[${priority}] Secure SSH configuration: Change default port, disable root login, implement key-based authentication`,
          )
          break
        case "Outdated Apache Version":
          steps.push(`[${priority}] Update Apache web server to latest stable version and apply all security patches`)
          break
        case "Weak SSL Configuration":
          steps.push(
            `[${priority}] Update SSL/TLS configuration: Disable weak ciphers, enable strong encryption protocols (TLS 1.2+)`,
          )
          break
        case "Anonymous FTP Access":
          steps.push(`[${priority}] Disable anonymous FTP access and implement proper authentication mechanisms`)
          break
        case "Default Credentials":
          steps.push(
            `[${priority}] Change all default passwords and implement strong password policies organization-wide`,
          )
          break
        default:
          steps.push(
            `[${priority}] Address ${vuln.name}: Follow security best practices for ${vuln.service} service on port ${vuln.port}`,
          )
      }
    })

    return steps.sort((a, b) => {
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
      const aPriority = a.match(/\[(.*?)\]/)?.[1] || "LOW"
      const bPriority = b.match(/\[(.*?)\]/)?.[1] || "LOW"
      return priorityOrder[aPriority] - priorityOrder[bPriority]
    })
  }

  async generateExecutiveSummary(scanData) {
    const { target, vulnerabilities, scanType } = scanData

    if (!this.apiKey) {
      return this.mockExecutiveSummary(scanData)
    }

    const prompt = `
Generate a professional executive summary for a penetration testing report:

Target: ${target}
Scan Type: ${scanType}
Total Vulnerabilities: ${vulnerabilities.length}
Critical: ${vulnerabilities.filter((v) => v.severity === "critical").length}
High: ${vulnerabilities.filter((v) => v.severity === "high").length}
Medium: ${vulnerabilities.filter((v) => v.severity === "medium").length}
Low: ${vulnerabilities.filter((v) => v.severity === "low").length}

Write a concise, business-focused executive summary (3-4 sentences) suitable for C-level executives.
    `

    try {
      const result = await this.model.generateContent(prompt)
      return result.response.text().trim()
    } catch (error) {
      console.error("Error generating executive summary:", error)
      return this.mockExecutiveSummary(scanData)
    }
  }

  mockExecutiveSummary(scanData) {
    const { target, vulnerabilities } = scanData
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length

    return `Executive Summary: The penetration testing assessment of ${target} has been completed, revealing ${vulnerabilities.length} security vulnerabilities requiring attention. ${criticalCount > 0 ? `${criticalCount} critical vulnerabilities require immediate remediation to prevent potential security breaches.` : ""} ${highCount > 0 ? `${highCount} high-severity issues should be addressed promptly to maintain security posture.` : ""} The organization should prioritize implementing the recommended security controls and establish regular security assessment procedures.`
  }
}

module.exports = new GeminiService()
