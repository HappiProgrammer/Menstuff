const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REELS_FILE = path.join(DATA_DIR, 'reels.json');

// High performance, mobile-optimized H.264 MP4 videos curated for emotional healing, relationship clarity, peace, and mindfulness
const SEED_REELS = [
  {
    id: "reel_1",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80",
    author: {
      id: "u_solitude_echo",
      name: "VelvetEcho",
      handle: "@velvetecho",
      avatar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
      isVerified: true,
      isFollowing: false
    },
    caption: "The moment you realize that their silence was never about you lacking value, but about them lacking capacity. Take a deep breath. You are free now 🌿🕊️ #healing #nocontact #selflove #peace",
    tags: ["#healing", "#nocontact", "#selflove", "#peace"],
    audioTrack: {
      title: "Weightless Horizon (Piano Reflection)",
      artist: "Sonder Soundscape",
      albumArt: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=100&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 1420,
      comments: 89,
      shares: 312,
      saves: 540
    },
    userLiked: false,
    userSaved: false,
    commentsList: [
      {
        id: "c_1_1",
        username: "QuietRain",
        handle: "@quietrain",
        avatar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3.5c2-1 5.5-.8 7 1 1 1.2 1.5 2.8 1.5 4.5v1c-.5.5-1.5.5-2 0V9a3.5 3.5 0 0 0-7 0v2a4 4 0 0 1-1.5-2.2C7 6.5 7.5 4.5 9 3.5z"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        text: "Needed this reminder today. Day 14 of no-contact and the fog is finally lifting.",
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
        likes: 24
      },
      {
        id: "c_1_2",
        username: "Luna_Glow",
        handle: "@lunaglow",
        avatar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        text: "Capacity over closure. Once you understand this, you never look back 🤍",
        timestamp: Date.now() - 1000 * 60 * 120,
        likes: 17
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString()
  },
  {
    id: "reel_2",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
    author: {
      id: "u_solitary_wanderer",
      name: "SolitaryWanderer",
      handle: "@solitarywanderer",
      avatar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 7.5a5 5 0 0 1 10 0v1H7V7.5z"/><circle cx="12" cy="10" r="3"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
      isVerified: true,
      isFollowing: true
    },
    caption: "3 months ago I thought the loneliness would swallow me whole. Today I climbed to this summit and realized: the peace of being on your own is ten times better than the anxiety of being with the wrong person. 🏔️✨ #freedom #growth #mountains",
    tags: ["#freedom", "#growth", "#mountains", "#healing"],
    audioTrack: {
      title: "Summit Breath • Acoustic Serenade",
      artist: "Echoes of Solitude",
      albumArt: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=100&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 2890,
      comments: 142,
      shares: 615,
      saves: 1120
    },
    userLiked: true,
    userSaved: true,
    commentsList: [
      {
        id: "c_2_1",
        username: "MidnightThinker",
        handle: "@midnightthinker",
        avatar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        text: "The solitude after chaos feels like heaven once you get used to it.",
        timestamp: Date.now() - 1000 * 60 * 60 * 5,
        likes: 38
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
  },
  {
    id: "reel_3",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    author: {
      id: "u_mindful_path",
      name: "MindfulHeart",
      handle: "@mindfulheart",
      avatar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
      isVerified: true,
      isFollowing: false
    },
    caption: "Quick 60-second nervous system reset. When the memory hits you like a wave, un-clench your jaw, drop your shoulders away from your ears, and exhale for 6 counts. You are safe in this body. 🌊🧘‍♀️ #breathwork #nervoussystem #calm",
    tags: ["#breathwork", "#nervoussystem", "#calm", "#grounding"],
    audioTrack: {
      title: "432Hz Calm Waves & Theta Glow",
      artist: "Sonder Breath Lab",
      albumArt: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=100&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 3640,
      comments: 215,
      shares: 980,
      saves: 1840
    },
    userLiked: false,
    userSaved: false,
    commentsList: [
      {
        id: "c_3_1",
        username: "VelvetEcho",
        handle: "@velvetecho",
        avatar: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        text: "I literally didn't realize how tightly I was clenching my jaw until this video popped up. Thank you.",
        timestamp: Date.now() - 1000 * 60 * 90,
        likes: 56
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "reel_4",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=800&auto=format&fit=crop&q=80",
    author: {
      id: "u_forest_remedy",
      name: "QuietRain",
      handle: "@quietrain",
      avatar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 3.5c2-1 5.5-.8 7 1 1 1.2 1.5 2.8 1.5 4.5v1c-.5.5-1.5.5-2 0V9a3.5 3.5 0 0 0-7 0v2a4 4 0 0 1-1.5-2.2C7 6.5 7.5 4.5 9 3.5z"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
      isVerified: false,
      isFollowing: true
    },
    caption: "Stop asking why they did what they did. Start asking why you stayed as long as you did. Healing is shifting the focus from dissecting their character to rebuilding your self-trust. 🌧️🕯️ #boundaries #selftrust #lettinggo",
    tags: ["#boundaries", "#selftrust", "#lettinggo", "#growth"],
    audioTrack: {
      title: "Midnight Rain & Soft Lo-Fi Keys",
      artist: "Quiet Nights Collective",
      albumArt: "https://images.unsplash.com/photo-1511497584788-87676104235f?w=100&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 5120,
      comments: 340,
      shares: 1420,
      saves: 2790
    },
    userLiked: false,
    userSaved: false,
    commentsList: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "reel_5",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80",
    author: {
      id: "u_solitude_warrior",
      name: "WildHeart",
      handle: "@wildheart",
      avatar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
      isVerified: true,
      isFollowing: false
    },
    caption: "You are not 'starting over from scratch'. You are starting over with experience, with stronger boundaries, and with a deeper understanding of what love really looks like. 🌲☀️ #resilience #newbeginnings",
    tags: ["#resilience", "#newbeginnings", "#hope"],
    audioTrack: {
      title: "Sunrise in the Pines (Ambient Strings)",
      artist: "Wilderness Audio",
      albumArt: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=100&auto=format&fit=crop&q=80"
    },
    stats: {
      likes: 4180,
      comments: 198,
      shares: 880,
      saves: 1640
    },
    userLiked: false,
    userSaved: false,
    commentsList: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  }
];

function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(REELS_FILE)) {
    fs.writeFileSync(REELS_FILE, JSON.stringify(SEED_REELS, null, 2), 'utf8');
  }
}

function readReels() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(REELS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    writeReels(SEED_REELS);
    return SEED_REELS;
  } catch (err) {
    console.error('Error reading reels store:', err.message);
    return SEED_REELS;
  }
}

function writeReels(reels) {
  ensureDataStore();
  const tempFile = REELS_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(reels, null, 2), 'utf8');
  fs.renameSync(tempFile, REELS_FILE);
}

function getPaginatedReels(page = 1, limit = 4) {
  const reels = readReels();
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 4, 1), 10);
  const total = reels.length;
  const totalPages = Math.ceil(total / limitNum);

  // If page exceeds total, cycle back around with fresh simulated IDs so feed can infinitely scroll smoothly!
  const startIndex = ((pageNum - 1) * limitNum) % total;
  let items = [];

  for (let i = 0; i < limitNum; i++) {
    const baseIndex = (startIndex + i) % total;
    const baseReel = reels[baseIndex];
    if (baseReel) {
      // If cycling, create a unique instance id
      const instanceId = pageNum > 1 ? `${baseReel.id}_p${pageNum}_${i}` : baseReel.id;
      items.push({
        ...baseReel,
        id: instanceId,
        baseId: baseReel.id
      });
    }
  }

  return {
    items,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    hasMore: true // Support continuous infinite loop scroll
  };
}

function toggleLike(reelId) {
  const reels = readReels();
  // Find matching reel (or base reel)
  const reel = reels.find(r => r.id === reelId || (reelId && reelId.startsWith(r.id)));
  if (reel) {
    reel.userLiked = !reel.userLiked;
    reel.stats.likes += reel.userLiked ? 1 : -1;
    writeReels(reels);
    return { success: true, userLiked: reel.userLiked, likes: reel.stats.likes };
  }
  return { success: false, error: "Reel not found" };
}

function toggleSave(reelId) {
  const reels = readReels();
  const reel = reels.find(r => r.id === reelId || (reelId && reelId.startsWith(r.id)));
  if (reel) {
    reel.userSaved = !reel.userSaved;
    reel.stats.saves += reel.userSaved ? 1 : -1;
    writeReels(reels);
    return { success: true, userSaved: reel.userSaved, saves: reel.stats.saves };
  }
  return { success: false, error: "Reel not found" };
}

function addComment(reelId, { username, handle, avatar, text }) {
  const reels = readReels();
  const reel = reels.find(r => r.id === reelId || (reelId && reelId.startsWith(r.id)));
  if (reel) {
    if (!reel.commentsList) reel.commentsList = [];
    const newComment = {
      id: "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
      username: username || "Anonymous",
      handle: handle || "@anonymous",
      avatar: avatar || null,
      text: text,
      timestamp: Date.now(),
      likes: 0
    };
    reel.commentsList.unshift(newComment);
    reel.stats.comments = reel.commentsList.length;
    writeReels(reels);
    return { success: true, comment: newComment, totalComments: reel.stats.comments };
  }
  return { success: false, error: "Reel not found" };
}

module.exports = {
  readReels,
  getPaginatedReels,
  toggleLike,
  toggleSave,
  addComment
};
