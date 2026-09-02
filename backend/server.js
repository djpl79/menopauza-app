const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment - using an insecure development default. Set JWT_SECRET before deploying.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-do-not-use-in-production';
const JWT_EXPIRES_IN = '7d';

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ============================================
// AUTH HELPERS
// ============================================
function signToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verifies the `Authorization: ****** header and attaches `req.userId`.
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Brak autoryzacji - zaloguj się ponownie' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Nieprawidłowy lub wygasły token' });
  }
}

// Ensures the authenticated user can only access their own resources.
function requireSelf(paramName) {
  return (req, res, next) => {
    if (String(req.userId) !== String(req.params[paramName])) {
      return res.status(403).json({ error: 'Brak dostępu do tego zasobu' });
    }
    next();
  };
}

// ============================================
// MOCK DATABASE - Zamiast PostgreSQL
// ============================================
const mockUsers = [
  {
    id: 1,
    username: 'test',
    email: 'test@menopauza.pl',
    // Plaintext seed password 'test123', hashed at startup below.
    password: bcrypt.hashSync('test123', 10),
    firstName: 'Test',
    lastName: 'User'
  }
];
let nextUserId = 2;

const mockSymptoms = [
  { id: 1, userId: 1, symptom: 'Gorące uderzenia', severity: 8, date: new Date('2026-08-20') },
  { id: 2, userId: 1, symptom: 'Bezsenność', severity: 7, date: new Date('2026-08-21') },
  { id: 3, userId: 1, symptom: 'Zmiany nastroju', severity: 6, date: new Date('2026-08-22') },
  { id: 4, userId: 1, symptom: 'Gorące uderzenia', severity: 7, date: new Date('2026-08-23') },
  { id: 5, userId: 1, symptom: 'Zmęczenie', severity: 5, date: new Date('2026-08-24') }
];

const mockArticles = [
  { id: 1, title: 'Objawy menopauzy - co powinna wiedzieć każda kobieta', content: 'Menopauza to naturalna faza życia każdej kobiety. W tym artykule dowiesz się wszystkiego o objawach...', createdAt: new Date() },
  { id: 2, title: 'Jak radzić sobie z bezsenną nocą', content: 'Bezsenność to jeden z najpowszechniejszych objawów menopauzy. Oto kilka porad...', createdAt: new Date() },
  { id: 3, title: 'Zdrowe odżywianie w okresie menopauzy', content: 'Prawidłowa dieta może znacząco poprawić twoje samopoczucie...', createdAt: new Date() }
];

const mockForumPosts = [
  { id: 1, userId: 1, title: 'Moje doświadczenia z gorącymi uderzeniami', content: 'Chciałabym się podzielić swoimi doświadczeniami...', views: 45, createdAt: new Date() },
  { id: 2, userId: 1, title: 'Gdzie znaleźć wsparcie?', content: 'Szukam osoby, z którą mogę porozmawiać o mojej sytuacji...', views: 32, createdAt: new Date() }
];

const mockMessages = [];
let messageId = 1;

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email i hasło są wymagane' });
    }

    const normalizedEmail = String(email).toLowerCase();
    const existingUser = mockUsers.find(
      u => u.email.toLowerCase() === normalizedEmail || u.username.toLowerCase() === String(username).toLowerCase()
    );
    if (existingUser) {
      return res.status(409).json({ error: 'Użytkownik z tym adresem email lub nazwą użytkownika już istnieje' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: nextUserId++,
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName
    };

    mockUsers.push(newUser);
    const { password: _password, ...safeUser } = newUser;
    res.json({
      token: signToken(newUser),
      message: '✅ Użytkownik zarejestrowany',
      user: safeUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = mockUsers.find(u => u.email.toLowerCase() === String(email).toLowerCase());
    const passwordMatches = user ? await bcrypt.compare(password, user.password) : false;

    if (!user || !passwordMatches) {
      return res.status(400).json({ error: 'Email lub hasło nieprawidłowe' });
    }

    res.json({
      token: signToken(user),
      user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// SYMPTOMS ROUTES
// ============================================
app.post('/api/symptoms', authenticate, (req, res) => {
  try {
    const { symptom, severity, date } = req.body;
    const newSymptom = {
      id: mockSymptoms.length + 1,
      userId: req.userId,
      symptom,
      severity: parseInt(severity),
      date: new Date(date)
    };
    mockSymptoms.push(newSymptom);
    res.json(newSymptom);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/symptoms/:userId', authenticate, requireSelf('userId'), (req, res) => {
  try {
    const symptoms = mockSymptoms.filter(s => s.userId === parseInt(req.params.userId));
    res.json(symptoms.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// CHARTS ROUTES
// ============================================
app.get('/api/charts/:userId', authenticate, requireSelf('userId'), (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const userSymptoms = mockSymptoms.filter(s => s.userId === userId);
    
    // Grupuj po dacie i symptomie
    const chartData = userSymptoms.map(s => ({
      date: s.date.toISOString().split('T')[0],
      symptom: s.symptom,
      avg_severity: s.severity
    }));
    
    res.json(chartData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// ARTICLES ROUTES
// ============================================
app.get('/api/articles', (req, res) => {
  try {
    res.json(mockArticles);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/articles/:id', (req, res) => {
  try {
    const article = mockArticles.find(a => a.id === parseInt(req.params.id));
    if (!article) {
      return res.status(404).json({ error: 'Artykuł nie znaleziony' });
    }
    res.json(article);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// FORUM ROUTES
// ============================================
app.post('/api/forum', authenticate, (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = {
      id: mockForumPosts.length + 1,
      userId: req.userId,
      title,
      content,
      views: 0,
      createdAt: new Date()
    };
    mockForumPosts.push(newPost);
    res.json(newPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/forum', (req, res) => {
  try {
    res.json(mockForumPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// MESSAGES ROUTES
// ============================================
app.post('/api/messages', authenticate, (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const newMessage = {
      id: messageId++,
      senderId: req.userId,
      receiverId,
      message,
      isRead: false,
      createdAt: new Date()
    };
    mockMessages.push(newMessage);
    res.json(newMessage);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/messages/:userId/:otherUserId', authenticate, requireSelf('userId'), (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const messages = mockMessages.filter(m => 
      (m.senderId === parseInt(userId) && m.receiverId === parseInt(otherUserId)) ||
      (m.senderId === parseInt(otherUserId) && m.receiverId === parseInt(userId))
    );
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================
app.get('/api/notifications/:userId', authenticate, requireSelf('userId'), (req, res) => {
  try {
    res.json([
      { id: 1, userId: req.params.userId, message: '⏰ Czas dodać dzisiejszy wpis objawów', isRead: false },
      { id: 2, userId: req.params.userId, message: '📊 Sprawdź swoje wykresy', isRead: false }
    ]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/:notificationId/read', authenticate, (req, res) => {
  try {
    res.json({ id: req.params.notificationId, isRead: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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
// WEBSOCKET - Real-time Chat
// ============================================
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('send-message', (data) => {
    console.log('Message:', data);
    io.emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Only start listening when run directly (e.g. `node server.js`), so this
// module can be `require`d by tests without binding a real port.
if (require.main === module) {
  startServer();
}

function startServer() {
  server.listen(PORT, HOST, () => {
    const displayHost = HOST === '0.0.0.0' ? 'localhost' : HOST;
    console.log(`
  ╔════════════════════════════════════════╗
  ║  🌸 MENOPAUZA APP - BACKEND           ║
  ║  🚀 Server running on port ${PORT}      ║
  ║  📍 http://${displayHost}:${PORT}              ║
  ║  ✅ Mock Database (No PostgreSQL)      ║
  ║  💬 WebSocket ready                    ║
  ╚════════════════════════════════════════╝
  `);
  });
}

module.exports = { io, app };
