import axios from "axios"

const API_BASE_URL =  import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error("❌ API Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error("❌ API Response Error:", error.response?.status, error.message)

    if (error.response?.status === 404) {
      throw new Error("Resource not found")
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || "Bad request")
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.")
    } else if (error.code === "ECONNREFUSED") {
      throw new Error("Cannot connect to server. Please ensure the backend is running.")
    }

    throw error
  },
)

const apiService = {
  // Health check
  checkHealth: async () => {
    const response = await apiClient.get("/health")
    return response.data
  },

  // Test Gemini connection
  testGemini: async () => {
    const response = await apiClient.get("/test-gemini")
    return response.data
  },

  // Scan operations
  getScans: async () => {
    const response = await apiClient.get("/scans")
    return response.data
  },

  getScan: async (scanId) => {
    const response = await apiClient.get(`/scans/${scanId}`)
    return response.data
  },

  startScan: async (scanConfig) => {
    const response = await apiClient.post("/scans/start", scanConfig)
    return response.data
  },

  stopScan: async (scanId) => {
    const response = await apiClient.post(`/scans/${scanId}/stop`)
    return response.data
  },

  deleteScan: async (scanId) => {
    const response = await apiClient.delete(`/scans/${scanId}`)
    return response.data
  },

  // Report operations
  getReports: async () => {
    const response = await apiClient.get("/reports")
    return response.data
  },

  getReport: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}`)
    return response.data
  },

  generateReport: async (scanId) => {
    const response = await apiClient.post("/reports/generate", { scanId })
    return response.data
  },

  exportReportPDF: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}/export/pdf`)
    return response.data
  },
}

export default apiService
