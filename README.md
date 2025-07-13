# netpilot_frontend

# Pentesting Automation Workflow – Frontend
[🔗 Demo Link](https://gilded-snickerdoodle-3b2e89.netlify.app)
  
## Table of Contents
  


1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Installation & Setup](#installation--setup)
6. [Configuration](#configuration)
7. [Development Workflow](#development-workflow)
8. [Component Architecture](#component-architecture)
9. [API Integration](#api-integration)
10. [Styling & Theming](#styling--theming)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)
15. [License](#license)
16. [Acknowledgements](#acknowledgements)

---

## Project Overview

This folder contains the frontend application for the Pentesting Automation Workflow. The goal of this project is to provide a user-friendly interface for automating network penetration testing tasks, managing scan jobs, viewing results, and generating reports. The frontend is built using modern web technologies to ensure scalability, maintainability, and a responsive user experience.

The application is designed to interact with a backend API, allowing users to initiate scans, monitor progress, and review findings. It supports multiple scan types, report exports, and user authentication, making it suitable for both individual security professionals and teams.

---

## Features

- **Dashboard:** Overview of scan statistics, recent activity, and system health.
- **Scan Management:** Create, schedule, and monitor penetration tests.
- **Results Visualization:** Interactive display of vulnerabilities, affected hosts, and remediation steps.
- **Report Generation:** Export scan results in PDF, CSV, or JSON formats.
- **User Authentication:** Secure login and role-based access control.
- **Notifications:** Real-time alerts for scan completion, errors, and updates.
- **Responsive Design:** Optimized for desktop and mobile devices.
- **Integration:** Connects seamlessly with the backend API for data retrieval and actions.

---

## Technology Stack

- **React:** Component-based UI library for building interactive interfaces.
- **Vite:** Fast build tool and development server for modern web projects.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **Axios/Fetch:** For HTTP requests to the backend API.
- **Jest/React Testing Library:** For unit and integration testing.
- **ESLint & Prettier:** Code quality and formatting tools.
- **Node.js & npm:** Package management and script execution.

---

## Folder Structure

```
frontend/
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
├── vite.config.js
├── public/
│   └── _redirects
└── src/
    ├── App.jsx
    ├── index.css
    ├── main.jsx
    ├── components/
    │   ├── Dashboard.jsx
    │   ├── NewScan.jsx
    │   ├── Reports.jsx
    │   ├── ScanResults.jsx
    │   └── ...other components
    └── services/
        └── apiService.js
```

- **.gitignore:** Specifies files and folders to exclude from version control.
- **index.html:** Main HTML entry point for the application.
- **package.json:** Lists dependencies and scripts.
- **tailwind.config.js:** Tailwind CSS configuration.
- **vite.config.js:** Vite build and dev server configuration.
- **public/_redirects:** Redirects configuration for deployment.
- **src/**: Contains all source code, components, styles, and services.

---

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher recommended)
- npm (v8 or higher)










Here's your full setup as a clean `setup.md` file:

---

````markdown
# 🛠 NetPilot Setup Guide

Follow these steps to set up both the **frontend** and **backend** for the NetPilot project.

---

## 🚀 1. Clone the Repository

```sh
git clone https://github.com/jayesh-jain-11/netpilot
cd netpilot
````

---

## 🎨 2. Frontend Setup (`/frontend`)

### Step 1: Navigate to the frontend folder

```sh
cd frontend
```

### Step 2: Create a `.env` file

```sh
touch .env
```

### Step 3: Add the following content to `.env`:

```env
# .env (frontend)
VITE_API_URL=http://localhost:5000/api
```


### Step 4: Install frontend dependencies

```sh
npm install
```

### Step 5: Start the frontend development server

```sh
npm run dev
```

> The app should now be running at [http://localhost:5173](http://localhost:5173)

---

## 🧠 3. Backend Setup (`/backend`)

### Step 1: Navigate to the backend folder

```sh
cd ../backend
```

### Step 2: Create a `.env` file

```sh
touch .env
```

### Step 3: Add the following content to `.env`:

```env
# .env (backend)
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_api_key_here
```


### Step 4: Install backend dependencies

```sh
npm install
```

### Step 5: Start the backend server

```sh
npm start
```

> The backend should now be running at [http://localhost:5000](http://localhost:5000)



---


















## Configuration

### Tailwind CSS

Customize your theme, colors, and breakpoints in `tailwind.config.js`.

---

## Development Workflow

- **Feature Development:** Create new components in `src/components/`. Use functional components and hooks.
- **State Management:** Use React's built-in state management or context API for global state.
- **API Calls:** Centralize API interactions in `src/services/apiService.js`.
- **Styling:** Use Tailwind utility classes. For custom styles, add to `src/index.css`.
- **Testing:** Write tests in `src/__tests__/` using Jest and React Testing Library.
- **Linting & Formatting:** Run `npm run lint` and `npm run format` before committing.

---

## Component Architecture

### Main Components

- **App.jsx:** Root component, handles routing and layout.
- **Dashboard.jsx:** Displays summary statistics and recent scans.
- **NewScan.jsx:** Form for initiating new penetration tests.
- **ScanResults.jsx:** Shows detailed results of completed scans.
- **Reports.jsx:** Allows users to view and export reports.

### Example Component Structure

```jsx
// src/components/Dashboard.jsx
import React from 'react';

const Dashboard = ({ stats, recentScans }) => (
  <div>
    <h2>Dashboard</h2>
    {/* Render stats and recent scans */}
  </div>
);

export default Dashboard;
```

---

## API Integration

All backend communication is handled via the `apiService.js` file. This centralizes HTTP requests and error handling.

### Example API Call

```js
// src/services/apiService.js
import axios from 'axios';

const API_URL = process.env.VITE_API_URL;

export const fetchScans = async () => {
  try {
    const response = await axios.get(`${API_URL}/scans`);
    return response.data;
  } catch (error) {
    // Handle error
    throw error;
  }
};
```

---

## Styling & Theming

- **Tailwind CSS:** Use utility classes for rapid styling.
- **Custom Styles:** Add to `src/index.css` as needed.
- **Dark Mode:** Supported via Tailwind's dark mode configuration.

### Example

```html
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Start Scan
</button>
```

---

## Testing

- **Unit Tests:** Write tests for components and services.
- **Integration Tests:** Test user flows and API interactions.
- **Run Tests:**
  ```sh
  npm run test
  ```

### Example Test

```js
// src/__tests__/Dashboard.test.jsx
import { render, screen } from '@testing-library/react';
import Dashboard from '../components/Dashboard';

test('renders dashboard title', () => {
  render(<Dashboard stats={{}} recentScans={[]} />);
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
});
```

---

## Deployment

### Static Hosting

The frontend is designed for static hosting platforms like Netlify or Vercel.

- **Netlify:** Place `_redirects` in `public/` for SPA routing.
- **Vercel:** Configure via `vercel.json` if needed.

### Steps

1. Build the project:
   ```sh
   npm run build
   ```
2. Deploy the contents of the `dist/` folder.

### Environment Variables

Set production environment variables in your hosting platform’s dashboard.

---

## Troubleshooting

- **Build Errors:** Ensure Node.js and npm versions are compatible.
- **API Issues:** Check that `VITE_API_URL` is set correctly and backend is running.
- **Styling Issues:** Verify Tailwind CSS is configured and classes are applied.
- **Authentication Problems:** Confirm tokens and credentials are valid.

### Common Issues

- **Port Conflicts:** Change the default port in `vite.config.js` if needed.
- **CORS Errors:** Ensure backend API allows requests from frontend origin.
- **Missing Dependencies:** Run `npm install` to resolve.

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Write clear, concise commit messages.
4. Ensure all tests pass.
5. Submit a pull request with a detailed description.

### Code Style

- Use functional components and hooks.
- Follow ESLint and Prettier guidelines.
- Write tests for new features.

---

## License

This project is proprietary and intended for internal use only . All rights reserved.

---

## Acknowledgements

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jest](https://jestjs.io/)
- [Netlify](https://www.netlify.com/)
- [Vercel](https://vercel.com/)

---

## Additional Resources

- [Frontend Documentation](https://your-org-docs.com/frontend)
- [API Reference](https://your-org-docs.com/api)
- [Security Guidelines](https://your-org-docs.com/security)

---

## Contact

For support or questions, contact the development team at `security-dev@socgen.com`.

---

