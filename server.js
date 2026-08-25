// Backend server for Sonder
// Handles Access Control System (ACS) Authentication, Relationship Advice & News, & YouTube Data API Proxy
const express = require('express');
const https = require('https');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const db = require('./db/users');

const app = express();
const PORT = process.env.PORT || 3000;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || 'sonder_jwt_secret_dev_key_2026_x89f';

// Middleware
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));

// In-memory cache for API quota conservation (1 hour TTL)
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Email validation regex (RFC 5322 standard compliance)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Password strength rule: min 8 chars, at least 1 number or special character
const PASSWORD_RULE_REGEX = /^(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Helper: Extract & verify JWT token from cookie or Authorization header
function authenticateToken(req, res, next) {
  let token = req.cookies?.token;
  
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
    }
    req.userId = decoded.userId;
    next();
  });
}

// ══════════════════════════════════════════════════════════════════════
// ACCESS CONTROL SYSTEM (ACS) AUTHENTICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, avatar } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Password is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (!PASSWORD_RULE_REGEX.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number or special character.' });
    }

    const existingUser = db.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    let cleanUsername = (username && typeof username === 'string') ? username.trim() : '';
    if (cleanUsername) {
      const existingName = db.findUserByUsername(cleanUsername);
      if (existingName) {
        cleanUsername = `${cleanUsername}#${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      cleanUsername = `Anonymous#${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = db.createUser({
      email: cleanEmail,
      username: cleanUsername,
      passwordHash: passwordHash,
      avatar: avatar || null
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: newUser,
      token: token
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    return res.status(500).json({ error: 'An unexpected server error occurred during registration.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = db.readUsers();
    const user = users.find(u => 
      (u.email || '').toLowerCase() === cleanEmail || 
      (u.username || '').toLowerCase() === cleanEmail
    );

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const sanitized = db.sanitizeUser(user);
    const token = jwt.sign(
      { userId: sanitized.id, email: sanitized.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      user: sanitized,
      token: token
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: 'An unexpected server error occurred during login.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }
    return res.json({
      success: true,
      user: db.sanitizeUser(user)
    });
  } catch (err) {
    console.error('Auth/me error:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax'
  });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ══════════════════════════════════════════════════════════════════════
// YOUTUBE DATA API PROXY
// ══════════════════════════════════════════════════════════════════════

app.get('/api/youtube-search', (req, res) => {
  const query = req.query.q || 'heartbreak healing music';
  const maxResults = Math.min(parseInt(req.query.maxResults) || 12, 25);
  const cacheKey = `search_${query.toLowerCase().trim()}_${maxResults}`;

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ items: cached.data, cached: true });
    }
  }

  if (!YOUTUBE_API_KEY) {
    return res.status(200).json({ 
      items: [], 
      needsFallback: true, 
      message: 'Server YOUTUBE_API_KEY not configured. Using client curated cache.' 
    });
  }

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;

  https.get(apiUrl, (apiRes) => {
    let rawData = '';
    apiRes.on('data', chunk => rawData += chunk);
    apiRes.on('end', () => {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.error) {
          return res.status(apiRes.statusCode || 500).json({ error: parsed.error });
        }

        const items = (parsed.items || []).map(item => ({
          id: item.id.videoId,
          title: item.snippet.title,
          channelTitle: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
          publishTime: item.snippet.publishedAt,
          description: item.snippet.description
        }));

        cache.set(cacheKey, { timestamp: Date.now(), data: items });
        res.json({ items, cached: false });
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse YouTube API response' });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});

// ══════════════════════════════════════════════════════════════════════
// REAL-LIFE RELATIONSHIP ADVICE & NEWS API
// ══════════════════════════════════════════════════════════════════════

const CORE_ADVICE_ARTICLES = [
  {
    id: "adv_1",
    title: "The 4 Warning Signs in Relationship Communication & How to Counter Them",
    summary: "Dr. John Gottman's foundational research on the 'Four Horsemen' (Criticism, Contempt, Defensiveness, and Stonewalling) and the proven clinical antidotes to rebuild mutual respect and intimacy.",
    takeaways: [
      "Replace accusatory 'You always' language with gentle 'I feel' statements.",
      "Contempt is the #1 predictor of separation; actively cultivate daily appreciation.",
      "When emotionally flooded, take a mandatory 20-minute physical cooldown before continuing."
    ],
    source: "The Gottman Relationship Institute",
    sourceUrl: "https://www.gottman.com/blog/",
    category: "communication",
    categoryLabel: "💬 Communication & Trust",
    readTime: "4 min read",
    badge: "Psychology Research",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  },
  {
    id: "adv_2",
    title: "Navigating No-Contact: The Neuroscience of Heartbreak & Attachment Detox",
    summary: "Why our brains treat breakup grief like physical withdrawal, and how holding healthy no-contact boundaries helps rewire neural pathways away from obsessive longing.",
    takeaways: [
      "Dopamine craving causes obsessive checking of social media; total visual no-contact accelerates healing.",
      "Grief comes in non-linear waves — accepting a bad day without reaching out is a victory.",
      "Channel the attachment energy into rediscovering personal autonomy and physical movement."
    ],
    source: "Psychology Today Insights",
    sourceUrl: "https://www.psychologytoday.com/us/basics/relationships",
    category: "breakup",
    categoryLabel: "💔 Breakup Recovery",
    readTime: "5 min read",
    badge: "Neuroscience & Healing",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
  },
  {
    id: "adv_3",
    title: "Anxious vs. Avoidant Attachment: Breaking the Anxious-Avoidant Trap",
    summary: "Understanding how attachment styles trigger instinctive fight-or-flight reactions in relationships, and practical exercises to develop earned secure attachment.",
    takeaways: [
      "Anxious attachment confuses emotional distance with danger; avoidant attachment confuses closeness with suffocation.",
      "Recognize the 'protest behaviors' and name the underlying vulnerability clearly.",
      "Learn self-soothing techniques before reacting to your partner's emotional state."
    ],
    source: "Attachment & Relationship Science",
    sourceUrl: "https://greatergood.berkeley.edu/",
    category: "psychology",
    categoryLabel: "🧠 Relationship Psychology",
    readTime: "6 min read",
    badge: "Attachment Theory",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
  },
  {
    id: "adv_4",
    title: "Setting Healthy Emotional Boundaries Without Guilt or Resentment",
    summary: "Clear boundaries are the distance at which I can love both you and myself simultaneously. A guide to establishing limits with compassion.",
    takeaways: [
      "A boundary is not an ultimatum to control someone else; it is a declaration of what you will tolerate.",
      "Saying 'no' to demands that violate your values preserves the integrity of the connection.",
      "Communicate boundaries during calm moments rather than during heated conflicts."
    ],
    source: "Mindful Health & Boundaries",
    sourceUrl: "https://greatergood.berkeley.edu/",
    category: "healing",
    categoryLabel: "🌿 Self-Worth & Healing",
    readTime: "3 min read",
    badge: "Emotional Wellness",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
  },
  {
    id: "adv_5",
    title: "The Emotional Bank Account: Daily Micro-Moments That Build Lasting Love",
    summary: "How small, everyday 'bids for connection' form the foundation of emotional safety, romance, and enduring trust in modern partnerships.",
    takeaways: [
      "Turning toward your partner's bids (a question, a sigh, a look) is 10x more impactful than grand gestures.",
      "Maintain a 5:1 ratio of positive to negative interactions even during disagreements.",
      "Practice daily 10-minute uninterrupted check-ins to share highs and lows."
    ],
    source: "The Gottman Relationship Institute",
    sourceUrl: "https://www.gottman.com/blog/",
    category: "communication",
    categoryLabel: "💬 Communication & Trust",
    readTime: "4 min read",
    badge: "Clinical Advice",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString()
  },
  {
    id: "adv_6",
    title: "Rebuilding Self-Esteem After Betrayal or Sudden Abandonment",
    summary: "Reclaiming your sense of identity and self-worth when someone you trusted abruptly violates the relationship contract.",
    takeaways: [
      "Someone else's inability to choose you is a reflection of their capacity, not your value.",
      "Write a 'Self-Trust Inventory' listing all the ways you have shown up for yourself.",
      "Allow anger its rightful place as a boundary guardian, then release it when ready."
    ],
    source: "Psychology Today",
    sourceUrl: "https://www.psychologytoday.com/",
    category: "healing",
    categoryLabel: "🌿 Self-Worth & Healing",
    readTime: "5 min read",
    badge: "Trauma Recovery",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  }
];

function fetchHttpsJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (err) {
          resolve({ status: res.statusCode, data: null, error: err.message });
        }
      });
    }).on('error', err => reject(err));
  });
}

/**
 * GET /api/advice-slip/daily
 * Live real-world Advice Slip API integration
 */
app.get('/api/advice-slip/daily', async (req, res) => {
  try {
    const apiRes = await fetchHttpsJson('https://api.adviceslip.com/advice');
    if (apiRes.data && apiRes.data.slip) {
      return res.json({
        id: apiRes.data.slip.id,
        advice: apiRes.data.slip.advice,
        source: "Live Advice Slip API (Real-Time)",
        sourceUrl: "https://api.adviceslip.com/",
        fetchedAt: new Date().toISOString()
      });
    }
    throw new Error('No slip returned');
  } catch (err) {
    const fallbackSlips = [
      "Never allow someone to be your priority while allowing yourself to be their option.",
      "Listen with the intent to understand, not with the intent to reply.",
      "You cannot heal in the same environment that made you sick.",
      "Closure comes from accepting that the connection ended, not from an explanation.",
      "Self-respect will always cost you relationships that only valued your accommodation."
    ];
    const picked = fallbackSlips[Math.floor(Math.random() * fallbackSlips.length)];
    return res.json({
      id: Math.floor(Math.random() * 900) + 100,
      advice: picked,
      source: "Sonder Relationship Wisdom Engine",
      sourceUrl: "https://api.adviceslip.com/",
      fetchedAt: new Date().toISOString()
    });
  }
});

/**
 * GET /api/advice-news
 * Live Relationship Advice & News Hub
 */
app.get('/api/advice-news', async (req, res) => {
  try {
    const { category, q } = req.query;
    let articles = [...CORE_ADVICE_ARTICLES];

    try {
      const liveSearches = ['love', 'relationship', 'friend', 'life'];
      const searchWord = liveSearches[Math.floor(Math.random() * liveSearches.length)];
      const liveRes = await fetchHttpsJson(`https://api.adviceslip.com/advice/search/${searchWord}`);
      
      if (liveRes.data && Array.isArray(liveRes.data.slips) && liveRes.data.slips.length > 0) {
        liveRes.data.slips.slice(0, 3).forEach((slip) => {
          articles.unshift({
            id: `live_slip_${slip.id}`,
            title: `Daily Relationship Wisdom: "${slip.advice}"`,
            summary: `Live relationship insight fetched in real-time from the global Advice Slip API regarding ${searchWord}, empathy, and human connection.`,
            takeaways: [
              slip.advice,
              "Reflect on how this perspective applies to your current boundaries and connections.",
              "Take a moment to pause before reacting emotionally."
            ],
            source: "Live Advice Slip API",
            sourceUrl: "https://api.adviceslip.com/",
            category: "slips",
            categoryLabel: "💡 Quick Wisdom Slips",
            readTime: "1 min read",
            badge: "Live API Feed",
            publishedAt: new Date().toISOString()
          });
        });
      }
    } catch (e) {
      // Continue gracefully with core articles
    }

    if (category && category !== 'all') {
      articles = articles.filter(a => a.category === category);
    }

    if (q && typeof q === 'string' && q.trim()) {
      const term = q.toLowerCase().trim();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(term) || 
        a.summary.toLowerCase().includes(term) ||
        (a.takeaways && a.takeaways.some(t => t.toLowerCase().includes(term)))
      );
    }

    return res.json({
      success: true,
      count: articles.length,
      category: category || 'all',
      items: articles
    });
  } catch (err) {
    console.error('Error in /api/advice-news:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve relationship advice updates.' });
  }
});

// ══════════════════════════════════════════════════════════════════════
// PRIVATE MESSAGING & REAL-TIME CHAT API
// ══════════════════════════════════════════════════════════════════════
const messagesDb = require('./db/messages');

// GET all conversation threads
app.get('/api/messages/threads', (req, res) => {
  try {
    const threads = messagesDb.readThreads();
    return res.json({ success: true, threads });
  } catch (err) {
    console.error('Error fetching threads:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
});

// GET single thread with messages
app.get('/api/messages/threads/:threadId', (req, res) => {
  try {
    const thread = messagesDb.findThreadById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found.' });
    }
    return res.json({ success: true, thread });
  } catch (err) {
    console.error('Error fetching thread:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve conversation.' });
  }
});

// POST send message
app.post('/api/messages/send', (req, res) => {
  try {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
      return res.status(400).json({ error: 'threadId and message are required.' });
    }
    const result = messagesDb.appendMessage(threadId, message);
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Error sending message:', err.message);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

// POST mark thread as read
app.post('/api/messages/read', (req, res) => {
  try {
    const { threadId } = req.body;
    if (!threadId) {
      return res.status(400).json({ error: 'threadId is required.' });
    }
    const updated = messagesDb.markThreadAsRead(threadId);
    return res.json({ success: true, thread: updated });
  } catch (err) {
    console.error('Error marking thread as read:', err.message);
    return res.status(500).json({ error: 'Failed to update read status.' });
  }
});

// ══════════════════════════════════════════════════════════════════════
// REELS & SHORT-FORM VIDEO FEED API (INSTAGRAM REELS UX)
// ══════════════════════════════════════════════════════════════════════
const reelsDb = require('./db/reels');

// GET /api/reels - Paginated vertical video feed
app.get('/api/reels', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const data = reelsDb.getPaginatedReels(page, limit);
    return res.json({ success: true, ...data });
  } catch (err) {
    console.error('Error fetching reels:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve video feed.' });
  }
});

// POST /api/reels/:reelId/like - Toggle like
app.post('/api/reels/:reelId/like', (req, res) => {
  try {
    const result = reelsDb.toggleLike(req.params.reelId);
    return res.json(result);
  } catch (err) {
    console.error('Error liking reel:', err.message);
    return res.status(500).json({ error: 'Failed to toggle like.' });
  }
});

// POST /api/reels/:reelId/save - Toggle bookmark/save
app.post('/api/reels/:reelId/save', (req, res) => {
  try {
    const result = reelsDb.toggleSave(req.params.reelId);
    return res.json(result);
  } catch (err) {
    console.error('Error saving reel:', err.message);
    return res.status(500).json({ error: 'Failed to toggle save.' });
  }
});

// POST /api/reels/:reelId/comment - Add comment
app.post('/api/reels/:reelId/comment', (req, res) => {
  try {
    const { username, handle, avatar, text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }
    const result = reelsDb.addComment(req.params.reelId, {
      username: username || 'Sonder Member',
      handle: handle || '@member',
      avatar: avatar || null,
      text: text.trim()
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error commenting on reel:', err.message);
    return res.status(500).json({ error: 'Failed to post comment.' });
  }
});

// Explicit static asset routes with guaranteed MIME types for Vercel Serverless
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (req, res) => {
  res.type('text/css');
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/app.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.get('/favicon.svg', (req, res) => {
  res.type('image/svg+xml');
  res.sendFile(path.join(__dirname, 'favicon.svg'));
});

app.get('/favicon.ico', (req, res) => {
  res.type('image/svg+xml');
  res.sendFile(path.join(__dirname, 'favicon.svg'));
});

app.get('/favicon.png', (req, res) => {
  res.type('image/svg+xml');
  res.sendFile(path.join(__dirname, 'favicon.svg'));
});

app.get('/register-bg.jpg', (req, res) => {
  res.type('image/jpeg');
  res.sendFile(path.join(__dirname, 'register-bg.jpg'));
});

app.get('/register-hero.jpg', (req, res) => {
  res.type('image/jpeg');
  res.sendFile(path.join(__dirname, 'register-hero.jpg'));
});

// Wildcard fallback ONLY for SPA page routes (not for missing assets)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sonder server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
