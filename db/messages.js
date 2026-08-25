const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Ensure data directory and messages.json exist
function ensureDataStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify(getInitialSeedThreads(), null, 2), 'utf8');
  }
}

function getInitialSeedThreads() {
  const now = Date.now();
  return [
    {
      threadId: "th_velvet_echo",
      recipient: {
        id: "VelvetEcho#4092",
        name: "VelvetEcho",
        tag: "VelvetEcho#4092",
        avatar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        online: true,
        bio: "Finding peace in the quiet aftermath. Here to listen and hold space.",
        lastSeen: "Active now"
      },
      unreadCount: 1,
      lastActivity: now - 1000 * 60 * 8,
      messages: [
        {
          id: "msg_ve_0",
          sender: "them",
          text: "Hey there. I saw your reflection on healing — just wanted to check in. How are you holding up today?",
          timestamp: now - 1000 * 60 * 45,
          status: "read"
        },
        {
          id: "msg_ve_1",
          sender: "me",
          text: "Taking it one hour at a time. Some days are heavier than others.",
          timestamp: now - 1000 * 60 * 20,
          status: "read"
        },
        {
          id: "msg_ve_2",
          sender: "them",
          text: "That is completely normal. Healing is messy and non-linear. Be gentle with yourself tonight 🕊️",
          timestamp: now - 1000 * 60 * 8,
          status: "delivered"
        }
      ]
    },
    {
      threadId: "th_solitary_wanderer",
      recipient: {
        id: "SolitaryWanderer#8812",
        name: "SolitaryWanderer",
        tag: "SolitaryWanderer#8812",
        avatar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7.5a5 5 0 0 1 10 0v1H7V7.5z"/><circle cx="12" cy="10" r="3"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        online: true,
        bio: "3 months post-breakup. Rebuilding day by day through mountains and music.",
        lastSeen: "Active now"
      },
      unreadCount: 0,
      lastActivity: now - 1000 * 60 * 30,
      messages: [
        {
          id: "msg_sw_0",
          sender: "them",
          text: "Have you listened to that new track in the Music Room? Really helped me get through a rough evening.",
          timestamp: now - 1000 * 60 * 120,
          status: "read"
        },
        {
          id: "msg_sw_1",
          sender: "me",
          text: "Not yet! Which one was it?",
          timestamp: now - 1000 * 60 * 95,
          status: "read"
        },
        {
          id: "msg_sw_2",
          sender: "them",
          text: "'Glimpse of Us' — hit deep, but brought a weird sense of closure. Give it a listen when you're ready 🎧",
          timestamp: now - 1000 * 60 * 30,
          status: "read"
        }
      ]
    },
    {
      threadId: "th_quiet_rain",
      recipient: {
        id: "QuietRain#1943",
        name: "QuietRain",
        tag: "QuietRain#1943",
        avatar: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.5c2-1 5.5-.8 7 1 1 1.2 1.5 2.8 1.5 4.5v1c-.5.5-1.5.5-2 0V9a3.5 3.5 0 0 0-7 0v2a4 4 0 0 1-1.5-2.2C7 6.5 7.5 4.5 9 3.5z"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
        online: false,
        bio: "Night owl & writer. Finding strength in vulnerability.",
        lastSeen: "Seen 15m ago"
      },
      unreadCount: 0,
      lastActivity: now - 1000 * 60 * 60 * 5,
      messages: [
        {
          id: "msg_qr_0",
          sender: "them",
          text: "Remember: someone else's inability to see your worth never decreases your actual value.",
          timestamp: now - 1000 * 60 * 60 * 5,
          status: "read"
        }
      ]
    }
  ];
}

// Read all message threads
function readThreads() {
  ensureDataStore();
  try {
    const raw = fs.readFileSync(MESSAGES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const seed = getInitialSeedThreads();
    writeThreads(seed);
    return seed;
  } catch (err) {
    console.error('Error reading messages store:', err.message);
    return getInitialSeedThreads();
  }
}

// Write threads atomically
function writeThreads(threads) {
  ensureDataStore();
  const tempFile = MESSAGES_FILE + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(threads, null, 2), 'utf8');
  fs.renameSync(tempFile, MESSAGES_FILE);
}

// Get single thread by ID
function findThreadById(threadId) {
  const threads = readThreads();
  return threads.find(t => t.threadId === threadId) || null;
}

// Add message to thread
function appendMessage(threadId, message) {
  const threads = readThreads();
  let thread = threads.find(t => t.threadId === threadId);
  
  if (!thread) {
    thread = {
      threadId: threadId,
      recipient: {
        id: message.recipientId || "Anonymous",
        name: message.recipientName || "Anonymous",
        tag: message.recipientTag || "Anonymous",
        avatar: message.recipientAvatar || null,
        online: true,
        bio: "Community member",
        lastSeen: "Active now"
      },
      unreadCount: 0,
      lastActivity: Date.now(),
      messages: []
    };
    threads.unshift(thread);
  }

  const msgObj = {
    id: message.id || 'msg_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    sender: message.sender || 'me',
    text: message.text || '',
    image: message.image || null,
    isVoice: Boolean(message.isVoice),
    duration: message.duration || null,
    reaction: message.reaction || null,
    timestamp: message.timestamp || Date.now(),
    status: message.status || (message.sender === 'me' ? 'sent' : 'received')
  };

  if (!thread.messages) thread.messages = [];
  thread.messages.push(msgObj);
  thread.lastActivity = msgObj.timestamp;

  if (message.sender === 'them') {
    thread.unreadCount = (thread.unreadCount || 0) + 1;
  }

  writeThreads(threads);
  return { thread, message: msgObj };
}

// Mark thread as read
function markThreadAsRead(threadId) {
  const threads = readThreads();
  const thread = threads.find(t => t.threadId === threadId);
  if (thread) {
    thread.unreadCount = 0;
    if (thread.messages) {
      thread.messages.forEach(m => {
        if (m.sender === 'me' && m.status !== 'read') {
          m.status = 'read';
        }
      });
    }
    writeThreads(threads);
  }
  return thread;
}

module.exports = {
  readThreads,
  writeThreads,
  findThreadById,
  appendMessage,
  markThreadAsRead
};
