const fs = require('fs');
const path = require('path');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

const lines = js.split('\n');
lines.forEach((l, i) => {
  if (l.includes('notif-list') || l.includes('renderNotif') || l.includes('addNotif')) {
    console.log((i+1) + ': ' + l);
  }
});
