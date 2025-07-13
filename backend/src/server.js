const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid")
const cron = require("node-cron")
require("dotenv").config()

const geminiService = require("./services/geminiService")
const scanController = require("./controllers/scanController")
const reportController = require("./controllers/reportController")

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//   }),
// )

const allowedOrigins = [
  "http://localhost:5173",
  "https://gilded-snickerdoodle-3b2e89.netlify.app", // ✅ Make sure no trailing slash
];

// ✅ Middleware: CORS (dynamic origin check)
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json())

// In-memory storage (replace with database in production)
global.scans = []
global.reports = []

// Mock vulnerability database
const mockVulnerabilities = [
  {
    name: "Open SSH Port",
    description: "SSH service is running on default port 22",
    severity: "medium",
    port: 22,
    service: "ssh",
  },
  {
    name: "Outdated Apache Version",
    description: "Web server running outdated Apache version with known vulnerabilities",
    severity: "high",
    port: 80,
    service: "http",
  },
  {
    name: "Weak SSL Configuration",
    description: "SSL/TLS configuration allows weak cipher suites",
    severity: "medium",
    port: 443,
    service: "https",
  },
  {
    name: "Anonymous FTP Access",
    description: "FTP server allows anonymous login",
    severity: "high",
    port: 21,
    service: "ftp",
  },
  {
    name: "Default Credentials",
    description: "Service using default username/password combination",
    severity: "critical",
    port: 23,
    service: "telnet",
  },
]

// Simulate network scanning
const simulateNetworkScan = async (scanId, target, scanType) => {
  const scan = global.scans.find((s) => s.id === scanId)
  if (!scan) return

  // Update scan status
  scan.status = "running"
  scan.currentStep = "Performing network discovery..."
  scan.progress = 10

  // Simulate scanning phases
  const phases = [
    { step: "Port scanning...", progress: 30, delay: 2000 },
    { step: "Service detection...", progress: 50, delay: 3000 },
    { step: "Vulnerability assessment...", progress: 70, delay: 4000 },
    { step: "Analyzing results with AI...", progress: 90, delay: 2000 },
    { step: "Generating findings...", progress: 100, delay: 1000 },
  ]

  for (const phase of phases) {
    await new Promise((resolve) => setTimeout(resolve, phase.delay))
    scan.currentStep = phase.step
    scan.progress = phase.progress
  }

  // Generate mock vulnerabilities based on scan type
  const numVulns = scanType === "comprehensive" ? 4 : scanType === "basic" ? 2 : 1
  const selectedVulns = mockVulnerabilities
    .sort(() => 0.5 - Math.random())
    .slice(0, numVulns)
    .map((vuln) => ({
      ...vuln,
      target: target,
      discoveredAt: new Date().toISOString(),
    }))

  scan.vulnerabilities = selectedVulns
  scan.status = "completed"
  scan.completedAt = new Date().toISOString()
  scan.currentStep = "Scan completed"
}

// Routes
app.use("/api/scans", scanController)
app.use("/api/reports", reportController)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    geminiConnected: !!process.env.GEMINI_API_KEY,
  })
})

// Test Gemini connection
app.get("/api/test-gemini", async (req, res) => {
  try {
    const testResult = await geminiService.testConnection()
    res.json({ success: true, result: testResult })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Cleanup old scans and reports (runs every hour)
cron.schedule("0 * * * *", () => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  global.scans = global.scans.filter((scan) => new Date(scan.createdAt) > oneDayAgo)
  global.reports = global.reports.filter((report) => new Date(report.createdAt) > oneDayAgo)
  console.log("🧹 Cleaned up old scans and reports")
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server Error:", error)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? error.message : "Something went wrong",
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Pentesting Backend Server running on port ${PORT}`)
  console.log(`📊 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
  console.log(`🔧 API Health: http://localhost:${PORT}/api/health`)
  console.log(`🤖 Gemini API: ${process.env.GEMINI_API_KEY ? "✅ Connected" : "❌ Not configured"}`)
})
