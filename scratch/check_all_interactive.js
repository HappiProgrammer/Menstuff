const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

// Find all buttons, links with href="#" or role="button", inputs, and selects in index.html
const btnRegex = /<(button|a|input|select)\b([^>]*)>/gi;
const elements = [];
let match;
while ((match = btnRegex.exec(html)) !== null) {
  const tag = match[1];
  const attrs = match[2];
  const idMatch = attrs.match(/id=["']([^"']+)["']/);
  const classMatch = attrs.match(/class=["']([^"']+)["']/);
  const paneMatch = attrs.match(/data-pane=["']([^"']+)["']/);
  const typeMatch = attrs.match(/type=["']([^"']+)["']/);
  
  elements.push({
    tag,
    id: idMatch ? idMatch[1] : null,
    className: classMatch ? classMatch[1] : '',
    dataPane: paneMatch ? paneMatch[1] : null,
    type: typeMatch ? typeMatch[1] : null,
    raw: match[0]
  });
}

console.log(`Total interactive tags in HTML: ${elements.length}`);

// Categorize them
const unhandled = [];
elements.forEach(el => {
  if (el.dataPane) return; // handled by global data-pane delegator
  if (el.id && js.includes(el.id)) return; // explicitly handled by ID in JS
  
  // check if any of its classes are handled in JS
  const classes = el.className.split(/\s+/).filter(Boolean);
  const classHandled = classes.some(c => js.includes(`.${c}`) || js.includes(`'${c}'`) || js.includes(`"${c}"`));
  if (classHandled) return;

  unhandled.push(el);
});

console.log(`\nPotential unhandled interactive elements (${unhandled.length}):`);
unhandled.forEach(u => {
  console.log(`- <${u.tag} id="${u.id}" class="${u.className}">`);
});
