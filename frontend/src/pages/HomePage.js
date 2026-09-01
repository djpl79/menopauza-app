import React from 'react';

function HomePage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold text-gray-800 mb-4">🌸 Menopauza App</h1>
      <p className="text-xl text-gray-600 mb-8">
        Twój osobisty asystent na drodze przez menopauzę
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-pink-600 mb-4">📊 Śledzenie</h3>
          <p className="text-gray-600">Monitoruj swoje objawy i śledź postęp dzień po dniu</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-pink-600 mb-4">📚 Wiedza</h3>
          <p className="text-gray-600">Dowiedz się więcej o menopauzie i objawach</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow">
          <h3 className="text-2xl font-bold text-pink-600 mb-4">💬 Społeczność</h3>
          <p className="text-gray-600">Rozmawiaj z innymi kobietami i czerpij wspólnie wiedzę</p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
