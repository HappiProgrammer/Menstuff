const fs = require('fs');
const path = require('path');

const code = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const lines = code.split('\n');

const declRegex = /^\s*(?:const|let|var|function)\s+([a-zA-Z0-9_$]+)/;
const declared = new Map();

lines.forEach((line, idx) => {
  const m = line.match(declRegex);
  if (m) {
    const name = m[1];
    if (!declared.has(name)) {
      declared.set(name, []);
    }
    declared.get(name).push(idx + 1);
  }
});

console.log('=== DUPLICATE DECLARATIONS IN APP.JS ===');
let dupCount = 0;
for (const [name, lineNums] of declared.entries()) {
  if (lineNums.length > 1) {
    dupCount++;
    console.log(`- '${name}' declared ${lineNums.length} times on lines: ${lineNums.join(', ')}`);
  }
}
if (dupCount === 0) console.log('No duplicate declarations found.');
