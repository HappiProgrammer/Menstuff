const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const app = require('../server');

function request(port, pathStr, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: pathStr,
      method: method,
      headers: { ...(data ? { 'Content-Type': 'application/json' } : {}) }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (e) { parsed = body; }
        resolve({ status: res.statusCode, data: parsed });
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function testContactE2E() {
  console.log('====================================================');
  console.log('🧪 TESTING FEATURE #7: CONTACT FORM E2E');
  console.log('====================================================\n');

  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. Check DOM Elements in HTML
    console.log('[1/4] Checking Contact Form DOM elements in index.html...');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert(html.includes('id="pane-contact"'), 'pane-contact must exist');
    assert(html.includes('id="contact-form"'), 'contact-form must exist');
    assert(html.includes('id="contact-name"'), 'contact-name must exist');
    assert(html.includes('id="contact-email"'), 'contact-email must exist');
    assert(html.includes('id="contact-message"'), 'contact-message must exist');
    assert(html.includes('id="contact-thankyou"'), 'contact-thankyou must exist');
    console.log('✔ All Contact Form DOM elements verified in index.html.');

    // 2. Successful Contact Submission
    console.log('\n[2/4] Testing valid submission to POST /api/contact...');
    const validRes = await request(port, '/api/contact', 'POST', {
      name: 'KindHeart',
      email: 'kind.heart@example.com',
      message: 'Thank you for creating Sonder. This sanctuary has given me immense comfort.'
    });
    assert.strictEqual(validRes.status, 201);
    assert.strictEqual(validRes.data.success, true);
    assert(validRes.data.message.includes('Thank you for reaching out'));
    console.log('✔ Valid contact submission successfully processed by server.');

    // 3. Validation: Empty Message
    console.log('\n[3/4] Testing validation error on empty message...');
    const emptyMsgRes = await request(port, '/api/contact', 'POST', {
      name: 'Anon',
      email: 'anon@example.com',
      message: '   '
    });
    assert.strictEqual(emptyMsgRes.status, 400);
    assert(emptyMsgRes.data.error.includes('Message cannot be empty'));
    console.log(`✔ Empty message rejected with 400: "${emptyMsgRes.data.error}"`);

    // 4. Validation: Invalid Email Format
    console.log('\n[4/4] Testing validation error on invalid email...');
    const invalidEmailRes = await request(port, '/api/contact', 'POST', {
      name: 'Anon',
      email: 'not-an-email',
      message: 'Testing email format validation'
    });
    assert.strictEqual(invalidEmailRes.status, 400);
    assert(invalidEmailRes.data.error.includes('valid email address'));
    console.log(`✔ Invalid email rejected with 400: "${invalidEmailRes.data.error}"`);

    console.log('\n====================================================');
    console.log('🎉 FEATURE #7: CONTACT FORM 100% VERIFIED! 🎉');
    console.log('====================================================\n');

  } finally {
    server.close();
  }
}

testContactE2E().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
