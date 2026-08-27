const http = require('http');
const assert = require('assert');
const app = require('../server');

function request(port, pathStr, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: pathStr,
      method: method,
      headers: {
        ...(data ? { 'Content-Type': 'application/json' } : {})
      }
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
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function testStoryCreationE2E() {
  console.log('====================================================');
  console.log('🧪 TESTING FEATURE #1: STORY CREATION & FEED E2E');
  console.log('====================================================\n');

  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. Initial stories fetch
    console.log('[1/5] Fetching initial feed stories from GET /api/stories...');
    const initialRes = await request(port, '/api/stories', 'GET');
    assert.strictEqual(initialRes.status, 200);
    assert(initialRes.data.success, 'Expected success');
    assert(Array.isArray(initialRes.data.stories) && initialRes.data.stories.length >= 6, 'Expected initial seed stories');
    console.log(`✔ Found ${initialRes.data.stories.length} existing community stories.`);

    // 2. Publish new story
    console.log('\n[2/5] Creating a new story via POST /api/stories...');
    const uniqueTitle = `Testing Heartbreak Story ${Date.now()}`;
    const newStoryPayload = {
      title: uniqueTitle,
      body: 'This is an end-to-end verification of story creation and persistence.',
      emotion: 'heartbreak',
      isAnon: true,
      userId: 'SilentStar#9921',
      avatar: '<svg></svg>'
    };

    const createRes = await request(port, '/api/stories', 'POST', newStoryPayload);
    assert.strictEqual(createRes.status, 201);
    assert(createRes.data.success, 'Expected success');
    assert.strictEqual(createRes.data.story.title, uniqueTitle);
    assert.strictEqual(createRes.data.story.emotion, 'heartbreak');
    const createdId = createRes.data.story.id;
    console.log(`✔ Story published successfully with ID: ${createdId}`);

    // 3. Verify persistence on reload (re-fetching /api/stories)
    console.log('\n[3/5] Verifying persistence across reload (GET /api/stories)...');
    const reloadedRes = await request(port, '/api/stories', 'GET');
    assert.strictEqual(reloadedRes.status, 200);
    const foundStory = reloadedRes.data.stories.find(s => s.id === createdId);
    assert(foundStory, 'Published story must exist in database on subsequent fetch/reload');
    assert.strictEqual(foundStory.title, uniqueTitle);
    console.log(`✔ Story persisted across reloads: "${foundStory.title}" found at position ${reloadedRes.data.stories.indexOf(foundStory)}`);

    // 4. Test emotion filtering
    console.log('\n[4/5] Testing emotion filter GET /api/stories?emotion=heartbreak...');
    const filterRes = await request(port, '/api/stories?emotion=heartbreak', 'GET');
    assert.strictEqual(filterRes.status, 200);
    assert(filterRes.data.stories.every(s => s.emotion === 'heartbreak'), 'All returned stories must match heartbreak');
    assert(filterRes.data.stories.some(s => s.id === createdId), 'New heartbreak story must appear in filtered list');
    console.log(`✔ Filter returned ${filterRes.data.stories.length} heartbreak stories.`);

    // 5. Test reaction & comment persistence
    console.log('\n[5/5] Testing reactions and comments on the published story...');
    const reactRes = await request(port, `/api/stories/${createdId}/react`, 'POST', { reaction: 'love' });
    assert.strictEqual(reactRes.status, 200);
    assert.strictEqual(reactRes.data.story.reacts.love, 1);
    console.log('✔ Reaction recorded: love count is 1.');

    const commentRes = await request(port, `/api/stories/${createdId}/comment`, 'POST', {
      user: 'VelvetEcho#4092',
      text: 'Beautiful and resilient reflection.'
    });
    assert.strictEqual(commentRes.status, 201);
    assert.strictEqual(commentRes.data.comment.text, 'Beautiful and resilient reflection.');
    console.log('✔ Comment recorded successfully.');

    console.log('\n====================================================');
    console.log('🎉 FEATURE #1: STORY CREATION & FEED 100% VERIFIED! 🎉');
    console.log('====================================================\n');

  } finally {
    server.close();
  }
}

testStoryCreationE2E().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
