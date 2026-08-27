const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

const idx = js.indexOf('dm-th-actions');
if (idx !== -1) {
  console.log(js.substring(idx - 100, idx + 1200));
} else {
  const dmIdx = js.indexOf('dm-th-action-btn');
  console.log(dmIdx !== -1 ? js.substring(dmIdx - 100, dmIdx + 1200) : 'dm-th-action-btn not in JS');
}
