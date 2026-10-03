// These tests need NO database: they cover behaviour that happens before any DB call.
// (Database-backed flows are covered by the manual checklist in the README.)
import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123';
const { createApp } = await import('../src/app.js');
const app = createApp();
const H = { 'X-Requested-With': 'fitbuddy' };

test('health endpoint responds', async () => {
  const r = await request(app).get('/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.body.data.status, 'ok');
});

for (const path of ['/api/goals', '/api/activities', '/api/progress/summary', '/api/auth/me', '/api/users/me/plan']) {
  test(`unauthenticated GET ${path} is rejected`, async () => {
    const r = await request(app).get(path);
    assert.equal(r.status, 401);
  });
}

test('state-changing request without CSRF header is rejected', async () => {
  const r = await request(app).post('/api/auth/login').send({ email: 'a@b.co', password: 'x' });
  assert.equal(r.status, 403);
});

test('register validates input', async () => {
  const r = await request(app).post('/api/auth/register').set(H).send({ name: 'A', email: 'nope', password: 'short' });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.name && r.body.errors.email && r.body.errors.password);
});

test('register rejects mismatched confirmation', async () => {
  const r = await request(app).post('/api/auth/register').set(H).send({ name: 'Asha', email: 'asha@example.com', password: 'longenough1', confirmPassword: 'different1' });
  assert.equal(r.status, 400);
  assert.ok(r.body.errors.confirmPassword);
});

test('contact validates input', async () => {
  const r = await request(app).post('/api/contact').set(H).send({ name: 'A', email: 'bad', message: 'hi' });
  assert.equal(r.status, 400);
});

test('malformed JSON gives a 400, not a stack trace', async () => {
  const r = await request(app).post('/api/auth/login').set(H).set('Content-Type', 'application/json').send('{bad');
  assert.equal(r.status, 400);
  assert.ok(!JSON.stringify(r.body).includes('at '));
});

test('unknown route gives 404', async () => {
  const r = await request(app).get('/api/nothing');
  assert.equal(r.status, 404);
});
