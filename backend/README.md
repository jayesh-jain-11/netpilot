
# netpilot_backend

# Pentesting Automation Workflow – Backend

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Architecture](#architecture)
8. [API Endpoints](#api-endpoints)
9. [Controllers](#controllers)
10. [Services](#services)
11. [Security Practices](#security-practices)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Troubleshooting](#troubleshooting)
15. [Integration with Frontend](#integration-with-frontend)
16. [User Stories](#user-stories)
17. [Contributing](#contributing)
18. [License](#license)
19. [Acknowledgements](#acknowledgements)
20. [Additional Resources](#additional-resources)
21. [Contact](#contact)

---

## Project Overview

The backend folder contains the server-side logic for the Pentesting Automation Workflow. This backend is responsible for orchestrating network scans, analyzing vulnerabilities, generating AI-powered security reports, and serving data to the frontend application. It is built with Node.js and Express, and integrates with AI services such as Google Gemini and OpenAI for advanced analysis and reporting.

The backend exposes a RESTful API that allows the frontend to initiate scans, retrieve scan results, generate and fetch reports, and monitor system health. It is designed for scalability, security, and maintainability, supporting both individual users and enterprise deployments.

---

## Features

- **Network Scanning:** Simulates and manages penetration tests on target systems.
- **Vulnerability Assessment:** Identifies and categorizes vulnerabilities by severity.
- **AI-Powered Reporting:** Uses Gemini and OpenAI to generate executive summaries and detailed analysis.
- **Report Generation:** Creates comprehensive reports with risk scores, business impact, and compliance information.
- **RESTful API:** Provides endpoints for scan management, report generation, and health checks.
- **In-Memory Storage:** Stores scans and reports in memory for rapid prototyping (can be replaced with a database).
- **CORS Support:** Configurable cross-origin resource sharing for secure frontend-backend communication.
- **Environment Configuration:** Uses `.env` files for sensitive settings and API keys.
- **Scheduled Cleanup:** Automatically removes old scans and reports to manage memory.
- **Error Handling:** Centralized error middleware for robust API responses.
- **Extensible Architecture:** Modular controllers and services for easy feature expansion.

---

## Technology Stack

- **Node.js:** JavaScript runtime for server-side development.
- **Express:** Web framework for building RESTful APIs.
- **Google Gemini API:** AI-powered vulnerability analysis and reporting.
- **OpenAI API:** Alternative AI service for security assessments.
- **Axios:** HTTP client for making API requests.
- **UUID:** Generates unique identifiers for scans and reports.
- **Node-cron:** Schedules periodic tasks for cleanup.
- **dotenv:** Loads environment variables from `.env` files.
- **CORS:** Middleware for cross-origin requests.
- **Jest/Supertest:** For unit and integration testing (recommended for future expansion).

---

## Folder Structure

```
backend/
├── .env
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── server.js
    ├── controllers/
    │   ├── reportController.js
    │   └── scanController.js
    └── services/
        ├── geminiService.js
        └── llmService.js
```

- **.env:** Environment variables for API keys, ports, and configuration.
- **.gitignore:** Specifies files and folders to exclude from version control.
- **package.json:** Lists dependencies and scripts for running the backend.
- **README.md:** Documentation for the backend folder.
- **src/server.js:** Main entry point, sets up Express server and middleware.
- **src/controllers/**: Contains route handlers for scans and reports.
- **src/services/**: Contains business logic for AI analysis and vulnerability assessment.

---

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher)
- Google Gemini API Key (for AI analysis)
- OpenAI API Key (optional, for alternative AI analysis)

### Steps

1. **Clone the Repository**
   ```sh
   git clone https://github.com/your-org/pentesting-automation-workflow.git
   cd pentesting-automation-workflow/backend
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Configure Environment Variables**
   - Copy `.env.example` to `.env` and fill in your API keys and settings.
   - Example:
     ```
     NODE_ENV=development
     PORT=5000
     FRONTEND_URL=https://gilded-snickerdoodle-3b2e89.netlify.app
     GEMINI_API_KEY=your-gemini-api-key
     OPENAI_API_KEY=your-openai-api-key
     ```

4. **Start Development Server**
   ```sh
   npm run dev
   ```
   The backend will run on `http://localhost:5000` by default.

5. **Start Production Server**
   ```sh
   npm start
   ```

---

## Configuration

### Environment Variables

- **PORT:** Port for the backend server (default: 5000).
- **NODE_ENV:** Environment mode (`development` or `production`).
- **FRONTEND_URL:** Allowed origin for CORS.
- **GEMINI_API_KEY:** API key for Google Gemini service.
- **OPENAI_API_KEY:** API key for OpenAI service (optional).

### .gitignore

Sensitive files such as `.env`, `node_modules`, and debug logs are excluded from version control.

---

## Architecture

The backend follows a modular architecture with clear separation of concerns:

- **Server Layer:** Initializes Express, sets up middleware, and mounts controllers.
- **Controller Layer:** Handles HTTP requests, validates input, and manages scan/report lifecycle.
- **Service Layer:** Contains business logic for AI analysis, vulnerability assessment, and report generation.
- **Storage Layer:** Uses in-memory arrays for scans and reports (replaceable with a database).
- **Scheduled Tasks:** Uses node-cron for periodic cleanup of old data.

### Data Flow

1. **Frontend sends request** (e.g., start scan).
2. **Controller validates and processes request.**
3. **Service performs business logic** (e.g., simulates scan, calls AI API).
4. **Controller returns response** to frontend.
5. **Scheduled tasks** clean up old scans/reports.

---

## API Endpoints

### Health Check

- `GET /api/health`
  - Returns server status, timestamp, and Gemini connection status.

### Scans

- `GET /api/scans`
  - Retrieves all scans with vulnerability statistics.

- `GET /api/scans/:id`
  - Retrieves a specific scan by ID.

- `POST /api/scans/start`
  - Starts a new scan.
  - Request body: `{ target, scanType, description }`
  - Validates target format (IP/domain).

- `POST /api/scans/:id/stop`
  - Stops/cancels a running scan.

- `DELETE /api/scans/:id`
  - Deletes a scan by ID.

### Reports

- `GET /api/reports`
  - Retrieves all generated reports.

- `GET /api/reports/:id`
  - Retrieves a specific report by ID.

- `POST /api/reports/generate`
  - Generates an AI-powered report for a completed scan.
  - Request body: `{ scanId }`

- `GET /api/reports/:id/export/pdf`
  - Placeholder for exporting a report as PDF.

### Gemini Connection

- `GET /api/test-gemini`
  - Tests connection to Gemini API.

---

## Controllers

### scanController.js

- Manages scan lifecycle: start, stop, delete, retrieve.
- Simulates network scanning with realistic delays and phases.
- Generates mock vulnerabilities based on scan type.
- Validates input and manages scan metadata.

### reportController.js

- Generates AI-powered reports using GeminiService.
- Calculates risk scores and business impact for vulnerabilities.
- Adds compliance information (PCI DSS, ISO 27001, NIST, GDPR).
- Suggests next steps based on vulnerability severity.
- Supports report retrieval and export.

---

## Services

### geminiService.js

- Integrates with Google Gemini API for vulnerability analysis.
- Builds structured prompts for AI analysis.
- Parses AI responses into executive summary, risk assessment, detailed analysis, remediation steps, and recommendations.
- Provides mock analysis if API key is missing.

### llmService.js

- Integrates with OpenAI API for alternative analysis.
- Similar structure to GeminiService.
- Used for fallback or comparative analysis.

---

## Security Practices

- **Input Validation:** All endpoints validate user input to prevent injection and misuse.
- **CORS Configuration:** Only allows requests from trusted frontend origins.
- **Environment Variables:** Sensitive keys are stored in `.env` and never committed.
- **Error Handling:** Centralized error middleware prevents information leakage.
- **Dependency Management:** Regularly update dependencies to patch vulnerabilities.
- **Rate Limiting:** Recommended for production to prevent abuse (not implemented in prototype).
- **HTTPS:** Use HTTPS in production for secure communication.
- **Authentication:** Add JWT or OAuth for user authentication in production.

---

## Testing

- **Unit Tests:** Recommended for controllers and services using Jest.
- **Integration Tests:** Use Supertest to test API endpoints.
- **Mocking:** Mock external API calls for reliable test results.
- **Continuous Integration:** Integrate with CI tools for automated testing.

### Example Test (Jest + Supertest)

```js
const request = require('supertest');
const app = require('../src/server');

describe('GET /api/health', () => {
  it('should return server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });
});
```

---

## Deployment

### Local Deployment

1. Ensure `.env` is configured.
2. Run `npm start` for production or `npm run dev` for development.

### Cloud Deployment

- Deploy to cloud platforms (AWS, Azure, GCP, Heroku, etc.).
- Set environment variables securely in cloud dashboard.
- Use process managers (PM2, Docker) for reliability.

### Static Hosting

- Backend serves API only; frontend is hosted separately (Netlify, Vercel).

### Environment Variables

- Set API keys and allowed origins in cloud environment.

---

## Troubleshooting

- **Port Conflicts:** Change `PORT` in `.env` if default is in use.
- **API Key Errors:** Ensure Gemini/OpenAI keys are valid and not expired.
- **CORS Issues:** Verify `FRONTEND_URL` matches deployed frontend.
- **Dependency Errors:** Run `npm install` to resolve missing packages.
- **Memory Leaks:** For production, replace in-memory storage with a database.
- **Network Issues:** Check firewall and security group settings for cloud deployment.

### Common Issues

- **Scan Not Starting:** Check input validation and server logs.
- **Report Generation Fails:** Ensure scan is completed and API keys are set.
- **PDF Export Not Working:** Implement PDF generation (e.g., with Puppeteer or jsPDF).

---

## Integration with Frontend

The backend is designed to work seamlessly with the frontend application. The frontend interacts with the backend via RESTful API calls to manage scans, retrieve results, and generate reports.

### Example Workflow

1. **User initiates a scan** from the frontend.
2. **Frontend sends POST request** to `/api/scans/start`.
3. **Backend simulates scan** and updates status.
4. **Frontend polls scan status** via `/api/scans/:id`.
5. **Once completed, frontend requests report** via `/api/reports/generate`.
6. **Backend generates AI-powered report** and returns structured data.
7. **Frontend displays report** and allows export.

### API Reference

See [Frontend Documentation](../frontend/README.md) for integration details.

---

## User Stories

### Security Analyst

"As a security analyst, I want to initiate scans and receive detailed, actionable reports so that I can identify and remediate vulnerabilities efficiently."

### IT Manager

"As an IT manager, I want to view compliance information and executive summaries so that I can report on risk and remediation progress to leadership."

### Developer

"As a developer, I want to extend backend functionality, add new scan types, and integrate additional AI services so that the system remains innovative and robust."

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Write clear, concise commit messages.
4. Ensure all tests pass.
5. Submit a pull request with a detailed description.

### Code Style

- Use modular controllers and services.
- Follow ESLint guidelines.
- Write tests for new features.

---

## License

This project is proprietary and intended for internal use only. All rights reserved.

---

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Google Gemini](https://ai.google.dev/)
- [OpenAI](https://openai.com/)
- [Axios](https://axios-http.com/)
- [UUID](https://www.npmjs.com/package/uuid)
- [Node-cron](https://www.npmjs.com/package/node-cron)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

## Additional Resources

- [Backend Documentation](https://your-org-docs.com/backend)
- [API Reference](https://your-org-docs.com/api)
- [Security Guidelines](https://your-org-docs.com/security)

---

