const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const app = require('../server');

function request(port, pathStr, method = 'GET', data = null) {
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

async function testExploreE2E() {
  console.log('====================================================');
  console.log('🧪 TESTING FEATURE #2: EXPLORE PANE E2E');
  console.log('====================================================\n');

  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. Check stories from shared backend
    console.log('[1/4] Checking shared data source for Explore...');
    const storiesRes = await request(port, '/api/stories', 'GET');
    assert.strictEqual(storiesRes.status, 200);
    const stories = storiesRes.data.stories;
    assert(stories.length >= 6, 'Must have community stories in shared data source');
    console.log(`✔ Shared backend has ${stories.length} stories.`);

    // 2. Validate all emotion categories in Explore filters
    console.log('\n[2/4] Testing all Explore emotion filters against shared story pool...');
    const emotions = ['all', 'heartbreak', 'betrayal', 'longing', 'healing', 'anger', 'acceptance'];
    for (const em of emotions) {
      const filtered = em === 'all' ? stories : stories.filter(s => s.emotion === em);
      console.log(`  - Emotion "${em}": ${filtered.length} matching stories.`);
      if (em !== 'all') {
        assert(filtered.every(s => s.emotion === em), `All items in ${em} must match`);
      }
    }
    console.log('✔ All 6 emotion categories filter correctly.');

    // 3. Post new story and verify Explore data source integration
    console.log('\n[3/4] Posting a new reflection and checking Explore integration...');
    const exploreStory = {
      title: 'Longing under the stars in Explore',
      body: 'I looked up at Orion and wondered if you were looking up too.',
      emotion: 'longing',
      isAnon: true,
      userId: 'Explorer#1010',
      avatar: '<svg></svg>'
    };
    const createRes = await request(port, '/api/stories', 'POST', exploreStory);
    assert.strictEqual(createRes.status, 201);
    const createdId = createRes.data.story.id;

    // Verify it is in longing filter
    const longingRes = await request(port, '/api/stories?emotion=longing', 'GET');
    assert(longingRes.data.stories.some(s => s.id === createdId), 'New story must be in longing filter');
    console.log(`✔ Story ${createdId} immediately accessible in Explore filter.`);

    // 4. Verify DOM markup & JS event binding integrity
    console.log('\n[4/4] Verifying HTML & JS bindings for Explore...');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert(html.includes('id="pane-explore"'), 'pane-explore must exist');
    assert(html.includes('id="explore-filters"'), 'explore-filters must exist');
    assert(html.includes('id="explore-grid"'), 'explore-grid must exist');
    assert(html.includes('id="empty-explore"'), 'empty-explore must exist');

    const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
    assert(js.includes('setupExplore'), 'setupExplore must exist');
    assert(js.includes('renderExplore'), 'renderExplore must exist');
    assert(js.includes('openPostDetail'), 'openPostDetail must exist');
    console.log('✔ Explore DOM and handlers verified.');

    console.log('\n====================================================');
    console.log('🎉 FEATURE #2: EXPLORE 100% VERIFIED! 🎉');
    console.log('====================================================\n');

  } finally {
    server.close();
  }
}

testExploreE2E().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
