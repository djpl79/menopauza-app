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
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

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

// ============================================
// AUTH ROUTES
// ============================================
app.post('/api/auth/register', (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
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
      user: newUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return res.status(400).json({ error: 'Email lub hasło nieprawidłowe' });
    }
    
    res.json({ 
      token: 'mock_token_' + user.id,
      user: { id: user.id, username: user.username, email: user.email, firstName: user.firstName }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// SYMPTOMS ROUTES
// ============================================
app.post('/api/symptoms', (req, res) => {
  try {
    const { userId, symptom, severity, date } = req.body;
    const newSymptom = {
      id: mockSymptoms.length + 1,
      userId,
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

app.get('/api/symptoms/:userId', (req, res) => {
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
app.get('/api/charts/:userId', (req, res) => {
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
app.post('/api/forum', (req, res) => {
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
app.post('/api/messages', (req, res) => {
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
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/messages/:userId/:otherUserId', (req, res) => {
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
app.get('/api/notifications/:userId', (req, res) => {
  try {
    res.json([
      { id: 1, userId: req.params.userId, message: '⏰ Czas dodać dzisiejszy wpis objawów', isRead: false },
      { id: 2, userId: req.params.userId, message: '📊 Sprawdź swoje wykresy', isRead: false }
    ]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/notifications/:notificationId/read', (req, res) => {
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

module.exports = { io };
