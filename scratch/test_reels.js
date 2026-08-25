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

async function runTests() {
  console.log('=== STARTING REELS & SHORT-FORM VIDEO FEED INTEGRATION TESTS ===\n');

  // Test 1: HTML markup checks
  console.log('[1/5] Checking index.html layout & navigation markup...');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(html.includes('id="nav-reels"'), 'Missing #nav-reels in sidebar');
  assert(html.includes('id="mobile-reels-btn"'), 'Missing #mobile-reels-btn in mobile bottom nav');
  assert(html.includes('id="pane-reels"'), 'Missing #pane-reels container');
  assert(html.includes('id="reels-feed-container"'), 'Missing #reels-feed-container');
  assert(html.includes('id="reels-cards-stream"'), 'Missing #reels-cards-stream');
  assert(html.includes('id="reels-comments-modal"'), 'Missing #reels-comments-modal');
  assert(html.includes('id="reels-global-mute-btn"'), 'Missing #reels-global-mute-btn');
  console.log('✔ HTML markup successfully verified.');

  // Test 2: GET /api/reels
  console.log('\n[2/5] Testing GET /api/reels endpoint...');
  const reelsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/reels?page=1&limit=3',
    method: 'GET'
  });
  assert.strictEqual(reelsRes.status, 200, `Expected 200, got ${reelsRes.status}`);
  assert.strictEqual(reelsRes.data.success, true, 'Expected success: true');
  assert.strictEqual(reelsRes.data.items.length, 3, 'Expected 3 reel items');
  const firstReel = reelsRes.data.items[0];
  assert(firstReel.videoUrl && firstReel.videoUrl.startsWith('https://'), 'Reel must have valid HTTPS videoUrl');
  assert(firstReel.author && firstReel.author.name, 'Reel must have author');
  assert(firstReel.stats && typeof firstReel.stats.likes === 'number', 'Reel must have stats.likes');
  console.log(`✔ Retrieved ${reelsRes.data.items.length} reels. First reel: "${firstReel.caption.substring(0, 45)}..." by ${firstReel.author.name}`);

  // Test 3: POST /api/reels/:id/like
  console.log('\n[3/5] Testing POST /api/reels/:id/like...');
  const likeRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/reels/${firstReel.id}/like`,
    method: 'POST'
  });
  assert.strictEqual(likeRes.status, 200, `Expected 200, got ${likeRes.status}`);
  assert.strictEqual(likeRes.data.success, true);
  console.log(`✔ Like toggled! userLiked: ${likeRes.data.userLiked}, total likes: ${likeRes.data.likes}`);

  // Test 4: POST /api/reels/:id/save
  console.log('\n[4/5] Testing POST /api/reels/:id/save...');
  const saveRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/reels/${firstReel.id}/save`,
    method: 'POST'
  });
  assert.strictEqual(saveRes.status, 200, `Expected 200, got ${saveRes.status}`);
  assert.strictEqual(saveRes.data.success, true);
  console.log(`✔ Save toggled! userSaved: ${saveRes.data.userSaved}, total saves: ${saveRes.data.saves}`);

  // Test 5: POST /api/reels/:id/comment
  console.log('\n[5/5] Testing POST /api/reels/:id/comment...');
  const commentRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: `/api/reels/${firstReel.id}/comment`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    username: 'Test Traveler',
    handle: '@testtraveler',
    text: 'This video brought me so much peace today. Thank you Sonder! 🌿'
  });
  assert.strictEqual(commentRes.status, 201, `Expected 201, got ${commentRes.status}`);
  assert.strictEqual(commentRes.data.success, true);
  assert(commentRes.data.comment && commentRes.data.comment.text.includes('peace today'), 'Comment text mismatch');
  console.log(`✔ Comment added! New comment count: ${commentRes.data.totalComments}`);

  console.log('\n======================================================');
  console.log('🎉 ALL 5 REELS VIDEO FEED TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('\n❌ REELS TEST SUITE FAILED:', err);
  process.exit(1);
});
