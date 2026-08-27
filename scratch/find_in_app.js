const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

function find(name, text, fileName) {
  const lines = text.split('\n');
  lines.forEach((l, i) => {
    if (l.toLowerCase().includes(name.toLowerCase())) {
      console.log(`[${fileName}:${i+1}] ${l.trim()}`);
    }
  });
}

console.log('=== SEARCHING REELS PANE ===');
find('reels', indexHtml, 'index.html');

console.log('=== SEARCHING SETUPAPP ===');
find('setupApp', appJs, 'app.js');

console.log('=== SEARCHING INITROUTER ===');
find('initRouter', appJs, 'app.js');

console.log('=== SEARCHING RIGHT SIDEBAR WIDGETS IN APP.JS ===');
find('online-avatars', appJs, 'app.js');
find('live-feed', appJs, 'app.js');
find('trending-list', appJs, 'app.js');
