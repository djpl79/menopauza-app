import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';

function Login({ setUser }) {
  const [email, setEmail] = useState('test@menopauza.pl');
  const [password, setPassword] = useState('test123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      console.log('Logging in with:', email, password);
      const response = await api.post('/api/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError('❌ Błąd logowania: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '100px auto' }}>
        <h1 style={{ textAlign: 'center' }}>🔐 Menopauza App</h1>
        <h2 style={{ textAlign: 'center', fontSize: '18px' }}>Logowanie</h2>
        
        {error && (
          <div style={{ 
            backgroundColor: '#ffe0e0', 
            border: '1px solid red', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '15px'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%' }}
          />
          <button type="submit" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
            {loading ? '⏳ Logowanie...' : '✅ Zaloguj się'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px', fontSize: '12px' }}>
          <p><strong>Test konto:</strong></p>
          <p>Email: test@menopauza.pl</p>
          <p>Hasło: test123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
