import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const userRes = await axios.get('/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const symptomsRes = await axios.get('/api/symptoms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);
      setRecentSymptoms(symptomsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Ładowanie...</div>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold text-pink-600 mb-4">
          Witaj, {user?.first_name || user?.username}! 👋
        </h1>
        <p className="text-gray-600">Oto Twój pulpit sterowania</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold text-pink-600 mb-4">📊 Ostatnie objawy</h3>
          <p className="text-gray-600">{recentSymptoms.length} wpisów</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold text-pink-600 mb-4">📚 Przeczytane artykuły</h3>
          <p className="text-gray-600">Sprawdź bazę wiedzy</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-xl font-bold text-pink-600 mb-4">💬 Dyskusje forum</h3>
          <p className="text-gray-600">Dołącz do rozmów</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
