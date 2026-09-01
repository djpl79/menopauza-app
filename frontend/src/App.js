import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import './index.css';

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('token');
    return stored ? { token: stored } : null;
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            user ? (
              <div className="container">
                <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
                  <h1>✅ Zalogowano</h1>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
