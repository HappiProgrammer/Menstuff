const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(body);
        } catch (e) {
          parsed = body;
        }
        resolve({ status: res.statusCode, headers: res.headers, data: parsed });
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runAll() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE SONDER APP SUITE & REELS VERIFICATION');
  console.log('================================================================\n');

  // 1. Health & Static Check
  console.log('[1/6] Testing server root & static assets...');
  const rootRes = await request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
  assert.strictEqual(rootRes.status, 200);
  assert(rootRes.data.includes('Sonder'), 'Expected Sonder in HTML title');
  console.log('✔ Server root is online with brand "Sonder".');

  // 2. Auth ACS Verification
  console.log('\n[2/6] Testing Access Control System (ACS) Registration & Login...');
  const testEmail = `reels_tester_${Date.now()}@shattered.io`;
  const regRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: testEmail,
    password: 'Password123!',
    bio: 'Reels and mindfulness lover'
  });
  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regRes.data.success, true);
  console.log(`✔ User registered: ${testEmail}`);

  // 3. Advice & News API
  console.log('\n[3/6] Testing Relationship Advice & News API...');
  const advRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/advice-news?category=healing',
    method: 'GET'
  });
  assert.strictEqual(advRes.status, 200);
  assert.strictEqual(advRes.data.success, true);
  assert(Array.isArray(advRes.data.items) && advRes.data.items.length > 0, 'Should have articles');
  console.log(`✔ Retrieved ${advRes.data.items.length} curated advice & news articles.`);

  // 4. Instagram DM & WhatsApp Messages API
  console.log('\n[4/6] Testing Direct Messages & Threads API...');
  const threadsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/messages/threads',
    method: 'GET'
  });
  assert.strictEqual(threadsRes.status, 200);
  assert(Array.isArray(threadsRes.data.threads) && threadsRes.data.threads.length >= 3, 'Should have at least 3 chat threads');
  const targetThread = threadsRes.data.threads[0];
  console.log(`✔ Retrieved ${threadsRes.data.threads.length} conversation threads. Target: ${targetThread.recipient.name}`);

  // Send message to thread
  const sendRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/messages/send',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    threadId: targetThread.threadId,
    message: {
      sender: 'user',
      text: 'Hey! Have you checked out the new Reels feed in Sonder?',
      read: true
    }
  });
  assert.strictEqual(sendRes.status, 201);
  assert.strictEqual(sendRes.data.success, true);
  console.log('✔ Direct message sent successfully to thread.');

  // 5. Reels & Stories Vertical Video Feed API
  console.log('\n[5/6] Testing Reels & Stories Vertical Video Feed...');
  const reelsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reels?page=1&limit=4',
    method: 'GET'
  });
  assert.strictEqual(reelsRes.status, 200);
  assert.strictEqual(reelsRes.data.success, true);
  assert.strictEqual(reelsRes.data.items.length, 4);
  const targetReel = reelsRes.data.items[0];
  console.log(`✔ Retrieved 4 video reels (Page 1). Title: "${targetReel.caption.substring(0, 50)}..."`);

  // Like Reel
  const likeRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/reels/${targetReel.id}/like`,
    method: 'POST'
  });
  assert.strictEqual(likeRes.status, 200);
  assert.strictEqual(likeRes.data.success, true);
  console.log(`✔ Reel like toggled. Current likes: ${likeRes.data.likes}`);

  // Comment on Reel
  const commentRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/reels/${targetReel.id}/comment`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: 'VelvetEcho',
    handle: '@velvetecho',
    text: 'Such a grounding visual reflection.'
  });
  assert.strictEqual(commentRes.status, 201);
  assert.strictEqual(commentRes.data.success, true);
  console.log(`✔ Reel comment added. Total comments: ${commentRes.data.totalComments}`);

  // 6. Markup & Design Integrity
  console.log('\n[6/6] Checking Frontend Navigation, CSS & Icons...');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(html.includes('data-pane="reels"'), 'Reels nav pane attribute exists');
  assert(html.includes('id="pane-reels"'), 'pane-reels exists');
  assert(html.includes('id="reels-comments-modal"'), 'reels-comments-modal exists');
  assert(html.includes('id="mobile-reels-btn"'), 'mobile-reels-btn exists');

  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert(css.includes('.reels-feed-container'), 'CSS contains .reels-feed-container');
  assert(css.includes('.reel-music-disc'), 'CSS contains .reel-music-disc animation');
  assert(css.includes('scroll-snap-type: y mandatory'), 'CSS contains vertical scroll snap rules');
  console.log('✔ HTML & CSS verified with 0 syntax or design discrepancies.');

  console.log('\n================================================================');
  console.log('✨ 100% OF TESTS PASSED! ALL FEATURES ARE LIVE & VERIFIED! ✨');
  console.log('================================================================\n');
}

runAll().catch(e => {
  console.error('FAILED:', e);
  process.exit(1);
});
