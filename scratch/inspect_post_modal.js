const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

const idx = js.indexOf('openPostModal');
if (idx !== -1) {
  console.log(js.substring(idx - 100, idx + 1800));
} else {
  const pmIdx = js.indexOf('post-modal');
  console.log(js.substring(pmIdx - 100, pmIdx + 1800));
}
