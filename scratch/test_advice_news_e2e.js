const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const app = require('../server');

function request(port, pathStr, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: port,
      path: pathStr,
      method: method
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
    req.end();
  });
}

async function testAdviceNewsE2E() {
  console.log('====================================================');
  console.log('🧪 TESTING FEATURE #3: ADVICE & NEWS E2E');
  console.log('====================================================\n');

  const server = app.listen(0);
  const port = server.address().port;

  try {
    // 1. Live Daily Advice Slip API
    console.log('[1/4] Testing GET /api/advice-slip/daily...');
    const slipRes = await request(port, '/api/advice-slip/daily', 'GET');
    assert.strictEqual(slipRes.status, 200);
    assert(slipRes.data.advice && slipRes.data.advice.length > 5, 'Must return valid advice quote');
    assert(slipRes.data.source, 'Must have source attribution');
    console.log(`✔ Daily Advice returned: "${slipRes.data.advice}" (${slipRes.data.source})`);

    // 2. Advice Articles & Hub
    console.log('\n[2/4] Testing GET /api/advice-news for all categories...');
    const newsRes = await request(port, '/api/advice-news?category=all', 'GET');
    assert.strictEqual(newsRes.status, 200);
    assert(newsRes.data.success, 'Expected success: true');
    assert(Array.isArray(newsRes.data.items) && newsRes.data.items.length >= 4, 'Must return advice articles');
    console.log(`✔ Found ${newsRes.data.items.length} curated articles and live advice slips.`);

    // 3. Category Filter Validation
    console.log('\n[3/4] Validating all Advice category filters...');
    const categories = ['communication', 'breakup', 'healing', 'psychology'];
    for (const cat of categories) {
      const catRes = await request(port, `/api/advice-news?category=${cat}`, 'GET');
      assert.strictEqual(catRes.status, 200);
      assert(catRes.data.items.every(item => item.category === cat), `All items in ${cat} must match category`);
      console.log(`  - Category "${cat}": ${catRes.data.items.length} articles.`);
    }
    console.log('✔ All category filters return valid, matched content.');

    // 4. HTML & JS Bindings Check
    console.log('\n[4/4] Verifying HTML & JS bindings...');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert(html.includes('id="pane-advice"'), 'pane-advice must exist');
    assert(html.includes('id="live-advice-quote"'), 'live-advice-quote must exist');
    assert(html.includes('id="refresh-advice-btn"'), 'refresh-advice-btn must exist');
    assert(html.includes('id="copy-advice-btn"'), 'copy-advice-btn must exist');
    assert(html.includes('id="advice-chips"'), 'advice-chips must exist');
    assert(html.includes('id="advice-grid"'), 'advice-grid must exist');

    const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
    assert(js.includes('fetchLiveAdviceSlip'), 'fetchLiveAdviceSlip must exist in app.js');
    assert(js.includes('loadAdviceNews'), 'loadAdviceNews must exist in app.js');
    assert(js.includes('ROTATING_ADVICE_FALLBACKS'), 'ROTATING_ADVICE_FALLBACKS must exist in app.js');
    console.log('✔ All DOM elements and JS handlers confirmed.');

    console.log('\n====================================================');
    console.log('🎉 FEATURE #3: ADVICE & NEWS 100% VERIFIED! 🎉');
    console.log('====================================================\n');

  } finally {
    server.close();
  }
}

testAdviceNewsE2E().catch(err => {
  console.error('❌ Test Failed:', err);
  process.exit(1);
});
