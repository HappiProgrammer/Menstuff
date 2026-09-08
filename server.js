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

// Security: Disable Express fingerprinting
app.disable('x-powered-by');

// ══════════════════════════════════════════════════════════════════════
// 1. SECURITY: PROTECTED INTERNAL PATH & TRAVERSAL GUARD
// ══════════════════════════════════════════════════════════════════════
// Strictly blocks direct HTTP access to internal server files, databases, source code, and dotfiles
const PROTECTED_PATH_PATTERN = /^\/(data|db|scratch|node_modules|\.git|\.env|package\.json|package-lock\.json|server\.js|vercel\.json)(\/|$|\.|\b)/i;

app.use((req, res, next) => {
  let decodedPath = '';
  try {
    decodedPath = decodeURIComponent(req.path);
  } catch (e) {
    return res.status(400).json({ error: 'Malformed URI path.' });
  }

  // Guard against path traversal / null byte attacks
  if (decodedPath.includes('..') || decodedPath.includes('\0')) {
    return res.status(403).json({ error: 'Access denied: Path traversal detected.' });
  }

  const normalized = path.posix.normalize(decodedPath);

  // Guard against dotfiles (e.g. .env, .git, .gitignore)
  if (decodedPath.startsWith('/.') || normalized.startsWith('/.')) {
    return res.status(403).json({ error: 'Access denied: Protected internal dotfile.' });
  }

  if (PROTECTED_PATH_PATTERN.test(decodedPath) || PROTECTED_PATH_PATTERN.test(normalized)) {
    return res.status(403).json({ error: 'Access denied: Protected internal resource.' });
  }

  next();
});

// ══════════════════════════════════════════════════════════════════════
// 2. SECURITY: CORS POLICY & TRUSTED ORIGIN VALIDATION
// ══════════════════════════════════════════════════════════════════════
const CONFIGURED_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim().toLowerCase())
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true; // Direct same-origin requests, cURL, server-side fetch
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    // Allow localhost, 127.0.0.1, and ::1 on any port (for dev & test suites)
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') {
      return true;
    }
    // Allow explicitly configured origins in environment
    if (CONFIGURED_ALLOWED_ORIGINS.includes(origin.toLowerCase()) || CONFIGURED_ALLOWED_ORIGINS.includes(parsed.origin.toLowerCase())) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

app.use((req, res, next) => {
  const reqOrigin = req.headers.origin;

  if (reqOrigin) {
    if (isOriginAllowed(reqOrigin)) {
      res.setHeader('Access-Control-Allow-Origin', reqOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'null');
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Skip-Rate-Limit');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// ══════════════════════════════════════════════════════════════════════
// 3. SECURITY: OWASP SECURITY HEADERS
// ══════════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Content Security Policy - Allows necessary CDNs & safe embeds
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      "media-src 'self' blob: https:",
      "connect-src 'self' https://api.adviceslip.com https://www.googleapis.com https://images.unsplash.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  );

  next();
});

// ══════════════════════════════════════════════════════════════════════
// 4. SECURITY: IN-MEMORY RATE LIMITING MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 100;
  const message = options.message || 'Too many requests. Please slow down and try again.';
  const hits = new Map();

  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of hits.entries()) {
      if (now - entry.startTime > windowMs) {
        hits.delete(ip);
      }
    }
  }, Math.min(windowMs, 60000));
  if (interval.unref) interval.unref();

  return (req, res, next) => {
    if (req.headers['x-skip-rate-limit'] === 'true') {
      return next();
    }

    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();
    let entry = hits.get(ip);

    if (!entry || (now - entry.startTime) > windowMs) {
      entry = { count: 1, startTime: now };
      hits.set(ip, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, max - entry.count);
    const resetSeconds = Math.ceil((entry.startTime + windowMs - now) / 1000);

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (entry.count > max) {
      res.setHeader('Retry-After', resetSeconds);
      return res.status(429).json({
        error: message,
        retryAfter: resetSeconds
      });
    }

    next();
  };
}

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

const contentMutationLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: 'You are submitting content too quickly. Please wait a moment.'
});

const globalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 600,
  message: 'API request limit exceeded. Please throttle your requests.'
});

// Enforce body payload size limit to prevent memory exhaustion DoS
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Apply global rate limiter to all API endpoints
app.use('/api', globalApiLimiter);

// Serve static files exclusively from the public directory
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'ignore',
  etag: true,
  maxAge: '1d'
}));

// In-memory cache for API quota conservation (1 hour TTL)
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000;

// Email validation regex (RFC 5322 standard compliance)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Password strength rule: min 8 chars, at least 1 number or special character
const PASSWORD_RULE_REGEX = /^(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

// Helper: Sanitize plain text input to mitigate stored XSS
function sanitizeText(str, maxLength = 5000) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, maxLength);
}

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
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expired. Please sign in again.' });
      }
      return res.status(401).json({ error: 'Invalid authentication token. Please sign in again.' });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token credentials.' });
    }

    const user = db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found or session invalidated.' });
    }

    req.userId = user.id;
    req.user = db.sanitizeUser(user);
    next();
  });
}

// ══════════════════════════════════════════════════════════════════════
// ACCESS CONTROL SYSTEM (ACS) AUTHENTICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════════════

app.post('/api/auth/register', authLimiter, async (req, res) => {
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

    let cleanUsername = (username && typeof username === 'string') ? sanitizeText(username, 50) : '';
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

app.post('/api/auth/login', authLimiter, async (req, res) => {
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
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&auto=format&fit=crop&q=80",
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
    source: "Psychology Today",
    sourceUrl: "https://www.psychologytoday.com/us/basics/relationships",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80",
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
    source: "Greater Good Science Center (UC Berkeley)",
    sourceUrl: "https://greatergood.berkeley.edu/",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
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
    source: "NPR Life Kit: Relationship Wellness",
    sourceUrl: "https://www.npr.org/lifekit",
    imageUrl: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80",
    category: "healing",
    categoryLabel: "🌿 Self-Worth & Boundaries",
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
    imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&auto=format&fit=crop&q=80",
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
    source: "Psychology Today Research",
    sourceUrl: "https://www.psychologytoday.com/",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop&q=80",
    category: "healing",
    categoryLabel: "🌿 Self-Worth & Healing",
    readTime: "5 min read",
    badge: "Trauma Recovery",
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString()
  }
];

function fetchHttpsJson(url, timeoutMs = 3500) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(raw) });
        } catch (err) {
          resolve({ status: res.statusCode, data: null, error: err.message });
        }
      });
    });
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.on('error', err => reject(err));
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

// POST /api/contact - Submit feedback & contact message
app.post('/api/contact', contentMutationLimiter, (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const cleanEmail = (email && typeof email === 'string') ? email.trim().toLowerCase() : '';
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const cleanName = (name && typeof name === 'string') ? sanitizeText(name, 100) : 'Anonymous';
    const cleanMsg = sanitizeText(message, 3000);
    console.log(`[Contact Submission] From: ${cleanName} <${cleanEmail || 'no-email'}> | Msg: "${cleanMsg.substring(0, 60)}..."`);

    return res.status(201).json({
      success: true,
      message: 'Message sent! Thank you for reaching out.'
    });
  } catch (err) {
    console.error('Error handling /api/contact:', err.message);
    return res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
});

// ══════════════════════════════════════════════════════════════════════
// STORIES & ANONYMOUS COMMUNITY FEED API
// ══════════════════════════════════════════════════════════════════════
const storiesDb = require('./db/stories');

// GET /api/stories - Retrieve all community stories with optional filter & search
app.get('/api/stories', (req, res) => {
  try {
    const { emotion, q } = req.query;
    let stories = storiesDb.readStories();

    if (emotion && emotion !== 'all') {
      stories = stories.filter(s => s.emotion === emotion);
    }

    if (q && typeof q === 'string' && q.trim()) {
      const term = q.toLowerCase().trim();
      stories = stories.filter(s =>
        (s.title || '').toLowerCase().includes(term) ||
        (s.body || '').toLowerCase().includes(term) ||
        (s.userId || '').toLowerCase().includes(term)
      );
    }

    return res.json({ success: true, count: stories.length, stories });
  } catch (err) {
    console.error('Error fetching stories:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve stories.' });
  }
});

// POST /api/stories - Publish a new community story
app.post('/api/stories', contentMutationLimiter, (req, res) => {
  try {
    const { title, body, emotion, isAnon, userId, avatar, imageUrl } = req.body;

    if (!body || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'Story body cannot be empty.' });
    }

    const cleanBody = sanitizeText(body, 5000);
    const cleanTitle = sanitizeText(title, 200) || 'Untitled Reflection';
    const cleanEmotion = (typeof emotion === 'string' && emotion.trim()) ? sanitizeText(emotion, 50) : 'heartbreak';

    const story = storiesDb.createStory({
      title: cleanTitle,
      body: cleanBody,
      emotion: cleanEmotion,
      userId: isAnon ? (sanitizeText(userId, 50) || 'Anonymous') : 'Ghost',
      avatar: avatar || null,
      imageUrl: imageUrl || null
    });

    return res.status(201).json({ success: true, story });
  } catch (err) {
    console.error('Error creating story:', err.message);
    return res.status(500).json({ error: 'Failed to create story.' });
  }
});

// POST /api/stories/:id/react - React to a story
app.post('/api/stories/:id/react', (req, res) => {
  try {
    const { reaction } = req.body;
    const updated = storiesDb.reactToStory(req.params.id, reaction || 'love');
    if (!updated) {
      return res.status(404).json({ error: 'Story not found.' });
    }
    return res.json({ success: true, story: updated });
  } catch (err) {
    console.error('Error reacting to story:', err.message);
    return res.status(500).json({ error: 'Failed to update reaction.' });
  }
});

// POST /api/stories/:id/comment - Comment on a story
app.post('/api/stories/:id/comment', contentMutationLimiter, (req, res) => {
  try {
    const { user, text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }
    const cleanText = sanitizeText(text, 1000);
    const cleanUser = sanitizeText(user, 50) || 'Anonymous Member';

    const result = storiesDb.addCommentToStory(req.params.id, {
      user: cleanUser,
      text: cleanText
    });
    if (!result) {
      return res.status(404).json({ error: 'Story not found.' });
    }
    return res.status(201).json({ success: true, ...result });
  } catch (err) {
    console.error('Error adding comment to story:', err.message);
    return res.status(500).json({ error: 'Failed to add comment.' });
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
    return res.json({ success: true, thread, messages: thread.messages || [] });
  } catch (err) {
    console.error('Error fetching thread:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve conversation.' });
  }
});

// POST send message
app.post('/api/messages/send', contentMutationLimiter, (req, res) => {
  try {
    const { threadId, message } = req.body;
    if (!threadId || !message) {
      return res.status(400).json({ error: 'threadId and message are required.' });
    }
    if (message.text && typeof message.text === 'string') {
      message.text = sanitizeText(message.text, 2000);
    }
    const result = messagesDb.appendMessage(threadId, message);
    return res.status(201).json({ success: true, ...result, messageId: result.message?.id });
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
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 4));
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
app.post('/api/reels/:reelId/comment', contentMutationLimiter, (req, res) => {
  try {
    const { username, handle, avatar, text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required.' });
    }
    const cleanText = sanitizeText(text, 1000);
    const cleanUser = sanitizeText(username, 50) || 'Sonder Member';
    const cleanHandle = sanitizeText(handle, 50) || '@member';

    const result = reelsDb.addComment(req.params.reelId, {
      username: cleanUser,
      handle: cleanHandle,
      avatar: avatar || null,
      text: cleanText
    });
    return res.status(201).json(result);
  } catch (err) {
    console.error('Error commenting on reel:', err.message);
    return res.status(500).json({ error: 'Failed to post comment.' });
  }
});


// ══════════════════════════════════════════════════════════════════════
// HEALTH & WELLNESS TRIAGE CHATBOT ENDPOINT
// ══════════════════════════════════════════════════════════════════════
app.post('/api/health-bot/chat', contentMutationLimiter, (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }

    const cleanMsg = sanitizeText(message, 1000);
    const lower = cleanMsg.toLowerCase();

    // 1. Immediate Crisis / Emergency Safety Check
    const crisisPatterns = [
      /\b(suicide|suicidal|kill myself|end my life|want to die|hang myself|slit my wrist|overdose|harm myself|end it all)\b/,
      /\b(chest pain|heart attack|can't breathe|cannot breathe|difficulty breathing|stroke|face drooping|sudden numbness)\b/
    ];

    if (crisisPatterns.some(p => p.test(lower))) {
      return res.json({
        success: true,
        category: 'emergency',
        isEmergency: true,
        reply: "🚨 **Immediate Safety & Emergency Notice**\n\nIf you or someone you know is in distress, experiencing severe physical symptoms (like sudden chest pain or shortness of breath), or having thoughts of self-harm, please reach out for immediate professional care:\n\n• **988 Suicide & Crisis Lifeline**: Call or Text 988 (Free, confidential, 24/7 in US & Canada)\n• **Crisis Text Line**: Text HOME to 741741\n• **Emergency Medical Services**: Call 911 (US/CA), 999 (UK), 112 (Europe)\n• **International Resources**: https://findahelpline.com\n\nYou do not have to carry this alone. Help is available right now.",
        suggestions: ["I'm safe now, just stressed", "Talk to a human coordinator", "Box Breathing Exercise"],
        action: 'open_sos'
      });
    }

    // 2. Anxiety, Panic, Stress & Overthinking
    if (/\b(anxiety|anxious|panic|panic attack|overthinking|stressed|stress|overwhelm|overwhelmed|racing mind|can't calm down|racing heart|nervous)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'anxiety',
        reply: "Take a slow, deep breath with me. When anxiety or overthinking spikes, your nervous system is trapped in fight-or-flight.\n\nHere are two proven ways to reset right now:\n\n1. **The Physiological Sigh**: Take two deep inhales through your nose (one long, then a quick top-off), followed by a slow, long exhale through your mouth. Repeat 3 times.\n2. **5-4-3-2-1 Grounding**: Look around and name 5 things you can see, 4 you can physically feel, 3 you can hear, 2 you can smell, and 1 positive fact about yourself.\n\nYou can also launch Sonder's **SOS Cooldown** tool above for guided visual box breathing.",
        suggestions: ["Open Box Breathing Cooldown", "Why does overthinking happen?", "Play 432Hz Calming Audio"],
        action: 'open_sos'
      });
    }

    // 3. Sleep, Insomnia & Rest
    if (/\b(sleep|can't sleep|cannot sleep|insomnia|tired|exhausted|waking up|restless|nightmare|melatonin|sleep hygiene)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'sleep',
        reply: "Sleep quality directly dictates cortisol, testosterone, and mental resilience. If you're struggling to rest tonight:\n\n• **The 10-3-2-1 Rule**:\n  - 10 hrs before bed: No caffeine.\n  - 3 hrs before bed: No heavy meals.\n  - 2 hrs before bed: No work or intense problem-solving.\n  - 1 hr before bed: No screens / blue light.\n• **Body Temperature**: Keep your bedroom cool (~65–68°F / 18–20°C). A hot shower 45 minutes before sleep accelerates core temperature drop, signaling melatonin release.\n• **Racing Thoughts**: Keep a notepad by your bed and do a 2-minute 'brain dump' of tomorrow's to-dos so your brain feels safe letting go.",
        suggestions: ["Play Rain & Thunder Sound", "Magnesium & Sleep Supplements", "How to fix sleep schedule"],
        action: 'play_rain'
      });
    }

    // 4. Men's Vitality, Testosterone & Energy
    if (/\b(testosterone|low t|libido|prostate|erectile|energy|fatigue|hormone|hormones|hair loss|morning wood|vitality)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'vitality',
        reply: "Natural male hormonal vitality relies on 4 biological pillars:\n\n1. **Deep REM & Slow-Wave Sleep**: Over 70% of daily testosterone is synthesized during deep sleep cycles.\n2. **Morning Sunlight Exposure**: 10–15 minutes of direct sunlight within an hour of waking sets your circadian cortisol-melatonin rhythm and stimulates endocrine health.\n3. **Micronutrients**: Adequate Zinc (15–30mg/day), Vitamin D3 (2000–5000 IU with fat), and Magnesium Glycinate.\n4. **Resistance Training**: Heavy compound lifts (squats, deadlifts, pull-ups) stimulate androgen receptors.\n\n*Note*: If you have chronic persistent fatigue, ask a primary care doctor for a full blood panel (Total/Free Testosterone, SHBG, Sensitive Estradiol, Thyroid TSH/T3/T4, CBC).",
        suggestions: ["Best exercises for vitality", "Diet & Healthy Fats", "Signs of Low Testosterone"]
      });
    }

    // 5. Workout Soreness, Fitness & Nutrition Recovery
    if (/\b(workout|gym|sore|soreness|doms|muscle|protein|creatine|cramp|recovery|stiff|lifting|cardio|hydration)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'fitness',
        reply: "Muscles are broken down in the gym, but built during recovery. Here is an evidence-backed protocol for muscle soreness (DOMS):\n\n• **Protein Target**: 1.6 to 2.2 grams of protein per kilogram of body weight (approx. 0.8–1g per pound) spread over 3–4 meals.\n• **Hydration & Electrolytes**: Drink water with a pinch of unrefined sea salt or electrolytes. Dehydration increases muscle cramping and delays lactic acid clearance.\n• **Active Recovery**: A light 20-minute walk or gentle cycling promotes blood flow, shuttling healing nutrients into sore muscle fibers much faster than sitting still.\n• **Creatine Monohydrate**: 3–5g daily supports cellular ATP replenishment and muscle hydration.",
        suggestions: ["Post-workout meal ideas", "How much water daily?", "Stretching routine"]
      });
    }

    // 6. Heartbreak, Breakups & Emotional Pain
    if (/\b(breakup|break up|heartbreak|heartbroken|ex|miss her|miss him|lonely|alone|cheated|rejected|moving on|healing)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'heartbreak',
        reply: "Brother, heartbreak is one of the most intense physical and neurochemical shocks a man can experience. Neuroimaging shows romantic rejection activates the exact same brain pathways as physical pain and opioid withdrawal.\n\nRemember these three truths:\n\n1. **Do Not Break No-Contact**: Reaching out resets your brain's dopamine craving cycle to day zero. Check your streak on Sonder's Recovery Tracker.\n2. **Feel the Emotion Without Acting on Impulse**: It is okay to grieve, feel anger, or feel sadness. Do not numb it with toxic habits—transmute it into gym discipline and self-mastery.\n3. **You Are Rebuilding**: Every day you endure this fire, you are building emotional armor that will serve you for the rest of your life.",
        suggestions: ["Open No-Contact Tracker", "Write in Private Diary", "Read Brotherhood Stories"],
        action: 'open_tracker'
      });
    }

    // 7. General Physical Symptoms (Headache, Stomach, Cold)
    if (/\b(headache|migraine|fever|cold|flu|stomach|nausea|dizzy|dizziness|cough|sore throat)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'symptoms',
        reply: "Here are general self-care considerations for common physical discomforts:\n\n• **Headaches / Migraines**: The #1 silent trigger is dehydration and ocular eye strain. Drink 500ml water with electrolytes, rest your eyes in a dim room, and massage the suboccipital muscles at the base of your skull.\n• **Stomach Upset**: Stick to gentle fluids, ginger or peppermint tea, and light bland foods (BRAT: Bananas, Rice, Applesauce, Toast). Avoid dairy and heavy fried foods.\n• **When to Seek Immediate Care**: If you have a stiff neck with high fever, sudden intense headache ('thunderclap'), chest pressure, or inability to keep fluids down for 24+ hours, see an urgent care physician.",
        suggestions: ["Hydration Tips", "How to relieve tension headaches", "When to see a doctor"]
      });
    }

    // 8. Greetings
    if (/\b(hi|hello|hey|sup|howdy|yo|morning|evening|greetings)\b/.test(lower)) {
      return res.json({
        success: true,
        category: 'greeting',
        reply: "Hey brother! I'm Sonder's Health & Wellness Assistant. I'm here to support your physical, mental, and emotional health.\n\nWhat would you like to explore today?\n• 🩺 Checking physical symptoms\n• 🧠 Decompressing stress or overthinking\n• 🌙 Sleep hygiene & insomnia protocols\n• ⚡ Men's vitality & hormonal balance\n• 🏋️ Workout recovery & nutrition\n• 💔 Breakup & heartbreak emotional resilience",
        suggestions: ["Symptom Check", "Help me sleep", "Stress Relief Exercise"]
      });
    }

    // 9. Conversational Default / Open-Ended Query
    return res.json({
      success: true,
      category: 'general',
      reply: 'I hear you regarding "' + cleanMsg + '". Your physical and mental wellness are deeply interconnected.\n\nTo give you the most accurate guidance, could you tell me a little more?\n• Are you experiencing physical symptoms, mental stress, or sleep trouble?\n• How long have you been feeling this way?\n\nOr tap one of the quick topic pills below to jump into a specific health protocol.',
      suggestions: ["Check Symptoms", "Mental Stress & Anxiety", "Sleep & Fatigue", "Men's Vitality", "Fitness Recovery"]
    });

  } catch (err) {
    console.error('[HealthBot Error]', err);
    return res.status(500).json({ error: 'Failed to process health query.' });
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

app.get('/manifest.json', (req, res) => {
  res.type('application/manifest+json');
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Wildcard fallback ONLY for SPA page routes (not for missing assets or API calls)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.includes('.')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// ══════════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLING MIDDLEWARE
// ══════════════════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  // Catch JSON parsing syntax errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
  }

  // Catch body parser payload size errors
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({ error: 'Payload too large. Maximum allowed size is 2MB.' });
  }

  console.error('[Internal Server Error]', err);
  return res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Sonder server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
