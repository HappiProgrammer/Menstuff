const https = require('https');

const payload = JSON.stringify({
  email: 'tester@gmail.com',
  password: 'Password123!'
});

const req = https.request({
  hostname: 'menstuff-eight.vercel.app',
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log('LIVE VERCEL HTTP STATUS:', res.statusCode);
    console.log('LIVE VERCEL HEADERS:', res.headers);
    console.log('LIVE VERCEL BODY:', body);
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(payload);
req.end();
