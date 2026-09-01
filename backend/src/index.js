const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// ============================================
// CORS - allow ALL origins (needed for Replit)
// ============================================
app.use(cors({ origin: '*' }));
app.use(express.json());

// Log every incoming request, on every endpoint
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// MOCK DATABASE - Zamiast PostgreSQL
// ============================================
const mockUsers = [
  { id: 1, username: 'test', email: 'test@menopauza.pl', password: 'test123', firstName: 'Test', lastName: 'User' }
];

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
let nextUserId = mockUsers.length + 1;

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
  console.log('✅ /api/health called');
  res.json({ status: 'OK', message: '🌸 Menopauza API is running (Mock Mode)', timestamp: new Date() });
});

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', (req, res) => {
  console.log('📝 /api/auth/register body:', req.body);
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const newUser = {
      id: nextUserId++,
      username,
      email,
      password,
      firstName,
      lastName
    };

    mockUsers.push(newUser);
    console.log('✅ Registered new user:', newUser.email);
    res.json({
      token: 'mock_token_' + newUser.id,
      message: '✅ Użytkownik zarejestrowany',
      user: newUser
    });
  } catch (error) {
    console.error('❌ /api/auth/register error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  console.log('🔐 /api/auth/login body:', req.body);
  try {
    const { email, password } = req.body;
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      console.log('❌ Login failed for email:', email);
      return res.status(400).json({ error: 'Email lub hasło nieprawidłowe' });
    }

    console.log('✅ Login success for:', user.email);
    res.json({
      token: 'mock_token_' + user.id,
      user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName }
    });
  } catch (error) {
    console.error('❌ /api/auth/login error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// SYMPTOMS ROUTES
// ============================================
app.post('/api/symptoms', (req, res) => {
  console.log('🩺 POST /api/symptoms body:', req.body);
  try {
    const { userId, symptom, severity, date } = req.body;
    const newSymptom = {
      id: mockSymptoms.length + 1,
      userId,
      symptom,
      severity: parseInt(severity, 10),
      date: new Date(date)
    };
    mockSymptoms.push(newSymptom);
    console.log('✅ Added symptom:', newSymptom);
    res.json(newSymptom);
  } catch (error) {
    console.error('❌ /api/symptoms error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/symptoms/:userId', (req, res) => {
  console.log('🩺 GET /api/symptoms for userId:', req.params.userId);
  try {
    const symptoms = mockSymptoms.filter(s => s.userId === parseInt(req.params.userId, 10));
    res.json(symptoms.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) {
    console.error('❌ /api/symptoms/:userId error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// CHARTS ROUTES
// ============================================
app.get('/api/charts/:userId', (req, res) => {
  console.log('📊 GET /api/charts for userId:', req.params.userId);
  try {
    const userId = parseInt(req.params.userId, 10);
    const userSymptoms = mockSymptoms.filter(s => s.userId === userId);

    const chartData = userSymptoms.map(s => ({
      date: s.date.toISOString().split('T')[0],
      symptom: s.symptom,
      avg_severity: s.severity
    }));

    res.json(chartData);
  } catch (error) {
    console.error('❌ /api/charts/:userId error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// ARTICLES ROUTES
// ============================================
app.get('/api/articles', (req, res) => {
  console.log('📰 GET /api/articles');
  try {
    res.json(mockArticles);
  } catch (error) {
    console.error('❌ /api/articles error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/articles/:id', (req, res) => {
  console.log('📰 GET /api/articles/:id ->', req.params.id);
  try {
    const article = mockArticles.find(a => a.id === parseInt(req.params.id, 10));
    if (!article) {
      console.log('❌ Article not found:', req.params.id);
      return res.status(404).json({ error: 'Artykuł nie znaleziony' });
    }
    res.json(article);
  } catch (error) {
    console.error('❌ /api/articles/:id error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// FORUM ROUTES
// ============================================
app.post('/api/forum', (req, res) => {
  console.log('💬 POST /api/forum body:', req.body);
  try {
    const { userId, title, content } = req.body;
    const newPost = {
      id: mockForumPosts.length + 1,
      userId,
      title,
      content,
      views: 0,
      createdAt: new Date()
    };
    mockForumPosts.push(newPost);
    res.json(newPost);
  } catch (error) {
    console.error('❌ /api/forum POST error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/forum', (req, res) => {
  console.log('💬 GET /api/forum');
  try {
    res.json(mockForumPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  } catch (error) {
    console.error('❌ /api/forum GET error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// MESSAGES ROUTES
// ============================================
app.post('/api/messages', (req, res) => {
  console.log('✉️  POST /api/messages body:', req.body);
  try {
    const { senderId, receiverId, message } = req.body;
    const newMessage = {
      id: messageId++,
      senderId,
      receiverId,
      message,
      isRead: false,
      createdAt: new Date()
    };
    mockMessages.push(newMessage);
    res.json(newMessage);
  } catch (error) {
    console.error('❌ /api/messages POST error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/messages/:userId/:otherUserId', (req, res) => {
  console.log('✉️  GET /api/messages', req.params.userId, req.params.otherUserId);
  try {
    const { userId, otherUserId } = req.params;
    const messages = mockMessages.filter(m =>
      (m.senderId === parseInt(userId, 10) && m.receiverId === parseInt(otherUserId, 10)) ||
      (m.senderId === parseInt(otherUserId, 10) && m.receiverId === parseInt(userId, 10))
    );
    res.json(messages);
  } catch (error) {
    console.error('❌ /api/messages GET error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// NOTIFICATIONS ROUTES
// ============================================
app.get('/api/notifications/:userId', (req, res) => {
  console.log('🔔 GET /api/notifications for userId:', req.params.userId);
  try {
    res.json([
      { id: 1, userId: req.params.userId, message: '⏰ Czas dodać dzisiejszy wpis objawów', isRead: false },
      { id: 2, userId: req.params.userId, message: '📊 Sprawdź swoje wykresy', isRead: false }
    ]);
  } catch (error) {
    console.error('❌ /api/notifications GET error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/:notificationId/read', (req, res) => {
  console.log('🔔 PUT /api/notifications/:id/read ->', req.params.notificationId);
  try {
    res.json({ id: req.params.notificationId, isRead: true });
  } catch (error) {
    console.error('❌ /api/notifications PUT error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
  console.log('⚠️  404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not Found' });
});

// ============================================
// WEBSOCKET - Real-time Chat
// ============================================
io.on('connection', (socket) => {
  console.log('✅ WebSocket user connected:', socket.id);

  socket.on('send-message', (data) => {
    console.log('💬 WebSocket message received:', data);
    io.emit('receive-message', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ WebSocket user disconnected:', socket.id);
  });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  🌸 MENOPAUZA APP - BACKEND             ║
  ║  🚀 Server running on ${HOST}:${PORT}   ║
  ║  ✅ Mock Database (No PostgreSQL)       ║
  ║  💬 WebSocket ready                     ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
