const fs = require('fs');
const path = require('path');

const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

function checkFeature(name, snippets) {
  console.log(`\n--- Checking Feature: ${name} ---`);
  snippets.forEach(snip => {
    const found = js.includes(snip);
    console.log(`  [${found ? '✔' : '❌'}] Contains "${snip.substring(0, 60)}"`);
  });
}

// 1. Story Viewer interactions
checkFeature('Story Viewer Reply & Reactions', [
  'sv-reply',
  'sv-react',
  'story-viewer'
]);

// 2. Post Modal Actions
checkFeature('Post Modal Comments & Reactions', [
  'pm-comment-submit',
  'pm-reactions-bar',
  'pm-export-card-btn'
]);

// 3. Contact Form Submission
checkFeature('Contact Form', [
  'contact-form',
  'contact-name',
  'contact-thankyou'
]);

// 4. DM Actions & Voice & Emoji
checkFeature('DM Voice & Attachments & Calls', [
  'dm-voice-trigger-btn',
  'dm-image-upload',
  'dm-emoji-toggle-btn',
  'dm-th-friend-toggle'
]);

// 5. Sound Sanctuary Web Audio
checkFeature('Web Audio Sound Sanctuary', [
  'AudioContext',
  'slider-rain',
  'slider-ocean',
  'slider-fire',
  'slider-binaural'
]);

// 6. Reels Feed & Comments
checkFeature('Reels Video Feed & Actions', [
  'reels-cards-stream',
  'reels-global-mute-btn',
  'reels-comments-modal',
  'rcm-comment-submit'
]);

// 7. Card Exporter Canvas
checkFeature('Social Card Canvas Exporter', [
  'export-quote-canvas',
  'export-download-btn',
  'emc-ratio-btn',
  'emc-theme-chip'
]);

// 8. Box Breathing SOS Cooldown
checkFeature('SOS Box Breathing', [
  'breath-circle',
  'breath-phase-label',
  'sos-modal',
  'sos-journal-btn'
]);
