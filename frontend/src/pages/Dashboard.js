import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState([]);
  const [articles, setArticles] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [error, setError] = useState('');

  const [symptomForm, setSymptomForm] = useState({ symptom: '', severity: 5, date: '' });
  const [forumForm, setForumForm] = useState({ title: '', content: '' });

  const loadData = async () => {
    try {
      const [symptomsRes, articlesRes, forumRes] = await Promise.all([
        api.get(`/api/symptoms/${user.id}`),
        api.get('/api/articles'),
        api.get('/api/forum')
      ]);
      setSymptoms(symptomsRes.data);
      setArticles(articlesRes.data);
      setForumPosts(forumRes.data);
    } catch (err) {
      setError('❌ Nie udało się załadować danych: ' + (err.response?.data?.error || err.message));
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleAddSymptom = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/symptoms', {
        symptom: symptomForm.symptom,
        severity: symptomForm.severity,
        date: symptomForm.date || new Date().toISOString()
      });
      setSymptomForm({ symptom: '', severity: 5, date: '' });
      await loadData();
    } catch (err) {
      setError('❌ Nie udało się dodać objawu: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddForumPost = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/forum', forumForm);
      setForumForm({ title: '', content: '' });
      await loadData();
    } catch (err) {
      setError('❌ Nie udało się dodać wpisu: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '700px', margin: '30px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>🌸 Witaj, {user.firstName || user.username}!</h1>
          <button onClick={handleLogout}>Wyloguj się</button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#ffe0e0', border: '1px solid red', padding: '10px', borderRadius: '5px', marginTop: '15px' }}>
            {error}
          </div>
        )}

        <section style={{ marginTop: '25px' }}>
          <h2>📊 Twoje objawy</h2>
          <form onSubmit={handleAddSymptom} style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Objaw"
              value={symptomForm.symptom}
              onChange={(e) => setSymptomForm({ ...symptomForm, symptom: e.target.value })}
              required
              style={{ width: '100%' }}
            />
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Nasilenie (1-10)"
              value={symptomForm.severity}
              onChange={(e) => setSymptomForm({ ...symptomForm, severity: e.target.value })}
              required
              style={{ width: '100%' }}
            />
            <input
              type="date"
              value={symptomForm.date}
              onChange={(e) => setSymptomForm({ ...symptomForm, date: e.target.value })}
              style={{ width: '100%' }}
            />
            <button type="submit" style={{ marginTop: '10px' }}>➕ Dodaj objaw</button>
          </form>
          <ul>
            {symptoms.map((s) => (
              <li key={s.id}>
                {new Date(s.date).toLocaleDateString('pl-PL')} — {s.symptom} (nasilenie: {s.severity})
              </li>
            ))}
            {symptoms.length === 0 && <li>Brak zapisanych objawów.</li>}
          </ul>
        </section>

        <section style={{ marginTop: '25px' }}>
          <h2>📚 Artykuły</h2>
          <ul>
            {articles.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong>
                <p>{a.content}</p>
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginTop: '25px' }}>
          <h2>💬 Forum</h2>
          <form onSubmit={handleAddForumPost} style={{ marginBottom: '15px' }}>
            <input
              type="text"
              placeholder="Tytuł"
              value={forumForm.title}
              onChange={(e) => setForumForm({ ...forumForm, title: e.target.value })}
              required
              style={{ width: '100%' }}
            />
            <input
              type="text"
              placeholder="Treść"
              value={forumForm.content}
              onChange={(e) => setForumForm({ ...forumForm, content: e.target.value })}
              required
              style={{ width: '100%' }}
            />
            <button type="submit" style={{ marginTop: '10px' }}>➕ Dodaj wpis</button>
          </form>
          <ul>
            {forumPosts.map((p) => (
              <li key={p.id}>
                <strong>{p.title}</strong> ({p.views} wyświetleń)
                <p>{p.content}</p>
              </li>
            ))}
            {forumPosts.length === 0 && <li>Brak wpisów na forum.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
