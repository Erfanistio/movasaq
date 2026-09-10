import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';

let server, base, cookie, password;
beforeEach(async () => {
  password = randomBytes(24).toString('hex');
  cookie = '';
  server = spawn(process.execPath, ['server/index.js'], {
    env: { ...process.env, PORT: '0', DB_PATH: ':memory:', NODE_ENV: 'test', ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: password },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error('Server startup timed out: ' + output)), 15000);
    server.once('error', error => { clearTimeout(timer); reject(error); });
    server.once('exit', code => { clearTimeout(timer); reject(new Error('Server exited: ' + code + '\n' + output)); });
    server.stderr.on('data', chunk => { output += chunk; });
    server.stdout.on('data', chunk => {
      output += chunk;
      const match = output.match(/running on port (\d+)/);
      if (match) { base = 'http://127.0.0.1:' + match[1]; clearTimeout(timer); resolve(); }
    });
  });
});
afterEach(async () => {
  if (server && server.exitCode === null) { const exited = once(server, 'exit'); server.kill(); await exited; }
});
async function request(path, method = 'GET', body, headers = {}) {
  const response = await fetch(base + '/api' + path, {
    method, headers: { 'Content-Type': 'application/json', Cookie: cookie, ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: response.status, body: await response.json().catch(() => null), headers: response.headers };
}
async function login() {
  const result = await request('/login', 'POST', { username: 'admin', password });
  assert.equal(result.status, 200);
  cookie = result.headers.get('set-cookie').split(';')[0];
  return result;
}
const applicant = { name: 'کاربر آزمایشی', phone: '09123456789', consent: true };
const product = { title: 'محصول آزمایشی', price: 1200, stock: 4, published: true };

test('administrator sessions protect edits and are revoked by logout', async () => {
  assert.equal((await request('/admin')).status, 401);
  assert.equal((await request('/admin/content/products/test', 'PUT', product)).status, 401);
  assert.equal((await request('/login', 'POST', { username: 'admin', password: 'incorrect' })).status, 401);
  const result = await login();
  assert.match(result.headers.get('set-cookie'), /HttpOnly/);
  assert.match(result.headers.get('set-cookie'), /SameSite=Strict/);
  assert.equal((await request('/admin')).status, 200);
  await request('/logout', 'POST', {});
  assert.equal((await request('/admin')).status, 401);
});

test('CMS drafts stay private, publishing updates content, and deletion removes it', async () => {
  await login();
  const path = '/admin/content/products/test';
  assert.equal((await request(path, 'PUT', { ...product, published: false })).status, 200);
  assert.ok(!(await request('/content')).body.products.some(p => p.id === 'test'));
  assert.ok((await request('/admin')).body.products.some(p => p.id === 'test'));
  assert.equal((await request(path, 'PUT', product)).status, 200);
  assert.equal((await request('/content')).body.products.find(p => p.id === 'test').price, 1200);
  assert.equal((await request(path, 'DELETE')).status, 200);
  assert.ok(!(await request('/content')).body.products.some(p => p.id === 'test'));
});

test('contact, service, career and enrollment requests can be tracked only with the matching phone', async () => {
  for (const kind of ['contact', 'service', 'career', 'enrollment']) {
    const result = await request('/requests', 'POST', { ...applicant, kind, course: 'police-assistant' });
    assert.equal(result.status, 201);
    assert.match(result.body.id, /^MV-[A-F0-9]{12}$/);
    const tracked = await request('/track', 'POST', { id: result.body.id.toLowerCase(), phone: applicant.phone });
    assert.equal(tracked.body.kind, kind);
    assert.equal(tracked.body.status, 'جدید');
    assert.equal(tracked.body.phone, undefined);
  }
  assert.equal((await request('/track', 'POST', { id: 'MV-UNKNOWN', phone: applicant.phone })).status, 404);
  assert.equal((await request('/requests', 'POST', { ...applicant, kind: 'enrollment', course: 'missing' })).status, 400);
  assert.equal((await request('/requests', 'POST', { ...applicant, kind: 'contact', consent: false })).status, 400);
});

test('orders use server prices and stock changes once per approval or cancellation', async () => {
  await login();
  await request('/admin/content/products/test', 'PUT', product);
  const order = await request('/requests', 'POST', { ...applicant, kind: 'order', address: 'نشانی آزمایشی برای تحویل', items: [{ id: 'test', quantity: 3, price: 1 }], total: 1 });
  assert.equal(order.status, 201);
  const stored = (await request('/admin')).body.requests.find(r => r.id === order.body.id);
  assert.equal(stored.total, 3600);
  const stock = async () => (await request('/content')).body.products.find(p => p.id === 'test').stock;
  const update = status => request('/admin/requests/' + order.body.id, 'PATCH', { status });
  assert.equal(await stock(), 4);
  assert.equal((await update('تأیید شده')).status, 200);
  assert.equal(await stock(), 1);
  await update('تأیید شده');
  await update('تکمیل شده');
  assert.equal(await stock(), 1);
  await update('لغو شده');
  assert.equal(await stock(), 4);
  const wrongPhone = await request('/track', 'POST', { id: order.body.id, phone: '09999999999' });
  assert.equal(wrongPhone.status, 404);
});

test('approval rolls back every stock change when another order consumes inventory', async () => {
  await login();
  await request('/admin/content/products/test', 'PUT', product);
  await request('/admin/content/products/other', 'PUT', { ...product, stock: 1 });
  const order = items => request('/requests', 'POST', { ...applicant, kind: 'order', address: 'نشانی آزمایشی برای تحویل', items });
  const first = await order([{ id: 'other', quantity: 1 }]);
  const second = await order([{ id: 'test', quantity: 2 }, { id: 'other', quantity: 1 }]);
  await request('/admin/requests/' + first.body.id, 'PATCH', { status: 'تأیید شده' });
  assert.equal((await request('/admin/requests/' + second.body.id, 'PATCH', { status: 'تأیید شده' })).status, 400);
  const data = (await request('/admin')).body;
  assert.equal(data.products.find(p => p.id === 'test').stock, 4);
  assert.equal(data.products.find(p => p.id === 'other').stock, 0);
  assert.equal(data.requests.find(r => r.id === second.body.id).status, 'جدید');
});

test('certificates require confirmation, verify trimmed names, and can be revoked', async () => {
  await login();
  const certificate = { name: '  کاربر آزمایشی  ', course: 'دوره آزمایشی', date: '2026-09-11', confirmed: true };
  assert.equal((await request('/admin/certificates', 'POST', { ...certificate, confirmed: false })).status, 400);
  const issued = await request('/admin/certificates', 'POST', certificate);
  assert.equal(issued.status, 200);
  const body = { id: issued.body.id.toLowerCase(), name: certificate.name.trim() };
  assert.equal((await request('/verify', 'POST', body)).status, 200);
  assert.equal((await request('/verify', 'POST', { ...body, name: 'نام دیگر' })).status, 404);
  assert.equal((await request('/admin/certificates/' + issued.body.id, 'DELETE', {})).status, 200);
  assert.equal((await request('/verify', 'POST', body)).status, 404);
});

test('malformed inputs return client errors without damaging saved content', async () => {
  await login();
  for (const body of [null, [], 1]) assert.equal((await request('/requests', 'POST', body)).status, 400);
  for (const changes of [{ title: 42 }, { body: {} }, { published: 'yes' }, { price: -1 }]) {
    assert.equal((await request('/admin/content/products/test', 'PUT', { ...product, ...changes })).status, 400);
  }
  assert.equal((await request('/admin/content/settings/other', 'PUT', { name: 'test' })).status, 400);
  assert.equal((await request('/requests', 'POST', { ...applicant, kind: 'order', address: 'نشانی آزمایشی برای تحویل', items: [null] })).status, 400);
  assert.equal((await request('/admin/certificates', 'POST', { name: 42, course: 'test', date: '2026-02-30', confirmed: true })).status, 400);
  assert.equal((await request('/admin/certificates', 'POST', { name: 'Test User', course: 'test', date: '2026-02-30', confirmed: true })).status, 400);
  assert.equal((await request('/login', 'POST', {}, { Origin: 'invalid-origin' })).status, 403);
  const malformed = await fetch(base + '/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  assert.equal((await request('/content')).status, 200);
});
