const http = require('http');
const assert = require('assert');
const app = require('../server');

// Helper to perform HTTP requests against a given server and port
function request(port, method, path, payload, cookie) {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : null;
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': data ? Buffer.byteLength(data) : 0
    };
    if (cookie) headers['Cookie'] = cookie;
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: path,
      method: method,
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { }
        resolve({ status: res.statusCode, headers: res.headers, body: json || body });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runAuthTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING END-TO-END AUTHENTICATION TEST SUITE');
  console.log('====================================================\n');

  // Start the app on a random free port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 1. Invalid registration (short password)
    console.log('[1/6] Testing registration validation (short password)...');
    const resShort = await request(port, 'POST', '/api/auth/register', { email: 'shortpass@example.com', password: '123' });
    assert.strictEqual(resShort.status, 400, `Expected 400, got ${resShort.status}`);
    console.log('✔ Short password properly rejected with 400:', resShort.body.error);

    // 2. Valid registration
    const randEmail = `newuser_${Date.now()}@example.com`;
    console.log(`\n[2/6] Testing valid registration for ${randEmail}...`);
    const resReg = await request(port, 'POST', '/api/auth/register', { email: randEmail, password: 'SecurePassword123!', username: 'PeacefulHealer' });
    assert.strictEqual(resReg.status, 201, `Expected 201, got ${resReg.status}`);
    assert(resReg.body.token, 'Token expected in response');
    console.log('✔ Registration successful! User created:', resReg.body.user.username, 'ID:', resReg.body.user.id);

    // 3. Duplicate email registration
    console.log('\n[3/6] Testing duplicate email rejection...');
    const resDup = await request(port, 'POST', '/api/auth/register', { email: randEmail, password: 'SecurePassword123!' });
    assert.strictEqual(resDup.status, 409, `Expected 409, got ${resDup.status}`);
    console.log('✔ Duplicate email properly rejected with 409:', resDup.body.error);

    // 4. Invalid login credentials
    console.log('\n[4/6] Testing invalid login password...');
    const resBadLogin = await request(port, 'POST', '/api/auth/login', { email: randEmail, password: 'WrongPassword123!' });
    assert.strictEqual(resBadLogin.status, 401, `Expected 401, got ${resBadLogin.status}`);
    console.log('✔ Bad login properly rejected with 401:', resBadLogin.body.error);

    // 5. Valid login
    console.log('\n[5/6] Testing valid login...');
    const resLogin = await request(port, 'POST', '/api/auth/login', { email: randEmail, password: 'SecurePassword123!' });
    assert.strictEqual(resLogin.status, 200, `Expected 200, got ${resLogin.status}`);
    console.log('✔ Login successful! Token issued for:', resLogin.body.user.email);

    // 6. Seed account login (tester@gmail.com)
    console.log('\n[6/6] Testing pre-seeded tester@gmail.com login...');
    const resTester = await request(port, 'POST', '/api/auth/login', { email: 'tester@gmail.com', password: 'Password123!' });
    assert.strictEqual(resTester.status, 200, `Expected 200, got ${resTester.status}`);
    console.log('✔ Pre-seeded tester@gmail.com logged in successfully:', resTester.body.user.username);

    console.log('\n====================================================');
    console.log('✨ ALL 6/6 AUTH SUITE TESTS PASSED 100% SUCCESSFULLY! ✨');
    console.log('====================================================');
  } finally {
    server.close();
  }
}

runAuthTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
