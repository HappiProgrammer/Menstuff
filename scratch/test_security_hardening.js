const http = require('http');
const assert = require('assert');
const app = require('../server');

function makeRequest(port, pathStr, options = {}) {
  return new Promise((resolve, reject) => {
    const { method = 'GET', data = null, headers = {} } = options;
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: pathStr,
      method: method,
      headers: {
        ...(data && typeof data === 'object' && !Buffer.isBuffer(data) ? { 'Content-Type': 'application/json' } : {}),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed, rawBody: body });
      });
    });

    req.on('error', reject);

    if (data) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
    }
    req.end();
  });
}

async function runSecurityAudit() {
  console.log('================================================================');
  console.log('🛡️  RUNNING SONDER SECURITY HARDENING & MIDDLEWARE AUDIT');
  console.log('================================================================\n');

  const server = app.listen(0);
  const port = server.address().port;
  console.log(`📡 In-process security test server running on port ${port}\n`);

  try {
    // 1. Protected Path Guard & Information Disclosure Verification
    console.log('[1/6] Testing Protected Path Guard & Information Disclosure Defenses...');
    
    const protectedPaths = [
      '/data/users.json',
      '/data/messages.json',
      '/db/users.js',
      '/server.js',
      '/package.json',
      '/package-lock.json',
      '/.env.example',
      '/scratch/test_all_features.js',
      '/%2e%2e/server.js',
      '/..%2fserver.js'
    ];

    for (const testPath of protectedPaths) {
      const res = await makeRequest(port, testPath);
      assert.strictEqual(res.status, 403, `Expected 403 Forbidden for protected path "${testPath}", got ${res.status}`);
      assert(res.data && res.data.error, `Expected error response for "${testPath}"`);
      console.log(`  ✔ Blocked ${testPath} -> HTTP 403 Forbidden (${res.data.error})`);
    }

    // 2. OWASP Security Headers
    console.log('\n[2/6] Verifying OWASP Security Headers...');
    const headerRes = await makeRequest(port, '/');
    assert.strictEqual(headerRes.status, 200);

    // Verify presence of critical security headers
    assert.strictEqual(headerRes.headers['x-content-type-options'], 'nosniff');
    console.log('  ✔ X-Content-Type-Options: nosniff verified');

    assert.strictEqual(headerRes.headers['x-frame-options'], 'SAMEORIGIN');
    console.log('  ✔ X-Frame-Options: SAMEORIGIN verified');

    assert.strictEqual(headerRes.headers['referrer-policy'], 'strict-origin-when-cross-origin');
    console.log('  ✔ Referrer-Policy: strict-origin-when-cross-origin verified');

    assert(headerRes.headers['content-security-policy'], 'Content-Security-Policy header expected');
    assert(headerRes.headers['content-security-policy'].includes("default-src 'self'"));
    console.log('  ✔ Content-Security-Policy verified');

    // Verify framework fingerprinting is removed
    assert.strictEqual(headerRes.headers['x-powered-by'], undefined);
    console.log('  ✔ X-Powered-By is disabled (framework fingerprinting prevented)');

    // 3. CORS Policy & Origin Validation
    console.log('\n[3/6] Verifying CORS Policy & Origin Validation...');
    
    // Test A: Trusted origin (localhost)
    const trustedCorsRes = await makeRequest(port, '/api/stories', {
      headers: { 'Origin': 'http://localhost:3000' }
    });
    assert.strictEqual(trustedCorsRes.headers['access-control-allow-origin'], 'http://localhost:3000');
    assert.strictEqual(trustedCorsRes.headers['access-control-allow-credentials'], 'true');
    console.log('  ✔ Trusted origin (localhost) allowed with credentials');

    // Test B: Untrusted origin (attacker site)
    const untrustedCorsRes = await makeRequest(port, '/api/stories', {
      headers: { 'Origin': 'https://malicious-attacker.com' }
    });
    assert.strictEqual(untrustedCorsRes.headers['access-control-allow-origin'], 'null');
    assert.strictEqual(untrustedCorsRes.headers['access-control-allow-credentials'], undefined);
    console.log('  ✔ Untrusted origin rejected with origin: null and credentials omitted');

    // Test C: Preflight OPTIONS
    const preflightRes = await makeRequest(port, '/api/messages/send', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://127.0.0.1:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    assert.strictEqual(preflightRes.status, 204);
    assert(preflightRes.headers['access-control-allow-methods'].includes('POST'));
    console.log('  ✔ CORS Preflight OPTIONS returned 204 No Content with allowed methods');

    // 4. Malformed JSON & Error Handling Middleware
    console.log('\n[4/6] Verifying Payload Protection & Error Handling Middleware...');
    const malformedJsonRes = await makeRequest(port, '/api/contact', {
      method: 'POST',
      data: '{ "name": "Tester", "broken_json": ',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(malformedJsonRes.status, 400);
    assert.strictEqual(malformedJsonRes.data.error, 'Malformed JSON payload in request body.');
    console.log('  ✔ Malformed JSON handled gracefully with HTTP 400 Bad Request');

    // 5. Rate Limiting Headers
    console.log('\n[5/6] Verifying In-Memory Rate Limiting Headers...');
    const rateRes = await makeRequest(port, '/api/advice-news');
    assert.strictEqual(rateRes.status, 200);
    assert(rateRes.headers['ratelimit-limit'] !== undefined, 'RateLimit-Limit expected');
    assert(rateRes.headers['ratelimit-remaining'] !== undefined, 'RateLimit-Remaining expected');
    assert(rateRes.headers['ratelimit-reset'] !== undefined, 'RateLimit-Reset expected');
    console.log(`  ✔ Rate limiting headers confirmed: Limit=${rateRes.headers['ratelimit-limit']}, Remaining=${rateRes.headers['ratelimit-remaining']}, Reset=${rateRes.headers['ratelimit-reset']}s`);

    // 6. Robust Authentication Token Middleware
    console.log('\n[6/6] Verifying Robust JWT Authentication Token Middleware...');
    
    // Unauthenticated
    const unauthRes = await makeRequest(port, '/api/auth/me');
    assert.strictEqual(unauthRes.status, 401);
    assert(unauthRes.data.error.includes('Authentication required'));
    console.log('  ✔ Unauthenticated request properly rejected with 401');

    // Corrupted / tampered token
    const badTokenRes = await makeRequest(port, '/api/auth/me', {
      headers: { 'Authorization': 'Bearer invalid.tampered.token_payload' }
    });
    assert.strictEqual(badTokenRes.status, 401);
    assert(badTokenRes.data.error.includes('Invalid authentication token'));
    console.log('  ✔ Invalid token rejected with 401');

    // Valid registration & authenticated /api/auth/me
    const regEmail = `sec_tester_${Date.now()}@shattered.io`;
    const regRes = await makeRequest(port, '/api/auth/register', {
      method: 'POST',
      data: {
        email: regEmail,
        password: 'Password123!',
        username: 'SecurityTester'
      }
    });
    assert.strictEqual(regRes.status, 201);
    const validToken = regRes.data.token;
    assert(validToken, 'Valid JWT expected');

    const authMeRes = await makeRequest(port, '/api/auth/me', {
      headers: { 'Authorization': `Bearer ${validToken}` }
    });
    assert.strictEqual(authMeRes.status, 200);
    assert.strictEqual(authMeRes.data.user.email, regEmail);
    assert.strictEqual(authMeRes.data.user.passwordHash, undefined, 'passwordHash must never be exposed');
    console.log(`  ✔ Authenticated session verified for ${regEmail}, passwordHash safely stripped`);

    console.log('\n================================================================');
    console.log('🛡️  100% OF SECURITY AUDIT CHECKS PASSED SUCCESSFULLY! 🛡️');
    console.log('================================================================\n');
  } finally {
    server.close();
  }
}

runSecurityAudit().catch(err => {
  console.error('\n❌ SECURITY TEST SUITE FAILED:', err);
  process.exit(1);
});
