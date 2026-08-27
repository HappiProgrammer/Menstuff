const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION;
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'sonder_data') : path.join(__dirname, '..', 'data');
const STORIES_FILE = path.join(DATA_DIR, 'stories.json');

let memoryStories = null;

const POST_GRADIENTS = [
  ['#1a0a12','#3d1626'], ['#0d1a2b','#1a3a5c'], ['#0f1a0d','#1e3a1a'],
  ['#1a1209','#3d2a0a'], ['#180f1a','#3a1a3d'], ['#0a1a1a','#0f3d3a'],
  ['#1a0f0f','#3d1a1a'], ['#0d0d1a','#1a1a3d']
];

const AVATARS = [
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 21v-1.8a6.5 6.5 0 0 1 13 0v1.8"/><path d="M6 10a6 6 0 0 1 12 0v2a2 2 0 0 1-2 2h-1v-4h3"/><path d="M6 12H5a2 2 0 0 1-2-2v-1a6 6 0 0 1 3-4.5"/></svg>',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/><circle cx="9.5" cy="7" r="1.3"/><circle cx="14.5" cy="7" r="1.3"/><line x1="10.8" y1="7" x2="13.2" y2="7"/></svg>',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7.5a5 5 0 0 1 10 0v1H7V7.5z"/><circle cx="12" cy="10" r="3"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/><path d="M4 21v-2a7 7 0 0 1 14 0v2"/></svg>'
];

function getInitialSeedStories() {
  const now = Date.now();
  const seedData = [
    {
      id: 'p_seed_1',
      userId: 'VelvetEcho#4092',
      avatar: AVATARS[0],
      title: 'The last message I never sent',
      body: 'I typed it out a hundred times. I deleted every single draft. Maybe that was the right choice — silence sometimes holds more dignity than begging to be understood.',
      emotion: 'heartbreak',
      date: new Date(now - 1000 * 60 * 60 * 3).toISOString(),
      reacts: { love: 38, cry: 14, angry: 2, healing: 9, peace: 7 },
      comments: [
        { user: 'SolitaryWanderer#8812', text: 'You saved your own peace by not sending it. Proud of you.' },
        { user: 'QuietRain#1943', text: 'Closure is something you give yourself. Sending love.' }
      ],
      gradient: POST_GRADIENTS[0]
    },
    {
      id: 'p_seed_2',
      userId: 'SolitaryWanderer#8812',
      avatar: AVATARS[3],
      title: 'Seeing you with her in the coffee shop',
      body: 'My chest tightened for five seconds. But then I looked at my own hands, drank my coffee, and realized that my world didn\'t end. Growth is quiet.',
      emotion: 'acceptance',
      date: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
      reacts: { love: 52, cry: 4, angry: 1, healing: 28, peace: 19 },
      comments: [
        { user: 'Luna_Glow#7710', text: 'This gives me so much hope for my own journey.' }
      ],
      gradient: POST_GRADIENTS[5]
    },
    {
      id: 'p_seed_3',
      userId: 'QuietRain#1943',
      avatar: AVATARS[2],
      title: 'Betrayal from the one who promised safety',
      body: 'The hardest part isn\'t that the relationship ended. It\'s grieving the version of them they convinced you they were. Rebuilding trust in my own intuition now.',
      emotion: 'betrayal',
      date: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      reacts: { love: 44, cry: 21, angry: 18, healing: 12, peace: 5 },
      comments: [
        { user: 'MidnightThinker#3301', text: 'Your intuition was never broken, they were just skilled at distortion.' }
      ],
      gradient: POST_GRADIENTS[1]
    },
    {
      id: 'p_seed_4',
      userId: 'Luna_Glow#7710',
      avatar: AVATARS[4],
      title: 'Day 45 of No-Contact: I woke up smiling',
      body: 'For the first month, waking up felt like remembering a car crash. Today, the morning air just felt clean and full of possibility. To anyone struggling in week 1: hold on.',
      emotion: 'healing',
      date: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
      reacts: { love: 67, cry: 2, angry: 0, healing: 45, peace: 31 },
      comments: [
        { user: 'VelvetEcho#4092', text: 'Day 12 here, reading this just made my whole week lighter.' }
      ],
      gradient: POST_GRADIENTS[2]
    },
    {
      id: 'p_seed_5',
      userId: 'MidnightThinker#3301',
      avatar: AVATARS[1],
      title: 'Why anger was the turning point in my healing',
      body: 'I spent months feeling sad and accommodating. Once I let myself feel healthy anger, I remembered what I deserved. Anger was the guardian of my self-respect.',
      emotion: 'anger',
      date: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      reacts: { love: 31, cry: 3, angry: 25, healing: 19, peace: 8 },
      comments: [],
      gradient: POST_GRADIENTS[6]
    },
    {
      id: 'p_seed_6',
      userId: 'FadingStar#1299',
      avatar: AVATARS[0],
      title: 'The playlist I finally unstarred',
      body: 'We made it on a road trip two summers ago. Tonight I deleted the download. A small click, but a massive exhale.',
      emotion: 'longing',
      date: new Date(now - 1000 * 60 * 60 * 60).toISOString(),
      reacts: { love: 29, cry: 11, angry: 1, healing: 14, peace: 12 },
      comments: [],
      gradient: POST_GRADIENTS[4]
    }
  ];
  return seedData;
}

function ensureDataStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORIES_FILE)) {
      const bundledPath = path.join(__dirname, '..', 'data', 'stories.json');
      let initial = JSON.stringify(getInitialSeedStories(), null, 2);
      if (fs.existsSync(bundledPath)) {
        try { initial = fs.readFileSync(bundledPath, 'utf8'); } catch (e) {}
      }
      fs.writeFileSync(STORIES_FILE, initial, 'utf8');
    }
  } catch (err) {
    if (memoryStories === null) memoryStories = getInitialSeedStories();
  }
}

function readStories() {
  ensureDataStore();
  try {
    if (fs.existsSync(STORIES_FILE)) {
      const raw = fs.readFileSync(STORIES_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    // fallback to memory
  }
  if (!memoryStories) memoryStories = getInitialSeedStories();
  return memoryStories;
}

function writeStories(stories) {
  memoryStories = stories;
  try {
    ensureDataStore();
    fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf8');
    return true;
  } catch (err) {
    return false;
  }
}

function createStory(data) {
  const stories = readStories();
  const gradIdx = Math.floor(Math.random() * POST_GRADIENTS.length);

  const newStory = {
    id: 'p_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    userId: data.userId || 'Anonymous',
    avatar: data.avatar || AVATARS[0],
    title: data.title || 'Untitled Reflection',
    body: data.body || '',
    emotion: data.emotion || 'heartbreak',
    date: new Date().toISOString(),
    reacts: { love: 0, cry: 0, angry: 0, healing: 0, peace: 0 },
    comments: [],
    imageUrl: data.imageUrl || null,
    gradient: data.imageUrl ? null : (data.gradient || POST_GRADIENTS[gradIdx]),
    isMine: true
  };

  stories.unshift(newStory);
  writeStories(stories);
  return newStory;
}

function reactToStory(storyId, reactionType) {
  const stories = readStories();
  const story = stories.find(s => s.id === storyId);
  if (!story) return null;

  if (!story.reacts) story.reacts = { love: 0, cry: 0, angry: 0, healing: 0, peace: 0 };
  const validReactions = ['love', 'cry', 'angry', 'healing', 'peace'];
  const rType = validReactions.includes(reactionType) ? reactionType : 'love';
  story.reacts[rType] = (story.reacts[rType] || 0) + 1;

  writeStories(stories);
  return story;
}

function addCommentToStory(storyId, commentData) {
  const stories = readStories();
  const story = stories.find(s => s.id === storyId);
  if (!story) return null;

  if (!story.comments) story.comments = [];
  const newComment = {
    id: 'c_' + Date.now(),
    user: commentData.user || 'Anonymous Member',
    text: commentData.text || '',
    date: new Date().toISOString()
  };
  story.comments.push(newComment);

  writeStories(stories);
  return { story, comment: newComment };
}

module.exports = {
  readStories,
  writeStories,
  createStory,
  reactToStory,
  addCommentToStory
};
