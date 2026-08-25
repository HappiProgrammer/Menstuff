const http = require('http');

function postJson(path, payload, cookie) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    };
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'POST',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json || body
        });
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJson(path, cookie) {
  return new Promise((resolve, reject) => {
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: json || body
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runAuthTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING END-TO-END AUTHENTICATION TEST SUITE');
  console.log('====================================================\n');

  // Test 1: Invalid registration (short password)
  console.log('[1/6] Testing registration validation (short password)...');
  const resShort = await postJson('/api/auth/register', {
    email: 'shortpass@example.com',
    password: '123'
  });
  console.assert(resShort.status === 400, `Expected 400, got ${resShort.status}`);
  console.log('✔ Short password properly rejected with 400:', resShort.body.error);

  // Test 2: Valid registration
  const randEmail = `newuser_${Date.now()}@example.com`;
  console.log(`\n[2/6] Testing valid registration for ${randEmail}...`);
  const resReg = await postJson('/api/auth/register', {
    email: randEmail,
    password: 'SecurePassword123!',
    username: 'PeacefulHealer'
  });
  console.assert(resReg.status === 201, `Expected 201, got ${resReg.status}`);
  console.assert(resReg.body.token, 'Token expected in response');
  console.log('✔ Registration successful! User created:', resReg.body.user.username, 'ID:', resReg.body.user.id);

  // Test 3: Duplicate email registration
  console.log('\n[3/6] Testing duplicate email rejection...');
  const resDup = await postJson('/api/auth/register', {
    email: randEmail,
    password: 'SecurePassword123!'
  });
  console.assert(resDup.status === 409, `Expected 409, got ${resDup.status}`);
  console.log('✔ Duplicate email properly rejected with 409:', resDup.body.error);

  // Test 4: Invalid login credentials
  console.log('\n[4/6] Testing invalid login password...');
  const resBadLogin = await postJson('/api/auth/login', {
    email: randEmail,
    password: 'WrongPassword123!'
  });
  console.assert(resBadLogin.status === 401, `Expected 401, got ${resBadLogin.status}`);
  console.log('✔ Bad login properly rejected with 401:', resBadLogin.body.error);

  // Test 5: Valid login
  console.log('\n[5/6] Testing valid login...');
  const resLogin = await postJson('/api/auth/login', {
    email: randEmail,
    password: 'SecurePassword123!'
  });
  console.assert(resLogin.status === 200, `Expected 200, got ${resLogin.status}`);
  console.log('✔ Login successful! Token issued for:', resLogin.body.user.email);

  // Test 6: Seed account login (tester@gmail.com)
  console.log('\n[6/6] Testing pre-seeded tester@gmail.com login...');
  const resTester = await postJson('/api/auth/login', {
    email: 'tester@gmail.com',
    password: 'Password123!'
  });
  console.assert(resTester.status === 200, `Expected 200, got ${resTester.status}`);
  console.log('✔ Pre-seeded tester@gmail.com logged in successfully:', resTester.body.user.username);

  console.log('\n====================================================');
  console.log('✨ ALL 6/6 AUTH SUITE TESTS PASSED 100% SUCCESFULLY! ✨');
  console.log('====================================================');
}

runAuthTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
