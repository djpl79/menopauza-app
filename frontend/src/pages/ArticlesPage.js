import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/articles');
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">📚 Baza wiedzy</h2>

        {loading ? (
          <p className="text-gray-600">Ładowanie...</p>
        ) : articles.length === 0 ? (
          <p className="text-gray-600">Brak artykułów. Wróć wkrótce!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((article) => (
              <div key={article.id} className="border rounded-lg p-6 hover:shadow-lg cursor-pointer">
                <h3 className="text-xl font-bold text-pink-600 mb-2">{article.title}</h3>
                <p className="text-gray-600 mb-4">{article.content.substring(0, 150)}...</p>
                <span className="inline-block bg-pink-100 text-pink-800 px-3 py-1 rounded text-sm">
                  {article.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticlesPage;
