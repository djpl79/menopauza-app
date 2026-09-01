const express = require('express');
const cors = require('cors');

const app = express();

// CORS enabled for ALL origins
app.use(cors());
app.use(express.json());

// Log every request
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// MOCK DATA - no database
// ============================================
const mockUsers = [
  { id: 1, username: 'test', email: 'test@menopauza.pl', password: 'test123', firstName: 'Test', lastName: 'User' }
];

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '🌸 Menopauza API is running (Mock Mode)',
    timestamp: new Date()
  });
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = mockUsers.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ error: 'Email lub hasło nieprawidłowe' });
  }

  res.json({
    token: 'mock_token_' + user.id,
    user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName }
  });
});

app.post('/api/auth/register', (req, res) => {
  const { username, email, password, firstName, lastName } = req.body || {};

  const newUser = {
    id: mockUsers.length + 1,
    username,
    email,
    password,
    firstName,
    lastName
  };
  mockUsers.push(newUser);

  res.json({
    token: 'mock_token_' + newUser.id,
    message: '✅ Użytkownik zarejestrowany',
    user: { id: newUser.id, username: newUser.username, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName }
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
