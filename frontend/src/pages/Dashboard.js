import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user, onLogout }) {
  const [symptoms, setSymptoms] = useState([]);
  const [articles, setArticles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        console.log('📡 Fetching symptoms for user:', user.id);
        const symptomsRes = await axios.get(`/api/symptoms/${user.id}`);
        console.log('✅ Symptoms response:', symptomsRes.data);
        setSymptoms(symptomsRes.data);

        console.log('📡 Fetching articles...');
        const articlesRes = await axios.get('/api/articles');
        console.log('✅ Articles response:', articlesRes.data);
        setArticles(articlesRes.data);
      } catch (err) {
        console.error('❌ Dashboard data fetch error:', err);
        setError('❌ Błąd pobierania danych: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  return (
    <div>
      <div className="navbar">
        <h1>🌸 Menopauza App</h1>
        <div>
          <span style={{ marginRight: '15px' }}>👋 Witaj, {user.firstName || user.username}!</span>
          <button onClick={onLogout}>🚪 Wyloguj</button>
        </div>
      </div>

      <div className="container">
        {error && (
          <div style={{ backgroundColor: '#ffe0e0', border: '1px solid red', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p>⏳ Ładowanie danych...</p>
        ) : (
          <div className="dashboard-grid">
            <div className="card">
              <h2>🩺 Ostatnie objawy</h2>
              {symptoms.length === 0 ? (
                <p>Brak zarejestrowanych objawów.</p>
              ) : (
                <ul>
                  {symptoms.map((s) => (
                    <li key={s.id}>
                      {s.symptom} — nasilenie {s.severity}/10 ({new Date(s.date).toLocaleDateString('pl-PL')})
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h2>📰 Artykuły</h2>
              {articles.length === 0 ? (
                <p>Brak artykułów.</p>
              ) : (
                <ul>
                  {articles.map((a) => (
                    <li key={a.id}>{a.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
