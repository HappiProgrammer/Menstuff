const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

// 1. Extract all IDs from HTML
const idRegex = /id=["']([^"']+)["']/g;
const htmlIds = new Set();
let match;
while ((match = idRegex.exec(html)) !== null) {
  htmlIds.add(match[1]);
}

// 2. Extract all $(...) or getElementById(...) from JS
const jsIdRegex = /(?:\$|getElementById)\(["']([^"']+)["']\)/g;
const jsQueriedIds = new Set();
while ((match = jsIdRegex.exec(js)) !== null) {
  jsQueriedIds.add(match[1]);
}

console.log('=== ID AUDIT RESULTS ===');
console.log('Total HTML IDs:', htmlIds.size);
console.log('Total JS queried IDs:', jsQueriedIds.size);

const missingInHtml = [];
jsQueriedIds.forEach(id => {
  if (!htmlIds.has(id)) {
    missingInHtml.push(id);
  }
});
console.log('\n❌ JS IDs queried but MISSING in HTML (' + missingInHtml.length + '):');
console.log(missingInHtml);

// 3. Check interactive elements in HTML
const interactiveRegex = /<(button|input|select|textarea|form)\b[^>]*id=["']([^"']+)["'][^>]*>/gi;
const htmlInteractiveIds = [];
while ((match = interactiveRegex.exec(html)) !== null) {
  htmlInteractiveIds.push({ tag: match[1], id: match[2] });
}

console.log('\n=== INTERACTIVE ELEMENTS AUDIT ===');
console.log('Total interactive elements with IDs:', htmlInteractiveIds.length);
const unhandledInteractive = [];
htmlInteractiveIds.forEach(item => {
  if (!js.includes(item.id)) {
    unhandledInteractive.push(item);
  }
});
console.log('Interactive elements in HTML with NO mention in app.js (' + unhandledInteractive.length + '):');
console.log(unhandledInteractive);

// 4. Check data-pane links and buttons
const dataPaneRegex = /data-pane=["']([^"']+)["']/g;
const dataPanes = new Set();
while ((match = dataPaneRegex.exec(html)) !== null) {
  dataPanes.add(match[1]);
}
console.log('\n=== PANES IN HTML ===');
console.log(Array.from(dataPanes));

// Check if each pane has corresponding #pane-<name> element in HTML
const missingPaneDivs = [];
dataPanes.forEach(pane => {
  if (!html.includes(`id="pane-${pane}"`)) {
    missingPaneDivs.push(pane);
  }
});
console.log('Panes without #pane-<name> div in HTML:', missingPaneDivs);
