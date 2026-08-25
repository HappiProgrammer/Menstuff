const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory and users.json exist
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]), 'utf8');
  }
}

// Read all users from store
function readUsers() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(raw) || [];
  } catch (err) {
    console.error('Error reading users database:', err.message);
    return [];
  }
}

// Write users atomically
function writeUsers(users) {
  ensureDataStore();
  const tempFile = USERS_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), 'utf8');
  fs.renameSync(tempFile, USERS_FILE);
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
