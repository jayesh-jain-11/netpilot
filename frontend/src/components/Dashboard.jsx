import { Target, Scan, FileText, AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"

const Dashboard = ({ scans, reports, currentScan }) => {
  const stats = {
    totalScans: scans.length,
    activeScans: scans.filter((scan) => scan.status === "running").length,
    completedScans: scans.filter((scan) => scan.status === "completed").length,
    totalVulnerabilities: scans.reduce((total, scan) => total + (scan.vulnerabilities?.length || 0), 0),
    criticalVulns: scans.reduce(
      (total, scan) => total + (scan.vulnerabilities?.filter((v) => v.severity === "critical").length || 0),
      0,
    ),
    reportsGenerated: reports.length,
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "running":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "failed":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Scans" value={stats.totalScans} icon={Target} color="blue" />
        <StatCard title="Active Scans" value={stats.activeScans} icon={Scan} color="green" />
        <StatCard title="Vulnerabilities Found" value={stats.totalVulnerabilities} icon={AlertTriangle} color="red" />
        <StatCard title="Reports Generated" value={stats.reportsGenerated} icon={FileText} color="purple" />
      </div>

      {/* Current Scan Status */}
      {currentScan && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Current Scan Status</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Target: {currentScan.target}</p>
                <p className="text-sm text-gray-600">Type: {currentScan.scanType}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(currentScan.status)}
                <span className="text-sm font-medium capitalize">{currentScan.status}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentScan.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${currentScan.progress || 0}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">{currentScan.currentStep || "Initializing..."}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Scans */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Scans</h3>
          <div className="space-y-3">
            {scans.slice(0, 5).map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{scan.target}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(scan.createdAt).toLocaleDateString()} - {scan.scanType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(scan.status)}
                  <span className="text-sm">{scan.vulnerabilities?.length || 0} vulns</span>
                </div>
              </div>
            ))}
            {scans.length === 0 && <p className="text-gray-500 text-center py-4">No scans yet</p>}
          </div>
        </div>

        {/* Vulnerability Summary */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Vulnerability Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Critical</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalVulnerabilities > 0 ? (stats.criticalVulns / stats.totalVulnerabilities) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{stats.criticalVulns}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">High</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                </div>
                <span className="text-sm font-bold">
                  {scans.reduce(
                    (total, scan) => total + (scan.vulnerabilities?.filter((v) => v.severity === "high").length || 0),
                    0,
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Medium</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <span className="text-sm font-bold">
                  {scans.reduce(
                    (total, scan) => total + (scan.vulnerabilities?.filter((v) => v.severity === "medium").length || 0),
                    0,
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Low</span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                </div>
                <span className="text-sm font-bold">
                  {scans.reduce(
                    (total, scan) => total + (scan.vulnerabilities?.filter((v) => v.severity === "low").length || 0),
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
