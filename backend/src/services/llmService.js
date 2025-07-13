const axios = require("axios")

class LLMService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY
    this.baseUrl = "https://api.openai.com/v1"
  }

  async analyzeVulnerabilities(vulnerabilities, target) {
    if (!this.openaiApiKey) {
      // Return mock analysis if no API key
      return this.mockAnalysis(vulnerabilities, target)
    }

    try {
      const prompt = this.buildAnalysisPrompt(vulnerabilities, target)

      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a cybersecurity expert specializing in penetration testing and vulnerability assessment. Provide detailed, actionable security analysis.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return this.parseAnalysisResponse(response.data.choices[0].message.content)
    } catch (error) {
      console.error("Error calling OpenAI API:", error)
      return this.mockAnalysis(vulnerabilities, target)
    }
  }

  buildAnalysisPrompt(vulnerabilities, target) {
    const vulnList = vulnerabilities
      .map((v) => `- ${v.name} (${v.severity}): ${v.description} [Port: ${v.port}]`)
      .join("\n")

    return `
Analyze the following security vulnerabilities found during a penetration test of ${target}:

${vulnList}

Please provide:
1. Executive Summary (2-3 sentences)
2. Risk Assessment (overall risk level and explanation)
3. Detailed Analysis of each vulnerability
4. Prioritized Remediation Steps
5. Long-term Security Recommendations

Format the response as a professional security assessment report.
    `
  }

  parseAnalysisResponse(content) {
    // Parse the LLM response into structured data
    const sections = content.split("\n\n")

    return {
      summary: this.extractSection(content, "Executive Summary"),
      riskAssessment: this.extractSection(content, "Risk Assessment"),
      detailedAnalysis: this.extractSection(content, "Detailed Analysis"),
      remediationSteps: this.extractListSection(content, "Remediation Steps"),
      recommendations: this.extractListSection(content, "Recommendations"),
    }
  }

  extractSection(content, sectionName) {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n|\\d+\\.|$)`, "i")
    const match = content.match(regex)
    return match ? match[1].trim() : ""
  }

  extractListSection(content, sectionName) {
    const section = this.extractSection(content, sectionName)
    return section
      .split("\n")
      .filter((line) => line.trim().startsWith("-") || line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^[-\d.]\s*/, "").trim())
      .filter((line) => line.length > 0)
  }

  mockAnalysis(vulnerabilities, target) {
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length

    let riskLevel = "Low"
    if (criticalCount > 0) riskLevel = "Critical"
    else if (highCount > 0) riskLevel = "High"
    else if (vulnerabilities.length > 2) riskLevel = "Medium"

    return {
      summary: `Security assessment of ${target} identified ${vulnerabilities.length} vulnerabilities with an overall risk level of ${riskLevel}. ${criticalCount > 0 ? "Critical vulnerabilities require immediate attention." : "Regular security maintenance is recommended."}`,
      riskAssessment: `The target system presents a ${riskLevel} risk profile based on the discovered vulnerabilities. ${criticalCount > 0 ? "Critical issues pose immediate security threats." : ""} ${highCount > 0 ? "High-severity vulnerabilities require prompt remediation." : ""}`,
      detailedAnalysis: vulnerabilities
        .map(
          (v) =>
            `${v.name}: This ${v.severity}-severity vulnerability on port ${v.port} requires attention. ${v.description}`,
        )
        .join("\n\n"),
      remediationSteps: this.generateRemediationSteps(vulnerabilities),
      recommendations: [
        "Implement regular security updates and patch management",
        "Deploy network monitoring and intrusion detection systems",
        "Conduct periodic security assessments",
        "Implement multi-factor authentication where possible",
        "Regular backup and disaster recovery testing",
      ],
    }
  }

  generateRemediationSteps(vulnerabilities) {
    const steps = []

    vulnerabilities.forEach((vuln, index) => {
      switch (vuln.name) {
        case "Open SSH Port":
          steps.push(
            `${index + 1}. Secure SSH configuration: Change default port, disable root login, implement key-based authentication`,
          )
          break
        case "Outdated Apache Version":
          steps.push(`${index + 1}. Update Apache web server to latest stable version and apply security patches`)
          break
        case "Weak SSL Configuration":
          steps.push(
            `${index + 1}. Update SSL/TLS configuration: Disable weak ciphers, enable strong encryption protocols`,
          )
          break
        case "Anonymous FTP Access":
          steps.push(`${index + 1}. Disable anonymous FTP access and implement proper authentication mechanisms`)
          break
        case "Default Credentials":
          steps.push(`${index + 1}. Change all default passwords and implement strong password policies`)
          break
        default:
          steps.push(`${index + 1}. Address ${vuln.name}: Follow security best practices for ${vuln.service} service`)
      }
    })

    return steps
  }

  async generateExecutiveSummary(scanData) {
    const { target, vulnerabilities, scanType, duration } = scanData

    if (!this.openaiApiKey) {
      return this.mockExecutiveSummary(scanData)
    }

    const prompt = `
Generate a professional executive summary for a penetration testing report with the following details:

Target: ${target}
Scan Type: ${scanType}
Duration: ${duration || "N/A"}
Vulnerabilities Found: ${vulnerabilities.length}
Critical: ${vulnerabilities.filter((v) => v.severity === "critical").length}
High: ${vulnerabilities.filter((v) => v.severity === "high").length}
Medium: ${vulnerabilities.filter((v) => v.severity === "medium").length}
Low: ${vulnerabilities.filter((v) => v.severity === "low").length}

The summary should be concise, professional, and suitable for executive leadership.
    `

    try {
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a cybersecurity consultant writing executive summaries for penetration testing reports. Keep summaries concise and business-focused.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 300,
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `Bearer ${this.openaiApiKey}`,
            "Content-Type": "application/json",
          },
        },
      )

      return response.data.choices[0].message.content.trim()
    } catch (error) {
      console.error("Error generating executive summary:", error)
      return this.mockExecutiveSummary(scanData)
    }
  }

  mockExecutiveSummary(scanData) {
    const { target, vulnerabilities } = scanData
    const criticalCount = vulnerabilities.filter((v) => v.severity === "critical").length
    const highCount = vulnerabilities.filter((v) => v.severity === "high").length

    return `Executive Summary: The penetration testing assessment of ${target} has been completed, revealing ${vulnerabilities.length} security vulnerabilities. ${criticalCount > 0 ? `${criticalCount} critical vulnerabilities require immediate remediation to prevent potential security breaches.` : ""} ${highCount > 0 ? `${highCount} high-severity issues should be addressed promptly.` : ""} The organization should prioritize security updates and implement recommended security controls to improve overall security posture.`
  }
}

module.exports = new LLMService()
