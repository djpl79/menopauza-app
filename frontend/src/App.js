import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import API_URL from './config';
import Login from './pages/Login';
import Register from './pages/Register';

// Every axios request/response goes through the Backend at API_URL.
axios.defaults.baseURL = API_URL;

const isDev = process.env.NODE_ENV !== 'production';

// Log every outgoing/incoming axios call to make connection issues easy to
// diagnose in the browser console (Network tab + Console tab). Disabled in
// production builds to avoid leaking request/response payloads.
axios.interceptors.request.use((config) => {
  if (isDev) {
    // eslint-disable-next-line no-console
    console.log(`[axios] -> ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  }
  return config;
});

axios.interceptors.response.use(
  (response) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log(`[axios] <- ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(
        `[axios] <- ERROR ${error.config?.url || ''}:`,
        error.response?.status,
        error.response?.data || error.message
      );
    }
    return Promise.reject(error);
  }
);

function Dashboard({ user, onLogout }) {
  return (
    <div className="container">
      <div className="navbar" style={{ marginBottom: '20px' }}>
        <h1>🌸 Menopauza App</h1>
        <div>
          <span style={{ marginRight: '15px' }}>Witaj, {user.firstName || user.username}!</span>
          <button onClick={onLogout}>Wyloguj</button>
        </div>
      </div>
      <div className="card">
        <h2>✅ Zalogowano pomyślnie</h2>
        <p>Twój dashboard jest gotowy.</p>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (isDev) {
      console.log('[App] Checking backend health at', `${API_URL}/api/health`);
    }
    axios
      .get('/api/health')
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      {backendStatus === 'offline' && (
        <div
          style={{
            backgroundColor: '#ffe0e0',
            border: '1px solid red',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          ⚠️ Nie można połączyć się z Backendem ({API_URL}). Sprawdź, czy serwer jest uruchomiony.
        </div>
      )}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login setUser={setUser} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register setUser={setUser} />}
        />
        <Route
          path="/"
          element={
            user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
