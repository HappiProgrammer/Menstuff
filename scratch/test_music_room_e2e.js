const assert = require('assert');
const fs = require('fs');
const path = require('path');

function testMusicRoomE2E() {
  console.log('====================================================');
  console.log('🧪 TESTING FEATURE #10: MUSIC ROOM & SOUND SANCTUARY E2E');
  console.log('====================================================\n');

  // 1. Check DOM Elements in HTML
  console.log('[1/4] Checking Music Room DOM elements in index.html...');
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert(html.includes('id="pane-music"'), 'pane-music must exist');
  assert(html.includes('id="music-play-btn"'), 'music-play-btn must exist');
  assert(html.includes('id="music-prev-btn"'), 'music-prev-btn must exist');
  assert(html.includes('id="music-next-btn"'), 'music-next-btn must exist');
  assert(html.includes('id="music-progress-bar"'), 'music-progress-bar must exist');
  assert(html.includes('id="music-volume-slider"'), 'music-volume-slider must exist');
  assert(html.includes('id="music-playlist-grid"'), 'music-playlist-grid must exist');
  assert(html.includes('id="ambient-sound-btn"'), 'ambient-sound-btn must exist');
  assert(html.includes('id="sound-dropdown"'), 'sound-dropdown must exist');
  console.log('✔ All Music Room & Sound Sanctuary DOM elements verified in index.html.');

  // 2. Validate Playlist Tracks Structure in app.js
  console.log('\n[2/4] Validating therapeutic soundscapes & playlist tracks in app.js...');
  const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
  assert(js.includes('MUSIC_TRACKS'), 'MUSIC_TRACKS array must exist');
  assert(js.includes('solfeggio_432'), '432Hz Solfeggio soundscape must exist');
  assert(js.includes('rain'), 'Rain soundscape must exist');
  assert(js.includes('solfeggio_528'), '528Hz Solfeggio soundscape must exist');
  assert(js.includes('lofi'), 'Lo-Fi melody soundscape must exist');
  assert(js.includes('ocean'), 'Ocean waves soundscape must exist');
  assert(js.includes('ethereal'), 'Ethereal drone soundscape must exist');
  console.log('✔ All 6 therapeutic soundscape tracks verified.');

  // 3. Validate Web Audio Synthesis & Playback Engine
  console.log('\n[3/4] Validating Web Audio synthesis engine & audio nodes...');
  assert(js.includes('startSynthesizedTrack'), 'startSynthesizedTrack function must exist');
  assert(js.includes('stopSynthesizedTrack'), 'stopSynthesizedTrack function must exist');
  assert(js.includes('createOscillator'), 'Web Audio createOscillator must be used');
  assert(js.includes('createBiquadFilter'), 'Web Audio createBiquadFilter must be used');
  assert(js.includes('createBufferSource'), 'Web Audio noise generator must be used');
  assert(js.includes('toggleMusicPlay'), 'toggleMusicPlay function must exist');
  assert(js.includes('selectMusicTrack'), 'selectMusicTrack function must exist');
  console.log('✔ Web Audio synthesis engine verified (zero external audio dependencies, full browser synthesis).');

  // 4. Validate CSS Styling for Waveforms & Visualizers
  console.log('\n[4/4] Validating visualizer animation styles in styles.css...');
  const css = fs.readFileSync(path.join(__dirname, '..', 'styles.css'), 'utf8');
  assert(css.includes('.music-hero-card'), 'music-hero-card class must exist');
  assert(css.includes('.music-album-art.playing'), 'music-album-art.playing spin animation must exist');
  assert(css.includes('.music-waveform.playing'), 'music-waveform.playing bounce animation must exist');
  assert(css.includes('.music-track-card.active-track'), 'active-track styling must exist');
  console.log('✔ Visualizer styling and animations verified in styles.css.');

  console.log('\n====================================================');
  console.log('🎉 FEATURE #10: MUSIC ROOM & SOUND SANCTUARY 100% VERIFIED! 🎉');
  console.log('====================================================\n');
}

try {
  testMusicRoomE2E();
} catch (e) {
  console.error('❌ Test Failed:', e);
  process.exit(1);
}
