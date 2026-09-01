// Auto-detect Backend URL.
// If REACT_APP_API_URL is set at build time, use it.
// Otherwise, assume the backend runs on the same hostname, port 5000.
const API_URL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:5000`;

export default API_URL;
