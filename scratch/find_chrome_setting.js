const fs = require('fs');
const path = require('path');

function searchDir(dir, pattern) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') {
          searchDir(fullPath, pattern);
        }
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            console.log('MATCH:', fullPath);
            const idx = content.toLowerCase().indexOf(pattern.toLowerCase());
            console.log(content.slice(Math.max(0, idx - 150), idx + 250));
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

console.log('Searching .gemini ...');
searchDir('C:\\Users\\GeniuneHappi\\.gemini', 'custom Chrome');
searchDir('C:\\Users\\GeniuneHappi\\.gemini', 'Chrome installation');

console.log('Searching AppData/Roaming ...');
searchDir('C:\\Users\\GeniuneHappi\\AppData\\Roaming\\Antigravity', 'custom Chrome');
searchDir('C:\\Users\\GeniuneHappi\\AppData\\Roaming\\Antigravity IDE', 'custom Chrome');
