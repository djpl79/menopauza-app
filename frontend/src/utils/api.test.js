/**
 * Tests for the backend URL auto-detection logic in api.js.
 *
 * Because `getApiUrl()` reads `process.env` and `window.location` once at
 * import time, each test case resets modules and re-requires the file so
 * the values used are picked up freshly.
 */

const setLocation = (hostname, protocol = 'https:') => {
  delete window.location;
  window.location = { hostname, protocol };
};

const loadGetApiUrl = () => {
  let mod;
  jest.isolateModules(() => {
    mod = require('./api');
  });
  return mod.getApiUrl;
};

describe('getApiUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_API_URL;
    delete process.env.REACT_APP_BACKEND_PORT;
    delete process.env.REACT_APP_FRONTEND_PORT;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('uses REACT_APP_API_URL when explicitly set', () => {
    process.env.REACT_APP_API_URL = 'https://api.example.com';
    setLocation('localhost');
    const getApiUrl = loadGetApiUrl();
    expect(getApiUrl()).toBe('https://api.example.com');
  });

  it('resolves to localhost:5000 when running on localhost', () => {
    setLocation('localhost', 'http:');
    const getApiUrl = loadGetApiUrl();
    expect(getApiUrl()).toBe('http://localhost:5000');
  });

  it('resolves legacy repl.co hostnames (port as suffix)', () => {
    setLocation('menopauza-app-3000.myuser.repl.co');
    const getApiUrl = loadGetApiUrl();
    expect(getApiUrl()).toBe('https://menopauza-app-5000.myuser.repl.co');
  });

  it('resolves current replit.dev hostnames (port as prefix)', () => {
    setLocation('abcd1234-5678.3000-myuser.menopauza-app.replit.dev');
    const getApiUrl = loadGetApiUrl();
    expect(getApiUrl()).toBe(
      'https://abcd1234-5678.5000-myuser.menopauza-app.replit.dev'
    );
  });

  it('falls back to same host with backend port for other hosts', () => {
    setLocation('192.168.1.10', 'http:');
    const getApiUrl = loadGetApiUrl();
    expect(getApiUrl()).toBe('http://192.168.1.10:5000');
  });
});
