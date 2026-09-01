// Central place to determine the Backend API base URL.
//
// On Replit (and similar cloud IDEs) the Frontend and Backend are often
// served from different hosts/ports, so hardcoding "http://localhost:5000"
// does not always work. This helper:
//   1. Uses REACT_APP_API_URL when it has been explicitly configured.
//   2. Otherwise falls back to the current page's hostname on port 5000
//      (this covers both "localhost" during local development and the
//      Replit-assigned hostname when the app is opened through the browser).
const resolveApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:5000`;
  }

  return 'http://localhost:5000';
};

export const API_URL = resolveApiUrl();

// eslint-disable-next-line no-console
console.log('[config] Backend API_URL resolved to:', API_URL);

export default API_URL;
