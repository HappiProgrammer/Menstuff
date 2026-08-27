const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function showFunction(fnName) {
  console.log(`\n=================== ${fnName} ===================`);
  const regex = new RegExp(`const ${fnName}\\s*=\\s*[^;]*?\\n\\s*\\};`, 's');
  const match = js.match(regex);
  if (match) {
    console.log(match[0].substring(0, 1500));
  } else {
    // try finding by line
    const idx = js.indexOf(`const ${fnName}`);
    if (idx !== -1) {
      console.log(js.substring(idx, idx + 1200));
    } else {
      console.log('Not found');
    }
  }
}

showFunction('setupStoriesBar');
showFunction('setupContact');
showFunction('setupProfile');
