import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SymptomsPage from './pages/SymptomsPage';
import ForumPage from './pages/ForumPage';
import ArticlesPage from './pages/ArticlesPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-pink-600">
              🌸 Menopauza App
            </Link>
            <div className="space-x-4">
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-pink-600">
                    Dashboard
                  </Link>
                  <Link to="/symptoms" className="text-gray-700 hover:text-pink-600">
                    Objawy
                  </Link>
                  <Link to="/forum" className="text-gray-700 hover:text-pink-600">
                    Forum
                  </Link>
                  <Link to="/articles" className="text-gray-700 hover:text-pink-600">
                    Artykuły
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-pink-600">
                    Logowanie
                  </Link>
                  <Link to="/register" className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">
                    Rejestracja
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Routes */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={isLoggedIn ? <DashboardPage /> : <LoginPage />} />
            <Route path="/symptoms" element={isLoggedIn ? <SymptomsPage /> : <LoginPage />} />
            <Route path="/forum" element={<ForumPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
