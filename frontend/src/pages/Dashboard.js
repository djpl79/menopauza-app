import React from 'react';

function Dashboard({ user, onLogout }) {
  return (
    <div className="container">
      <div className="navbar">
        <h1>🌸 Menopauza App</h1>
        <button onClick={onLogout}>🚪 Wyloguj się</button>
      </div>

      <div className="card">
        <h2>Witaj {user?.firstName || user?.username}!</h2>
        <p>Zalogowano jako: {user?.email}</p>
      </div>
    </div>
  );
}

export default Dashboard;
