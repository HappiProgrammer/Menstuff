const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

console.log('==============================================');
console.log('🔍 RUNNING COMPREHENSIVE SITE & CODE AUDIT');
console.log('==============================================\n');

// 1. Extract all IDs from HTML
const idRegex = /\bid=["']([^"']+)["']/g;
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

console.log('=== 1. ID AUDIT RESULTS ===');
console.log('Total HTML IDs:', htmlIds.size);
console.log('Total JS queried IDs:', jsQueriedIds.size);

const missingInHtml = [];
jsQueriedIds.forEach(id => {
  // Ignore dynamic or template IDs that are created at runtime
  if (!htmlIds.has(id)) {
    missingInHtml.push(id);
  }
});

console.log(`JS IDs queried but not in static HTML: ${missingInHtml.length}`);
if (missingInHtml.length > 0) {
  console.log('Investigating queried IDs not in static index.html:');
  missingInHtml.forEach(id => {
    // Check if created dynamically in app.js
    const isDynamic = js.includes(`id="${id}"`) || js.includes(`id=\'${id}\'`) || js.includes(`id=\`${id}\``);
    console.log(`  - ${id} ${isDynamic ? '(Dynamically created in app.js)' : '(MISSING?)'}`);
  });
}

// 3. Check interactive elements in HTML
const interactiveRegex = /<(button|input|select|textarea|form)\b[^>]*id=["']([^"']+)["'][^>]*>/gi;
const htmlInteractiveIds = [];
while ((match = interactiveRegex.exec(html)) !== null) {
  htmlInteractiveIds.push({ tag: match[1], id: match[2] });
}

console.log('\n=== 2. INTERACTIVE ELEMENTS AUDIT ===');
console.log('Total interactive elements with IDs:', htmlInteractiveIds.length);
const unhandledInteractive = [];
htmlInteractiveIds.forEach(item => {
  if (!js.includes(item.id)) {
    unhandledInteractive.push(item);
  }
});
console.log(`Interactive elements in HTML with NO mention in app.js: ${unhandledInteractive.length}`);
if (unhandledInteractive.length > 0) {
  unhandledInteractive.forEach(item => {
    console.log(`  - <${item.tag} id="${item.id}">`);
  });
}

// 4. Check data-pane links and buttons
console.log('\n=== 3. DATA-PANE NAVIGATION AUDIT ===');
const paneRegex = /data-pane=["']([^"']+)["']/g;
const panesReferenced = new Set();
while ((match = paneRegex.exec(html)) !== null) {
  panesReferenced.add(match[1]);
}

const missingPanes = [];
panesReferenced.forEach(p => {
  const targetId = `pane-${p}`;
  if (!htmlIds.has(targetId) && !htmlIds.has(p)) {
    missingPanes.push(p);
  }
});

console.log('Total referenced data-pane values:', panesReferenced.size);
panesReferenced.forEach(p => {
  const targetId = `pane-${p}`;
  const exists = htmlIds.has(targetId) || htmlIds.has(p);
  console.log(`  - data-pane="${p}" -> #${targetId}: ${exists ? 'EXISTS' : 'MISSING'}`);
});
if (missingPanes.length > 0) {
  console.log('❌ MISSING PANES:', missingPanes);
} else {
  console.log('✔ All data-pane targets exist in HTML.');
}

// 5. Check CSS references
console.log('\n=== 4. CSS & STATIC ASSETS AUDIT ===');
const styles = fs.readFileSync(path.join(__dirname, '../styles.css'), 'utf8');
console.log('styles.css size:', (styles.length / 1024).toFixed(1), 'KB');
console.log('app.js size:', (js.length / 1024).toFixed(1), 'KB');
console.log('index.html size:', (html.length / 1024).toFixed(1), 'KB');

console.log('\nAudit complete.');
