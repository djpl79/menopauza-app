// Automatically figures out where the backend API lives so the app
// works both locally (http://localhost:3000 -> http://localhost:5000)
// and on Replit (frontend and backend served from the same host, but
// different ports).
function getApiUrl() {
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using REACT_APP_API_URL from env:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  const { protocol, hostname } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const url = `${protocol}//${hostname}:5000`;
    console.log('🔧 Detected local dev, using backend URL:', url);
    return url;
  }

  // On Replit (and similar cloud IDEs) the frontend is exposed on one
  // port (3000) while the backend listens on 5000 on the same host.
  const url = `${protocol}//${hostname}:5000`;
  console.log('🔧 Detected remote host, using backend URL:', url);
  return url;
}

export const API_URL = getApiUrl();
