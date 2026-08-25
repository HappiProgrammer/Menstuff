const http = require('http');

const payload = JSON.stringify({
  email: 'tester@gmail.com',
  password: 'Password123!'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
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
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
    if (res.statusCode === 200) {
      console.log('SUCCESS: Logged in with tester@gmail.com!');
    } else {
      console.error('FAILED to log in with tester@gmail.com');
    }
  });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(payload);
req.end();
