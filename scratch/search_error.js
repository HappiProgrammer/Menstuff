const fs = require('fs');
const path = require('path');

function search(dir, str) {
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
      const full = path.join(dir, f.name);
      if (f.isDirectory()) {
        search(full, str);
      } else if (f.isFile() && (f.name.endsWith('.js') || f.name.endsWith('.json'))) {
        try {
          const content = fs.readFileSync(full, 'utf8');
          const idx = content.indexOf(str);
          if (idx !== -1) {
            console.log('FOUND IN:', full);
            console.log(content.slice(Math.max(0, idx - 150), idx + 250));
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

console.log('Searching Antigravity IDE out...');
search('C:\\Users\\GeniuneHappi\\AppData\\Local\\Programs\\Antigravity IDE\\resources\\app\\out', 'Chrome installation not detected');

console.log('Searching Antigravity app.asar.unpacked...');
search('C:\\Users\\GeniuneHappi\\AppData\\Local\\Programs\\Antigravity\\resources', 'Chrome installation not detected');
