import axios from 'axios';

/**
 * Determine the correct backend API base URL.
 *
 * In cloud IDEs like Replit, the frontend and backend are served from
 * different ports but under the *same* host. Neither `localhost` nor
 * `127.0.0.1` resolve to the backend from the browser's perspective in
 * that environment, which causes `ERR_CONNECTION_REFUSED`.
 *
 * Resolution order:
 *  1. Explicit `REACT_APP_API_URL` env var (set at build/start time).
 *  2. Auto-detected Replit URL (same host, backend port instead of the
 *     frontend port).
 *  3. Same hostname as the page, on the backend port (works for most
 *     cloud/dev environments that share a host between services).
 *  4. Fallback to `http://localhost:5000` for plain local development.
 */
const BACKEND_PORT = process.env.REACT_APP_BACKEND_PORT || '5000';
const FRONTEND_PORT = process.env.REACT_APP_FRONTEND_PORT || '3000';

export const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window === 'undefined' || !window.location) {
    return `http://localhost:${BACKEND_PORT}`;
  }

  const { hostname, protocol } = window.location;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${BACKEND_PORT}`;
  }

  const isReplit =
    hostname.includes('.replit.dev') ||
    hostname.includes('.repl.co') ||
    hostname.includes('.repl.run');

  if (isReplit) {
    // Replit exposes each port on a distinct hostname, but the exact
    // format has changed over time:
    //  - Legacy (repl.co): "<slug>-3000.<user>.repl.co"
    //    -> port is a *suffix* of a label, preceded by "-" and followed by ".".
    //  - Current (replit.dev): "<uuid>.3000-<user>.<project>.replit.dev"
    //    -> port is a *prefix* of a label, followed by "-".
    // Try both patterns, only swapping the port number itself so nothing
    // else in the hostname is accidentally replaced.
    const suffixPattern = new RegExp(`-${FRONTEND_PORT}(?=\\.)`);
    const prefixPattern = new RegExp(`(^|\\.)${FRONTEND_PORT}-`);

    if (suffixPattern.test(hostname)) {
      return `${protocol}//${hostname.replace(suffixPattern, `-${BACKEND_PORT}`)}`;
    }

    if (prefixPattern.test(hostname)) {
      return `${protocol}//${hostname.replace(prefixPattern, `$1${BACKEND_PORT}-`)}`;
    }
  }

  // Fallback: same host, backend port (works when the platform proxies
  // ports on the same hostname).
  return `${protocol}//${hostname}:${BACKEND_PORT}`;
};

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
