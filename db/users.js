const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION;
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'sonder_data') : path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory fallback
let memoryUsers = null;

const DEFAULT_SEED_USERS = [
  {
    id: "u_tester_gmail_account",
    email: "tester@gmail.com",
    username: "Tester#1001",
    passwordHash: "$2a$12$MQF1f.8/FXWQoIuVJKGzq.kAHjRi2PE9siaYs.cxVtT.TMcFDW3Du", // Password123!
    role: "user",
    avatar: "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M5.5 21v-2a6.5 6.5 0 0 1 13 0v2\"/></svg>",
    createdAt: "2026-08-25T14:44:00.000Z",
    bio: "Exploring healing and relationship wisdom on Sonder."
  },
  {
    id: "u_1787546836492_aac75ddb",
    email: "member@shattered.io",
    username: "WanderingSoul#1024",
    passwordHash: "$2a$12$MQF1f.8/FXWQoIuVJKGzq.kAHjRi2PE9siaYs.cxVtT.TMcFDW3Du", // Password123!
    role: "user",
    avatar: "<svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"7\" r=\"4\"/><path d=\"M5.5 21v-2a6.5 6.5 0 0 1 13 0v2\"/></svg>",
    createdAt: "2026-08-24T04:47:16.492Z",
    bio: ""
  }
];

// Ensure data directory and users.json exist
function ensureDataStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      // Check if project bundled data exists
      const bundledPath = path.join(__dirname, '..', 'data', 'users.json');
      let initialData = JSON.stringify(DEFAULT_SEED_USERS, null, 2);
      if (fs.existsSync(bundledPath)) {
        try { initialData = fs.readFileSync(bundledPath, 'utf8'); } catch (e) {}
      }
      fs.writeFileSync(USERS_FILE, initialData, 'utf8');
    }
  } catch (err) {
    // If filesystem is read-only, fallback to in-memory store
    if (memoryUsers === null) memoryUsers = [...DEFAULT_SEED_USERS];
  }
}

// Read all users from store
function readUsers() {
  if (memoryUsers !== null) {
    DEFAULT_SEED_USERS.forEach(seed => {
      if (!memoryUsers.some(u => (u.email || '').toLowerCase() === seed.email.toLowerCase())) {
        memoryUsers.push(seed);
      }
    });
    return memoryUsers;
  }
  ensureDataStore();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed) ? parsed : [];
    DEFAULT_SEED_USERS.forEach(seed => {
      if (!users.some(u => (u.email || '').toLowerCase() === seed.email.toLowerCase())) {
        users.push(seed);
      }
    });
    return users;
  } catch (err) {
    if (memoryUsers === null) memoryUsers = [...DEFAULT_SEED_USERS];
    return memoryUsers;
  }
}

// Write users atomically
function writeUsers(users) {
  memoryUsers = users;
  try {
    ensureDataStore();
    const tempFile = USERS_FILE + '.tmp';
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf8');
    fs.renameSync(tempFile, USERS_FILE);
  } catch (err) {
    // Keep in-memory copy
  }
}

// Strip sensitive fields
function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

// Find by email (case-insensitive)
function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  const users = readUsers();
  return users.find(u => (u.email || '').toLowerCase() === normalized) || null;
}

// Find by username (case-insensitive)
function findUserByUsername(username) {
  if (!username) return null;
  const normalized = username.trim().toLowerCase();
  const users = readUsers();
  return users.find(u => (u.username || '').toLowerCase() === normalized) || null;
}

// Find by ID
function findUserById(id) {
  if (!id) return null;
  const users = readUsers();
  return users.find(u => u.id === id) || null;
}

// Create new user
function createUser({ email, username, passwordHash, avatar }) {
  const users = readUsers();
  const newUser = {
    id: 'u_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
    email: email.trim().toLowerCase(),
    username: (username || '').trim(),
    passwordHash: passwordHash,
    role: 'user', // Single, non-privileged user type
    avatar: avatar || null,
    createdAt: new Date().toISOString(),
    bio: ''
  };

  users.push(newUser);
  writeUsers(users);
  return sanitizeUser(newUser);
}

module.exports = {
  findUserByEmail,
  findUserByUsername,
  findUserById,
  createUser,
  sanitizeUser,
  readUsers
};
