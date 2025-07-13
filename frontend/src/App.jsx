"use client"

import { useState, useEffect } from "react"
import { Shield, Scan, FileText, Target, Activity } from "lucide-react"
import apiService from "./services/apiService"
import Dashboard from "./components/Dashboard"
import NewScan from "./components/NewScan"
import ScanResults from "./components/ScanResults"
import Reports from "./components/Reports"

function App() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [scans, setScans] = useState([])
  const [reports, setReports] = useState([])
  const [currentScan, setCurrentScan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState({ connected: false, geminiConnected: false })

  useEffect(() => {
    checkApiHealth()
    fetchScans()
    fetchReports()

    // Set up polling for active scans
    const interval = setInterval(() => {
      const activeScans = scans.filter((scan) => scan.status === "running")
      if (activeScans.length > 0) {
        fetchScans()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [scans.length])

  const checkApiHealth = async () => {
    try {
      const health = await apiService.checkHealth()
      setApiStatus({
        connected: true,
        geminiConnected: health.geminiConnected,
      })
    } catch (error) {
      setApiStatus({ connected: false, geminiConnected: false })
    }
  }

  const fetchScans = async () => {
    try {
      const scanData = await apiService.getScans()
      setScans(scanData)

      // Update current scan if it exists
      if (currentScan) {
        const updatedCurrentScan = scanData.find((scan) => scan.id === currentScan.id)
        if (updatedCurrentScan) {
          setCurrentScan(updatedCurrentScan)
        }
      }
    } catch (error) {
      console.error("Error fetching scans:", error)
    }
  }

  const fetchReports = async () => {
    try {
      const reportData = await apiService.getReports()
      setReports(reportData)
    } catch (error) {
      console.error("Error fetching reports:", error)
    }
  }

  const startScan = async (scanConfig) => {
    setLoading(true)
    try {
      const newScan = await apiService.startScan(scanConfig)
      setCurrentScan(newScan)
      setScans((prev) => [...prev, newScan])
      setActiveTab("results")
    } catch (error) {
      console.error("Error starting scan:", error)
      alert("Failed to start scan: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (scanId) => {
    setLoading(true)
    try {
      await apiService.generateReport(scanId)
      await fetchReports()
      setActiveTab("reports")
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Network Pentesting Automation</h1>
                <p className="text-sm text-gray-600">AI-powered vulnerability assessment and reporting</p>
              </div>
            </div>

            {/* API Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${apiStatus.connected ? "bg-green-500" : "bg-red-500"}`}></div>
                <span className="text-sm text-gray-600">API {apiStatus.connected ? "Connected" : "Disconnected"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${apiStatus.geminiConnected ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <span className="text-sm text-gray-600">
                  Gemini {apiStatus.geminiConnected ? "Connected" : "Mock Mode"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8">
          <TabButton
            id="dashboard"
            label="Dashboard"
            icon={Activity}
            isActive={activeTab === "dashboard"}
            onClick={setActiveTab}
          />
          <TabButton id="scan" label="New Scan" icon={Scan} isActive={activeTab === "scan"} onClick={setActiveTab} />
          <TabButton
            id="results"
            label="Scan Results"
            icon={Target}
            isActive={activeTab === "results"}
            onClick={setActiveTab}
          />
          <TabButton
            id="reports"
            label="Reports"
            icon={FileText}
            isActive={activeTab === "reports"}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && <Dashboard scans={scans} reports={reports} currentScan={currentScan} />}

        {activeTab === "scan" && <NewScan onStartScan={startScan} loading={loading} />}

        {activeTab === "results" && <ScanResults scans={scans} onGenerateReport={generateReport} loading={loading} />}

        {activeTab === "reports" && <Reports reports={reports} />}
      </main>
    </div>
  )
}

export default App
