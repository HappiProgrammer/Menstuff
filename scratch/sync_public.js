const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

['index.html', 'app.js', 'styles.css', 'favicon.svg', 'manifest.json', 'robots.txt', 'sitemap.xml'].forEach(file => {
  const src = path.join(rootDir, file);
  const dst = path.join(publicDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`Synced ${file} -> public/${file}`);
  }
});
