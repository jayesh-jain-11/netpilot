import React, { useState, useEffect } from 'react';
import { Play, FileText, Shield, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [scanResults, setScanResults] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [reports, setReports] = useState([]);
  const [targetIP, setTargetIP] = useState('');
  const [scanProgress, setScanProgress] = useState(0);

  // Mock data for demonstration
  const mockVulnerabilities = [
    { id: 1, severity: 'High', port: 22, service: 'SSH', issue: 'Weak password detected', risk: 9.2 },
    { id: 2, severity: 'Medium', port: 80, service: 'HTTP', issue: 'Directory traversal possible', risk: 6.5 },
    { id: 3, severity: 'Low', port: 443, service: 'HTTPS', issue: 'SSL certificate expired', risk: 3.1 },
    { id: 4, severity: 'Critical', port: 3389, service: 'RDP', issue: 'Remote code execution vulnerability', risk: 9.8 }
  ];

  const mockReports = [
    {
      id: 1,
      target: '192.168.1.100',
      date: '2024-01-15',
      vulnerabilities: 4,
      riskScore: 8.5,
      status: 'completed'
    },
    {
      id: 2,
      target: '10.0.0.50',
      date: '2024-01-14',
      vulnerabilities: 2,
      riskScore: 5.2,
      status: 'completed'
    }
  ];

  const startScan = async () => {
    if (!targetIP) {
      alert('Please enter a target IP address');
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    
    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsScanning(false);
          setScanResults(mockVulnerabilities);
          generateReport();
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const generateReport = () => {
    const newReport = {
      id: reports.length + 1,
      target: targetIP,
      date: new Date().toISOString().split('T')[0],
      vulnerabilities: mockVulnerabilities.length,
      riskScore: (mockVulnerabilities.reduce((sum, v) => sum + v.risk, 0) / mockVulnerabilities.length).toFixed(1),
      status: 'completed'
    };
    setReports([newReport, ...reports]);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600';
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vulnerabilities Found</p>
              <p className="text-2xl font-bold text-red-600">{scanResults.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-orange-600">
                {scanResults.length > 0 ? (scanResults.reduce((sum, v) => sum + v.risk, 0) / scanResults.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <Shield className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-2xl font-bold text-green-600">{isScanning ? 'Scanning...' : 'Ready'}</p>
            </div>
            {isScanning ? <Clock className="h-8 w-8 text-blue-600" /> : <CheckCircle className="h-8 w-8 text-green-600" />}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Start New Scan</h3>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter target IP (e.g., 192.168.1.100)"
            value={targetIP}
            onChange={(e) => setTargetIP(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={startScan}
            disabled={isScanning}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isScanning ? 'Scanning...' : 'Start Scan'}
          </button>
        </div>
        {isScanning && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {scanResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md border">
          <h3 className="text-lg font-semibold mb-4">Recent Vulnerabilities</h3>
          <div className="space-y-3">
            {scanResults.slice(0, 3).map((vuln) => (
              <div key={vuln.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getSeverityColor(vuln.severity)}`}>
                    {vuln.severity}
                  </span>
                  <span className="font-medium">Port {vuln.port} - {vuln.service}</span>
                </div>
                <span className="text-sm text-gray-600">{vuln.issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const VulnerabilitiesView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Vulnerability Details</h3>
        {scanResults.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No vulnerabilities found. Run a scan to see results.</p>
        ) : (
          <div className="space-y-4">
            {scanResults.map((vuln) => (
              <div key={vuln.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium text-white ${getSeverityColor(vuln.severity)}`}>
                      {vuln.severity}
                    </span>
                    <span className="font-semibold">Port {vuln.port} - {vuln.service}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Risk Score: {vuln.risk}</span>
                </div>
                <p className="text-gray-700 mb-2">{vuln.issue}</p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-1">LLM Recommendation:</p>
                  <p className="text-sm text-blue-700">
                    {vuln.severity === 'Critical' ? 'Immediate action required. Patch system and restrict access.' :
                     vuln.severity === 'High' ? 'Address within 24 hours. Update service and implement monitoring.' :
                     vuln.severity === 'Medium' ? 'Address within 1 week. Update configuration and review policies.' :
                     'Address during next maintenance window. Monitor for unusual activity.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ReportsView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h3 className="text-lg font-semibold mb-4">Scan Reports</h3>
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reports available. Complete a scan to generate reports.</p>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-semibold">Target: {report.target}</p>
                      <p className="text-sm text-gray-600">Date: {report.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Vulnerabilities: {report.vulnerabilities}</p>
                    <p className="text-sm font-medium">Risk Score: {report.riskScore}</p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 mb-1">Executive Summary:</p>
                  <p className="text-sm text-gray-700">
                    Scan completed on {report.target} revealing {report.vulnerabilities} vulnerabilities with an overall risk score of {report.riskScore}. 
                    {report.riskScore > 7 ? ' Critical issues require immediate attention.' : 
                     report.riskScore > 5 ? ' Moderate risk identified - address within 48 hours.' : 
                     ' Low risk profile - monitor and address during regular maintenance.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">PentestAI</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Network Penetration Testing with LLM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="w-64">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('vulnerabilities')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'vulnerabilities' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Vulnerabilities
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full text-left px-4 py-2 rounded-lg font-medium ${
                  activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Reports
              </button>
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'vulnerabilities' && <VulnerabilitiesView />}
            {activeTab === 'reports' && <ReportsView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
