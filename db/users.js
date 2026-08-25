const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION;
const DATA_DIR = isServerless ? path.join(os.tmpdir(), 'sonder_data') : path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory fallback
let memoryUsers = null;

// Ensure data directory and users.json exist
function ensureDataStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      // Check if project bundled data exists
      const bundledPath = path.join(__dirname, '..', 'data', 'users.json');
      let initialData = '[]';
      if (fs.existsSync(bundledPath)) {
        try { initialData = fs.readFileSync(bundledPath, 'utf8'); } catch (e) {}
      }
      fs.writeFileSync(USERS_FILE, initialData, 'utf8');
    }
  } catch (err) {
    // If filesystem is read-only, fallback to in-memory store
    if (memoryUsers === null) memoryUsers = [];
  }
}

// Read all users from store
function readUsers() {
  if (memoryUsers !== null) return memoryUsers;
  ensureDataStore();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (memoryUsers === null) memoryUsers = [];
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
