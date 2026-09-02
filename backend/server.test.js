const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.JWT_SECRET = 'test-secret';
const { app } = require('./server');

test('GET /api/health returns OK status', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
});

test('POST /api/auth/login succeeds with the seeded test account', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@menopauza.pl', password: 'test123' });

  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.email, 'test@menopauza.pl');
});

test('POST /api/auth/login fails with a wrong password', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@menopauza.pl', password: 'wrong-password' });

  assert.equal(res.status, 400);
  assert.ok(res.body.error);
});

test('POST /api/auth/register creates a new user and rejects duplicates', async () => {
  const newUser = {
    username: `newuser_${Date.now()}`,
    email: `newuser_${Date.now()}@menopauza.pl`,
    password: 'supersecret',
    firstName: 'New',
    lastName: 'User'
  };

  const created = await request(app).post('/api/auth/register').send(newUser);
  assert.equal(created.status, 200);
  assert.ok(created.body.token);
  assert.equal(created.body.user.password, undefined, 'password hash must not be returned');

  const duplicate = await request(app).post('/api/auth/register').send(newUser);
  assert.equal(duplicate.status, 409);
});

test('protected routes reject requests without a token', async () => {
  const res = await request(app).get('/api/symptoms/1');
  assert.equal(res.status, 401);
});

test('protected routes reject a token for a different user', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@menopauza.pl', password: 'test123' });
  const token = login.body.token;

  const res = await request(app)
    .get('/api/symptoms/999')
    .set('Authorization', 'Bearer ' + token);
  assert.equal(res.status, 403);
});

test('authenticated user can add and read their own symptoms', async () => {
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@menopauza.pl', password: 'test123' });
  const token = login.body.token;
  const userId = login.body.user.id;

  const create = await request(app)
    .post('/api/symptoms')
    .set('Authorization', 'Bearer ' + token)
    .send({ symptom: 'Test symptom', severity: 5, date: '2026-01-01' });
  assert.equal(create.status, 200);
  assert.equal(create.body.userId, userId);

  const list = await request(app)
    .get(`/api/symptoms/${userId}`)
    .set('Authorization', 'Bearer ' + token);
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.body));
});

test('GET /api/articles is public and does not require a token', async () => {
  const res = await request(app).get('/api/articles');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
});
