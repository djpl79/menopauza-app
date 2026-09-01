import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ForumPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/forum/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-3xl font-bold text-pink-600 mb-6">💬 Forum społeczności</h2>
        <button className="bg-pink-600 text-white font-bold py-2 px-4 rounded hover:bg-pink-700 mb-6">
          + Nowy temat
        </button>

        {loading ? (
          <p className="text-gray-600">Ładowanie...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-600">Brak postów. Bądź pierwsza!</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="border rounded p-4 hover:shadow-md cursor-pointer">
                <h3 className="font-bold text-lg text-gray-800">{post.title}</h3>
                <p className="text-gray-600 mt-2">{post.content}</p>
                <div className="flex justify-between text-sm text-gray-500 mt-4">
                  <span>Autor: {post.username}</span>
                  <span>{post.views} wyświetleń</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForumPage;
