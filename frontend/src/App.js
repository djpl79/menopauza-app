import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔎 Checking for existing session in localStorage...');
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (storedUser && token) {
        console.log('✅ Found existing session for:', JSON.parse(storedUser).email);
        setUser(JSON.parse(storedUser));
      } else {
        console.log('ℹ️ No existing session found');
      }
    } catch (error) {
      console.error('❌ Error reading session from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    console.log('👋 Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="container">⏳ Ładowanie...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
