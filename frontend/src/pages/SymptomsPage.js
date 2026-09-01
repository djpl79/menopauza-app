import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SymptomsPage() {
  const [symptoms, setSymptoms] = useState([]);
  const [formData, setFormData] = useState({
    symptomType: '',
    severity: 5,
    description: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSymptoms();
  }, []);

  const fetchSymptoms = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('/api/symptoms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSymptoms(response.data);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/symptoms', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ symptomType: '', severity: 5, description: '' });
      fetchSymptoms();
    } catch (err) {
      console.error('Error adding symptom:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">Śledzenie objawów</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Typ objawu:</label>
            <input
              type="text"
              name="symptomType"
              value={formData.symptomType}
              onChange={handleChange}
              placeholder="np. Gorące uderzenia"
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Intensywność (1-10):</label>
            <input
              type="range"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              min="1"
              max="10"
              className="w-full"
            />
            <span className="text-gray-600">{formData.severity}/10</span>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Opis:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Opisz swoje doświadczenie..."
              className="w-full border rounded px-3 py-2 h-20"
            />
          </div>
          <button
            type="submit"
            className="bg-pink-600 text-white font-bold py-2 px-4 rounded hover:bg-pink-700"
          >
            Dodaj objaw
          </button>
        </form>
      </div>

      <div className="bg-white p-8 rounded-lg shadow">
        <h3 className="text-2xl font-bold text-pink-600 mb-4">Ostatnie wpisy</h3>
        {loading ? (
          <p className="text-gray-600">Ładowanie...</p>
        ) : symptoms.length === 0 ? (
          <p className="text-gray-600">Brak wpisów. Zacznij śledzić swoje objawy!</p>
        ) : (
          <div className="space-y-4">
            {symptoms.map((symptom) => (
              <div key={symptom.id} className="border-l-4 border-pink-600 p-4 bg-gray-50">
                <h4 className="font-bold text-gray-800">{symptom.symptom_type}</h4>
                <p className="text-gray-600">Intensywność: {symptom.severity}/10</p>
                <p className="text-gray-600">{symptom.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(symptom.recorded_at).toLocaleDateString('pl-PL')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SymptomsPage;
