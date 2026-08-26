/**
 * Shattered - IG Layout Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── STATE ──────────────────────────────────────────────────────────
  const S = {
    user: {
      id: null,
      joined: null,
      avatar: null,
      moods: [],
      bio: '',
      followers: Math.floor(Math.random()*80) + 12,
      following: Math.floor(Math.random()*40) + 5
    },
    posts: [],
    diary: [],
    notifs: [],
    follows: [],      // user IDs this user follows
    saved: [],        // post IDs saved/bookmarked
    dms: [],          // direct message threads
    activePane: 'feed',
    activeDmThread: null,
    ambientSound: 'off'
  };

  // ─── CONSTANTS & DATA ───────────────────────────────────────────────
  const ADJS = ["Silent","Broken","Fading","Lost","Echoing","Wandering","Midnight","Lonely","Falling","Shattered","Tearful","Distant"];
  const NOUNS = ["Rose","Moon","Star","Rain","Echo","Soul","Heart","Wind","Tear","Dawn","Dusk","Wave"];
  const AVATARS = [
    // 1. Classic Minimalist Profile Silhouette
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
    // 2. Silhouette with Headphones (Reflective / Music persona)
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5.5 21v-1.8a6.5 6.5 0 0 1 13 0v1.8"/><path d="M6 10a6 6 0 0 1 12 0v2a2 2 0 0 1-2 2h-1v-4h3"/><path d="M6 12H5a2 2 0 0 1-2-2v-1a6 6 0 0 1 3-4.5"/></svg>',
    // 3. Silhouette with Modern Glasses
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/><circle cx="9.5" cy="7" r="1.3"/><circle cx="14.5" cy="7" r="1.3"/><line x1="10.8" y1="7" x2="13.2" y2="7"/></svg>',
    // 4. Silhouette with Beanie / Hood (Hiker persona)
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7.5a5 5 0 0 1 10 0v1H7V7.5z"/><circle cx="12" cy="10" r="3"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
    // 5. Stylized Profile Persona
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a5 5 0 0 0-5 5v1a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/><path d="M4 21v-2a7 7 0 0 1 14 0v2"/></svg>',
    // 6. Silhouette with Hair Wave
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3.5c2-1 5.5-.8 7 1 1 1.2 1.5 2.8 1.5 4.5v1c-.5.5-1.5.5-2 0V9a3.5 3.5 0 0 0-7 0v2a4 4 0 0 1-1.5-2.2C7 6.5 7.5 4.5 9 3.5z"/><path d="M5.5 21v-2a6.5 6.5 0 0 1 13 0v2"/></svg>',
    // 7. Minimal Geometric Persona
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M6 20a6 6 0 0 1 12 0"/><circle cx="12" cy="12" r="9"/></svg>',
    // 8. Elegant Abstract Monogram Identity
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>'
  ];
  
  const EMOTIONS = {
    heartbreak: { label: "Heartbreak", cls: "eb-heartbreak" },
    betrayal:   { label: "Betrayal", cls: "eb-betrayal" },
    longing:    { label: "Longing", cls: "eb-longing" },
    healing:    { label: "Healing", cls: "eb-healing" },
    anger:      { label: "Anger", cls: "eb-anger" },
    acceptance: { label: "Acceptance", cls: "eb-acceptance" }
  };

  const PROMPTS = [
    "What broke your heart?",
    "What do you wish you could tell them?",
    "Describe the moment you realized it was over.",
    "What is the hardest part about moving on?",
    "Write a letter you will never send.",
    "What did this heartbreak teach you about yourself?"
  ];

  const MUSIC = {
    heartbreak: [
      { id:"kQ8n19aWp4c", title:"drivers license", artist:"Olivia Rodrigo" },
      { id:"bCuhuePlP8o", title:"Someone You Loved", artist:"Lewis Capaldi" },
      { id:"zlJDTxahav0", title:"Lose You To Love Me", artist:"Selena Gomez" },
      { id:"FvOpPeKSf_4", title:"Glimpse of Us", artist:"Joji" }
    ],
    healing: [
      { id:"k4V3Mo61fJM", title:"Fix You", artist:"Coldplay" },
      { id:"iWZmdoY1aTE", title:"Happier", artist:"Ed Sheeran" },
      { id:"UfcAVejslrU", title:"Weightless", artist:"Marconi Union" },
      { id:"Ar48yzqn1G0", title:"Sparks", artist:"Coldplay" }
    ],
    letitout: [
      { id:"gNi_6U5Pm_o", title:"good 4 u", artist:"Olivia Rodrigo" },
      { id:"tollGa3S0o8", title:"All Too Well", artist:"Taylor Swift" },
      { id:"5GJWxDKyk3A", title:"Happier Than Ever", artist:"Billie Eilish" }
    ],
    movingon: [
      { id:"gl1aHhXnN1k", title:"thank u, next", artist:"Ariana Grande" },
      { id:"G7KNmW9a75Y", title:"Flowers", artist:"Miley Cyrus" },
      { id:"YaEG2aWJnZ8", title:"Unstoppable", artist:"Sia" }
    ]
  };

  const HEALING_QUOTES = [
    { text: "The wound is the place where the light enters you.", author: "Rumi" },
    { text: "You survived the worst day of your life so far.", author: "Unknown" },
    { text: "Healing doesn't mean the damage never existed. It means the damage no longer controls our lives.", author: "Akshay Dubey" }
  ];

  const HEALING_TIPS = [
    { title: "No Contact", icon: "📵", text: "Give yourself space to heal. Unfollow and block if necessary." },
    { title: "Feel the Feelings", icon: "🌊", text: "Don't suppress it. Cry if you need to. It's part of the process." },
    { title: "Rediscover Yourself", icon: "🌱", text: "Do things you used to love before they came into your life." },
    { title: "Talk About It", icon: "🗣️", text: "Share your feelings here anonymously or with a trusted friend." }
  ];

  // Dummy stories for IG Story Viewer
  const HIGHLIGHT_STORIES = [
    { id: 's1', user: 'FadingStar#12', title: 'The last text', body: 'I still read it every night. "I\'m sorry, I can\'t do this anymore." Just like that, 3 years gone.', emotion: 'heartbreak', time: '2h ago' },
    { id: 's2', user: 'SilentWind#88', title: 'Seeing you with her', body: 'My heart stopped. You looked so happy. Happier than you ever looked with me.', emotion: 'betrayal', time: '5h ago' },
    { id: 's3', user: 'HealingDawn#01', title: 'I smiled today', body: 'I woke up and my first thought wasn\'t you. It\'s a small step, but it\'s something.', emotion: 'healing', time: '1d ago' }
  ];

  // ─── UTILS ──────────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => document.querySelectorAll(sel);
  
  const escapeHTML = (str) => {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  const generateId = () => {
    const adj = ADJS[Math.floor(Math.random() * ADJS.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${adj}${noun}#${num}`;
  };

  const getAvatar = () => AVATARS[Math.floor(Math.random() * AVATARS.length)];
  
  const formatDate = (dStr) => {
    const d = new Date(dStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const timeAgo = (dStr) => {
    const s = Math.floor((new Date() - new Date(dStr)) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return formatDate(dStr);
  };

  const showToast = (msg) => {
    const t = $('toast');
    $('toast-msg').innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
  };

  const showLiveNotif = (msg) => {
    const n = $('live-notif');
    $('live-notif-text').innerHTML = msg;
    n.classList.add('show');
    setTimeout(() => n.classList.remove('show'), 4000);
  };

  // ─── API BASE URL HELPER ──────────────────────────────────────────
  const getApiUrl = (endpoint) => {
    if (window.location.protocol === 'file:' || (window.location.port && window.location.port !== '3000')) {
      return `http://localhost:3000${endpoint}`;
    }
    return endpoint;
  };

  // ─── INIT & STORAGE ───────────────────────────────────────────────
  const init = async () => {
    // Check server authentication session first via httpOnly cookie / token
    try {
      const res = await fetch(getApiUrl('/api/auth/me'), { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          S.user = {
            id: data.user.username || data.user.email,
            email: data.user.email,
            avatar: data.user.avatar || getAvatar(),
            joined: data.user.createdAt || new Date().toISOString(),
            bio: data.user.bio || '',
            followers: Math.floor(Math.random()*60)+8,
            following: Math.floor(Math.random()*30)+3,
            moods: []
          };
          loadData();
          $('landing-page').classList.remove('active');
          $('landing-page').classList.add('hidden');
          $('app-page').classList.remove('hidden');
          setupApp();
          initRouter();
          return;
        }
      }
    } catch (e) {
      // Backend not reached or offline
    }

    loadData();
    if (S.user && S.user.id && S.user.email) {
      $('landing-page').classList.remove('active');
      $('landing-page').classList.add('hidden');
      $('app-page').classList.remove('hidden');
      setupApp();
      initRouter();
    } else {
      setupLanding();
    }
  };

  // ─── COMMUNITY PERSONAS FOR REALISTIC EMOTIONAL SUPPORT CHAT ──────────
  const COMMUNITY_PERSONAS = [
    {
      id: "VelvetEcho#4092",
      name: "VelvetEcho",
      tag: "VelvetEcho#4092",
      avatar: AVATARS[0],
      online: true,
      bio: "Finding peace in the quiet aftermath. Here to listen and hold space.",
      lastSeen: "Active now",
      starterMessages: [
        { sender: "them", text: "Hey there. I saw your reflection on healing — just wanted to check in. How are you holding up today?", timestamp: Date.now() - 1000 * 60 * 45 },
        { sender: "me", text: "Taking it one hour at a time. Some days are heavier than others.", timestamp: Date.now() - 1000 * 60 * 20 },
        { sender: "them", text: "That is completely normal. Healing is messy and non-linear. Be gentle with yourself tonight 🕊️", timestamp: Date.now() - 1000 * 60 * 8 }
      ]
    },
    {
      id: "SolitaryWanderer#8812",
      name: "SolitaryWanderer",
      tag: "SolitaryWanderer#8812",
      avatar: AVATARS[3],
      online: true,
      bio: "3 months post-breakup. Rebuilding day by day through mountains and music.",
      lastSeen: "Active now",
      starterMessages: [
        { sender: "them", text: "Have you listened to that new track in the Music Room? Really helped me get through a rough evening.", timestamp: Date.now() - 1000 * 60 * 120 },
        { sender: "me", text: "Not yet! Which one was it?", timestamp: Date.now() - 1000 * 60 * 95 },
        { sender: "them", text: "'Glimpse of Us' — hit deep, but brought a weird sense of closure. Give it a listen when you're ready 🎧", timestamp: Date.now() - 1000 * 60 * 30 }
      ]
    },
    {
      id: "QuietRain#1943",
      name: "QuietRain",
      tag: "QuietRain#1943",
      avatar: AVATARS[5],
      online: false,
      bio: "Night owl & writer. Finding strength in vulnerability.",
      lastSeen: "Seen 15m ago",
      starterMessages: [
        { sender: "them", text: "Remember: someone else's inability to see your worth never decreases your actual value.", timestamp: Date.now() - 1000 * 60 * 60 * 5 }
      ]
    },
    {
      id: "Luna_Glow#7710",
      name: "Luna_Glow",
      tag: "Luna_Glow#7710",
      avatar: AVATARS[4],
      online: true,
      bio: "Self-worth warrior. You are worthy of genuine, peaceful love.",
      lastSeen: "Active now",
      starterMessages: []
    },
    {
      id: "MidnightThinker#3301",
      name: "MidnightThinker",
      tag: "MidnightThinker#3301",
      avatar: AVATARS[1],
      online: true,
      bio: "Learning to let go of what wasn't meant for me.",
      lastSeen: "Active now",
      starterMessages: []
    }
  ];

  const DEFAULT_FRIENDS = [
    {
      id: "VelvetEcho#4092",
      name: "VelvetEcho",
      tag: "VelvetEcho#4092",
      avatar: AVATARS[0],
      online: true,
      bio: "Finding peace in the quiet aftermath. Here to listen and hold space.",
      status: "Active now • Soul sister",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 3
    },
    {
      id: "SolitaryWanderer#8812",
      name: "SolitaryWanderer",
      tag: "SolitaryWanderer#8812",
      avatar: AVATARS[3],
      online: true,
      bio: "3 months post-breakup. Rebuilding day by day through mountains and music.",
      status: "Active now • Healing ally",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 5
    },
    {
      id: "QuietRain#1943",
      name: "QuietRain",
      tag: "QuietRain#1943",
      avatar: AVATARS[5],
      online: false,
      bio: "Night owl & writer. Finding strength in vulnerability.",
      status: "Seen 15m ago",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 8
    },
    {
      id: "Luna_Glow#7710",
      name: "Luna_Glow",
      tag: "Luna_Glow#7710",
      avatar: AVATARS[4],
      online: true,
      bio: "Self-worth warrior. You are worthy of genuine, peaceful love.",
      status: "Active now • Mutual support",
      addedAt: Date.now() - 1000 * 60 * 60 * 24 * 10
    }
  ];

  const saveData = () => {
    localStorage.setItem('sonder_v4', JSON.stringify({
      user: S.user,
      diary: S.diary,
      follows: S.follows,
      saved: S.saved,
      dms: S.dms,
      friends: S.friends,
      tracker: S.tracker,
      dailyPromptAnswered: S.dailyPromptAnswered,
      posts: S.posts.filter(p => p.isMine)
    }));
  };

  const loadData = () => {
    const d = localStorage.getItem('sonder_v4') || localStorage.getItem('shattered_v3');
    if (d) {
      let parsed = {};
      try {
        parsed = JSON.parse(d);
      } catch (err) {
        console.warn('[Sonder Auth] Error parsing localStorage data, resetting session:', err);
        localStorage.removeItem('sonder_v4');
      }
      S.user = parsed.user || { id: null, joined: null, avatar: null, moods: [], bio: '', followers: 0, following: 0 };
      if (!S.user.avatar || !AVATARS.includes(S.user.avatar)) {
        S.user.avatar = getAvatar();
      }
      if (!S.user.bio) S.user.bio = '';
      if (!S.user.followers) S.user.followers = Math.floor(Math.random()*60)+8;
      if (!S.user.following) S.user.following = Math.floor(Math.random()*30)+3;
      S.diary = parsed.diary || [];
      S.follows = parsed.follows || [];
      S.saved = parsed.saved || [];
      S.dms = parsed.dms || [];
      S.friends = (parsed.friends && parsed.friends.length > 0) ? parsed.friends : [...DEFAULT_FRIENDS];
      S.tracker = parsed.tracker || { startDate: Date.now() - 86400000 * 5.2, mode: 'no-contact' };
      S.dailyPromptAnswered = parsed.dailyPromptAnswered || false;
      const myPosts = parsed.posts || [];
      S.posts = myPosts;
      if (S.posts.length < 5) generateFakePosts();
      S.posts.sort((a,b) => new Date(b.date) - new Date(a.date));
      generateMockDMs();
    } else {
      S.friends = [...DEFAULT_FRIENDS];
      S.tracker = { startDate: Date.now() - 86400000 * 5.2, mode: 'no-contact' };
      generateFakePosts();
      generateMockDMs();
    }
  };

  const generateMockDMs = () => {
    if (S.dms && S.dms.length > 0) return;

    S.dms = [
      {
        threadId: "th_velvet_echo",
        recipient: {
          id: COMMUNITY_PERSONAS[0].id,
          name: COMMUNITY_PERSONAS[0].name,
          tag: COMMUNITY_PERSONAS[0].tag,
          avatar: COMMUNITY_PERSONAS[0].avatar,
          online: true,
          bio: COMMUNITY_PERSONAS[0].bio,
          lastSeen: "Active now"
        },
        unreadCount: 1,
        lastActivity: Date.now() - 1000 * 60 * 8,
        messages: COMMUNITY_PERSONAS[0].starterMessages.map((m, idx) => ({
          id: `msg_ve_${idx}`,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp,
          status: 'read'
        }))
      },
      {
        threadId: "th_solitary_wanderer",
        recipient: {
          id: COMMUNITY_PERSONAS[1].id,
          name: COMMUNITY_PERSONAS[1].name,
          tag: COMMUNITY_PERSONAS[1].tag,
          avatar: COMMUNITY_PERSONAS[1].avatar,
          online: true,
          bio: COMMUNITY_PERSONAS[1].bio,
          lastSeen: "Active now"
        },
        unreadCount: 0,
        lastActivity: Date.now() - 1000 * 60 * 30,
        messages: COMMUNITY_PERSONAS[1].starterMessages.map((m, idx) => ({
          id: `msg_sw_${idx}`,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp,
          status: 'read'
        }))
      },
      {
        threadId: "th_quiet_rain",
        recipient: {
          id: COMMUNITY_PERSONAS[2].id,
          name: COMMUNITY_PERSONAS[2].name,
          tag: COMMUNITY_PERSONAS[2].tag,
          avatar: COMMUNITY_PERSONAS[2].avatar,
          online: false,
          bio: COMMUNITY_PERSONAS[2].bio,
          lastSeen: "Seen 15m ago"
        },
        unreadCount: 0,
        lastActivity: Date.now() - 1000 * 60 * 60 * 5,
        messages: COMMUNITY_PERSONAS[2].starterMessages.map((m, idx) => ({
          id: `msg_qr_${idx}`,
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp,
          status: 'read'
        }))
      }
    ];
  };

  // Gradient palettes for post backgrounds (Phase 1.6 image sourcing)
  const POST_GRADIENTS = [
    ['#1a0a12','#3d1626'], ['#0d1a2b','#1a3a5c'], ['#0f1a0d','#1e3a1a'],
    ['#1a1209','#3d2a0a'], ['#180f1a','#3a1a3d'], ['#0a1a1a','#0f3d3a'],
    ['#1a0f0f','#3d1a1a'], ['#0d0d1a','#1a1a3d']
  ];
  const FAKE_TITLES = [
    'The last message I never sent',
    'I saw you yesterday',
    'Why does it still hurt?',
    'Three months and still counting',
    'Your laugh is a ghost in my mind',
    'I deleted your photos today',
    'What I should have said',
    'Moving forward, slowly',
    'The playlist I can\'t delete',
    'I\'m learning to be alone',
    'Our song came on the radio',
    'Healing feels like forgetting'
  ];
  const FAKE_BODIES = [
    'I typed it out a hundred times. I never hit send. Maybe that was the right choice.',
    'You looked happy. I had to remind myself that\'s a good thing, even if it broke something in me.',
    'It\'s been 90 days. People say it gets easier. Maybe they mean something different by "easier".',
    'Every notification is still you, for a second, before reality catches up.',
    'I went through them one by one. Deleted them. Cried. Deleted some more.',
    'The words came too late. Or maybe they were never the right words to begin with.',
    'Healing isn\'t linear. Some days I\'m fine. Others, a single song ruins everything.',
    'I used to think being alone meant being lonely. I\'m slowly unlearning that.',
    'I had to change the station. I wasn\'t ready. I don\'t know when I will be.',
    'Maybe forgetting isn\'t a betrayal. Maybe it\'s just survival.',
    'There\'s this quiet that comes after. You\'d think I\'d welcome it. I don\'t.',
    'Some wounds don\'t announce themselves. They just show up in small, ordinary moments.'
  ];

  const generateFakePosts = () => {
    const emKeys = Object.keys(EMOTIONS);
    for(let i = 0; i < 12; i++) {
      const em = emKeys[Math.floor(Math.random() * emKeys.length)];
      const d = new Date();
      d.setHours(d.getHours() - Math.floor(Math.random() * 72));
      const gradIdx = Math.floor(Math.random() * POST_GRADIENTS.length);
      const hasImg = Math.random() > 0.55; // ~45% of posts have a gradient image

      S.posts.push({
        id: 'p_' + Date.now() + '_' + i,
        userId: generateId(),
        avatar: getAvatar(),
        title: FAKE_TITLES[i % FAKE_TITLES.length],
        body: FAKE_BODIES[i % FAKE_BODIES.length],
        emotion: em,
        date: d.toISOString(),
        reacts: { love: Math.floor(Math.random()*18), cry: Math.floor(Math.random()*9), angry: Math.floor(Math.random()*3), healing: Math.floor(Math.random()*6), peace: Math.floor(Math.random()*4) },
        comments: [
          { user: generateId(), text: 'I felt this so deeply. Thank you for sharing.' },
          { user: generateId(), text: 'You are not alone in this.' }
        ].slice(0, Math.random() > 0.5 ? 2 : 0),
        isMine: false,
        gradient: hasImg ? POST_GRADIENTS[gradIdx] : null
      });
    }
  };

  // ─── LANDING / REGISTER PAGE (ACCESS CONTROL SYSTEM) ─────────────
  const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  const PASSWORD_RULE_REGEX = /^(?=.*[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const setupLanding = () => {
    console.log('[DEBUG] setupLanding called');
    let authMode = 'signin'; // Default to Sign In

    const errorBanner = $('rac-error-banner');
    const infoBanner = $('rac-info-banner');
    const emailInput = $('returning-id');
    const passInput = $('rac-password-input');
    const enterBtn = $('enter-btn');
    const enterBtnText = $('enter-btn-text');
    const enterBtnSpinner = $('enter-btn-spinner');

    const showAuthError = (msg) => {
      console.warn('[Sonder Auth Error]', msg);
      if (infoBanner) infoBanner.classList.add('hidden');
      if (errorBanner) {
        errorBanner.innerText = msg;
        errorBanner.classList.remove('hidden');
      }
      showToast('⚠️ ' + msg);
    };

    const showAuthInfo = (msg) => {
      console.log('[Sonder Auth Info]', msg);
      if (errorBanner) errorBanner.classList.add('hidden');
      if (infoBanner) {
        infoBanner.innerText = msg;
        infoBanner.classList.remove('hidden');
      }
    };

    const clearAuthBanners = () => {
      if (errorBanner) {
        errorBanner.classList.add('hidden');
        errorBanner.innerText = '';
      }
      if (infoBanner) {
        infoBanner.classList.add('hidden');
        infoBanner.innerText = '';
      }
    };

    const setAuthLoading = (isLoading, btnText) => {
      if (enterBtn) enterBtn.disabled = isLoading;
      if (enterBtnSpinner) enterBtnSpinner.classList.toggle('hidden', !isLoading);
      if (enterBtnText) {
        enterBtnText.innerText = btnText || (isLoading ? 'Processing...' : (authMode === 'register' ? 'Create Account' : 'Sign in'));
      }
    };

    // Set mode: 'signin' vs 'register'
    const setAuthMode = (mode) => {
      authMode = mode;
      clearAuthBanners();
      const tabSignin = $('tab-mode-signin');
      const tabRegister = $('tab-mode-register');
      const toggleLink = $('returning-toggle-btn');
      const titleEl = $('rac-title') || document.querySelector('.rac-title');
      const subEl = $('rac-sub') || document.querySelector('.rac-sub');
      const btnText = $('enter-btn-text');
      const btnEl = $('enter-btn');
      
      if (tabSignin) {
        tabSignin.classList.toggle('active-tab', mode === 'signin');
        tabSignin.setAttribute('aria-selected', mode === 'signin');
      }
      if (tabRegister) {
        tabRegister.classList.toggle('active-tab', mode === 'register');
        tabRegister.setAttribute('aria-selected', mode === 'register');
      }

      if (mode === 'register') {
        if (btnText) btnText.innerText = 'Create Account';
        else if (btnEl) btnEl.innerText = 'Create Account';
        if (titleEl) titleEl.innerHTML = 'Create your <span class="rac-title-bold" id="rac-title-bold">account</span>';
        if (subEl) subEl.innerText = 'Join our supportive anonymous community.';
        if (toggleLink) toggleLink.innerText = 'Already have an account? Sign in';
        if (passInput) passInput.autocomplete = 'new-password';
        console.log('[Sonder Auth] Switched mode to: CREATE ACCOUNT');
      } else {
        if (btnText) btnText.innerText = 'Sign in';
        else if (btnEl) btnEl.innerText = 'Sign in';
        if (titleEl) titleEl.innerHTML = 'Welcome <span class="rac-title-bold" id="rac-title-bold">back</span>';
        if (subEl) subEl.innerText = 'Sign in to your account below.';
        if (toggleLink) toggleLink.innerText = 'Need an account? Create one';
        if (passInput) passInput.autocomplete = 'current-password';
        console.log('[Sonder Auth] Switched mode to: SIGN IN');
      }
    };

    // Tab buttons
    if ($('tab-mode-signin')) {
      $('tab-mode-signin').onclick = () => {
        setAuthMode('signin');
        emailInput?.focus();
      };
    }
    if ($('tab-mode-register')) {
      $('tab-mode-register').onclick = () => {
        setAuthMode('register');
        emailInput?.focus();
      };
    }

    // Hero Card: Register CTA button
    if ($('hero-register-btn')) {
      $('hero-register-btn').onclick = () => {
        setAuthMode('register');
        emailInput?.focus();
        showToast('Ready to register! Enter your email and password.');
      };
    }

    // Hero Card: Try for Free button
    if ($('hero-free-btn')) {
      $('hero-free-btn').onclick = () => {
        setAuthMode('register');
        if (emailInput && !emailInput.value) {
          emailInput.value = `anon_${Date.now().toString().slice(-5)}@shattered.io`;
        }
        if (passInput && !passInput.value) {
          passInput.value = `Shattered#${Math.floor(1000 + Math.random() * 9000)}!`;
        }
        handleAuthSubmit();
      };
    }

    // Toggle link below form
    if ($('returning-toggle-btn')) {
      $('returning-toggle-btn').onclick = (e) => {
        e.preventDefault();
        const nextMode = authMode === 'register' ? 'signin' : 'register';
        setAuthMode(nextMode);
        emailInput?.focus();
      };
    }

    // Check URL Hash on initial landing render
    if (window.location.hash === '#register' || window.location.hash === '#create-account') {
      setAuthMode('register');
    }

    // Form submission handler
    const authForm = $('rac-auth-form');
    if (authForm) {
      authForm.onsubmit = (e) => {
        e.preventDefault();
        handleAuthSubmit();
      };
    }

    // Clear banners on input edit
    emailInput?.addEventListener('input', clearAuthBanners);
    passInput?.addEventListener('input', clearAuthBanners);

    // Form submission
    const handleAuthSubmit = async () => {
      clearAuthBanners();

      const email = (emailInput?.value || '').trim();
      const password = passInput?.value || '';

      console.log(`[Sonder Auth] Submitting mode="${authMode}" for email="${email}"`);

      // ── Client-Side Validation ──
      if (!email) {
        showAuthError('Please enter your email address.');
        emailInput?.focus();
        return;
      }
      if (!EMAIL_REGEX.test(email)) {
        showAuthError('Please enter a valid email address (e.g. name@example.com).');
        emailInput?.focus();
        return;
      }
      if (!password) {
        showAuthError('Please enter a password.');
        passInput?.focus();
        return;
      }
      if (password.length < 8) {
        showAuthError('Password must be at least 8 characters long.');
        passInput?.focus();
        return;
      }
      if (!PASSWORD_RULE_REGEX.test(password)) {
        showAuthError('Password must contain at least one number or special character (e.g. 1-9, !, @, #, $).');
        passInput?.focus();
        return;
      }

      // In-flight loading state
      setAuthLoading(true, authMode === 'register' ? 'Creating account...' : 'Signing in...');

      try {
        const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
        const payload = {
          email: email,
          password: password,
          username: email.split('@')[0],
          avatar: getAvatar()
        };

        let res = null;
        let data = null;
        let networkFailed = false;

        try {
          const targetUrl = getApiUrl(endpoint);
          console.log(`[Sonder Auth] Sending POST to: ${targetUrl}`);
          res = await fetch(targetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
          });
          data = await res.json();
          console.log(`[Sonder Auth] Server response status=${res?.status}:`, data);
        } catch (fetchErr) {
          console.warn('[Sonder Auth] Fetch error:', fetchErr.message);
          networkFailed = true;
        }

        // If backend server is unreachable (e.g. running purely offline or protocol restriction)
        if (networkFailed || !res) {
          console.warn('[Sonder Auth] Backend unreachable. Entering in local session mode.');
          setAuthLoading(false, 'Success!');
          showAuthInfo('Entering community (Local Session Mode)...');

          S.user = {
            id: email.split('@')[0],
            email: email,
            avatar: getAvatar(),
            joined: new Date().toISOString(),
            bio: '',
            followers: Math.floor(Math.random() * 60) + 8,
            following: Math.floor(Math.random() * 30) + 3,
            moods: []
          };
          saveData();

          setTimeout(() => {
            $('landing-page').classList.remove('active');
            $('landing-page').classList.add('hidden');
            $('app-page').classList.remove('hidden');
            setupApp();
            initRouter();
            showToast(`Welcome, ${S.user.id}!`);
          }, 350);
          return;
        }

        if (!res.ok) {
          setAuthLoading(false);
          if (res.status === 409) {
            showAuthError('An account with this email already exists. Please click "Sign In" above to log in.');
          } else if (res.status === 401) {
            showAuthError('Invalid email or password. If you do not have an account yet, click "Create Account" above.');
          } else {
            showAuthError(data?.error || 'Authentication request failed. Please try again.');
          }
          return;
        }

        // Authentication Succeeded
        setAuthLoading(false, 'Success!');
        showAuthInfo(data.message || 'Authenticated successfully! Entering community...');

        S.user = {
          id: data.user.username || data.user.email,
          email: data.user.email,
          avatar: data.user.avatar || getAvatar(),
          joined: data.user.createdAt || new Date().toISOString(),
          bio: data.user.bio || '',
          followers: Math.floor(Math.random() * 60) + 8,
          following: Math.floor(Math.random() * 30) + 3,
          moods: []
        };
        saveData();

        setTimeout(() => {
          $('landing-page').classList.remove('active');
          $('landing-page').classList.add('hidden');
          $('app-page').classList.remove('hidden');
          setupApp();
          initRouter();
          showToast(`Welcome, ${S.user.id}!`);
        }, 350);

      } catch (err) {
        console.error('[Sonder Auth Exception]', err);
        setAuthLoading(false);
        showAuthError('An unexpected error occurred. Please try again.');
      }
    };

    if (enterBtn) {
      enterBtn.onclick = (e) => {
        e.preventDefault();
        handleAuthSubmit();
      };
      console.log('[DEBUG] enter-btn wired successfully');
    }

    // Particles
    const pCont = $('particles');
    if (pCont) {
      pCont.innerHTML = '';
      for(let i=0; i<30; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + 'vw';
        p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
        p.style.background = Math.random() > 0.5 ? 'var(--accent)' : 'var(--accent2)';
        p.style.animationDuration = (Math.random() * 10 + 5) + 's';
        p.style.animationDelay = (Math.random() * 5) + 's';
        pCont.appendChild(p);
      }
    }
  };

  // ─── APP CORE ─────────────────────────────────────────────────────
  const setupApp = () => {
    // Populate UI with user data
    $('sidebar-avatar').innerHTML = S.user.avatar;
    $('sidebar-user-id').innerText = S.user.id;
    $('right-avatar').innerHTML = S.user.avatar;
    $('right-user-id').innerText = S.user.id;
    $('write-bar-avatar').innerHTML = S.user.avatar;
    $('wm-avatar').innerHTML = S.user.avatar;
    $('wm-user-id').innerText = S.user.id;
    // Populate profile section
    const pid = $('profile-id');
    const pjoined = $('profile-joined');
    if (pid) pid.innerText = S.user.id;
    if (pjoined) pjoined.innerText = new Date(S.user.joined).toLocaleDateString();

    // Logout handling
    const handleLogout = async () => {
      try {
        await fetch(getApiUrl('/api/auth/logout'), { method: 'POST' });
      } catch (e) {}
      localStorage.removeItem('sonder_v4');
      localStorage.removeItem('shattered_v3');
      S.user = { id: null, joined: null, avatar: null, moods: [], bio: '', followers: 0, following: 0 };
      $('app-page').classList.add('hidden');
      $('landing-page').classList.remove('hidden');
      $('landing-page').classList.add('active');
      setupLanding();
      showToast('Logged out successfully.');
    };

    if ($('logout-btn')) $('logout-btn').onclick = handleLogout;
    if ($('logout-profile-btn')) $('logout-profile-btn').onclick = handleLogout;
    if ($('right-logout-btn')) $('right-logout-btn').onclick = handleLogout;
    
    // Nav Listeners across all data-pane elements
    qa('[data-pane]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pane = e.currentTarget.dataset.pane;
        if (pane) switchPane(pane);
      });
    });

    // Write Action
    const openWrite = () => {
      $('write-modal').classList.remove('hidden');
      setNewPrompt();
    };
    $('nav-create').onclick = openWrite;
    $('mobile-create-btn').onclick = openWrite;
    $('write-trigger').onclick = openWrite;
    $('write-bar-btn').onclick = openWrite;
    
    $('wm-cancel').onclick = () => $('write-modal').classList.add('hidden');
    $('wm-prompt-new').onclick = setNewPrompt;
    
    $('wm-submit').onclick = () => {
      const title = $('wm-title').value.trim();
      const body = $('wm-body').value.trim();
      if(!body) return alert("Please write something.");
      
      const isAnon = $('post-anon').checked;
      const emKey = $('wm-emotion').value;
      
      const newPost = {
        id: 'p_'+Date.now(),
        userId: isAnon ? S.user.id : 'Ghost',
        avatar: isAnon ? S.user.avatar : getAvatar(),
        title: title || 'Untitled',
        body: body,
        emotion: emKey,
        date: new Date().toISOString(),
        reacts: { love:0, cry:0, angry:0, healing:0, peace:0 },
        comments: [],
        isMine: true
      };
      
      S.posts.unshift(newPost);
      saveData();
      
      $('wm-title').value = '';
      $('wm-body').value = '';
      $('write-modal').classList.add('hidden');
      
      showToast("Story shared.");
      renderFeed();
      renderMyStories();
      
      // Update stats if needed
      if(S.activePane !== 'feed') switchPane('feed');
    };

    $('wm-body').addEventListener('input', (e) => {
      $('wm-char').innerText = e.target.value.length;
    });



    // Filter
    $('filter-select').addEventListener('change', renderFeed);

    // Initial renders
    renderFeed();
    setupRightSidebar();
    setupMusic();
    setupHealing();
    setupTracker();
    setupSOSGrounding();
    setupDailyPrompt();
    setupCardExporter();
    setupAdviceSection();
    setupDiary();
    setupSearch();
    setupStoriesBar();
    setupContact();
    setupProfile();
    setupExplore();
    setupReels();
    setupMessages();
    setupSaved();
    setupImageAttach();
  };

  const PANE_SEO_META = {
    feed: {
      title: 'Community Stories & Anonymous Reflections | Sonder',
      desc: 'Read authentic, unfiltered stories of love, heartbreak, and resilience from an anonymous community with zero judgment.'
    },
    explore: {
      title: 'Explore Trending Topics & Perspectives | Sonder',
      desc: 'Discover heartfelt stories across grief, hope, letting go, self-worth, and healing from voices around the world.'
    },
    reels: {
      title: 'Video Wisdom & Healing Reels | Sonder',
      desc: 'Watch vertical video reflections, bite-sized relationship wisdom, grounding breathwork, and emotional insights.'
    },
    advice: {
      title: 'Relationship Advice & Real-Life Wisdom News | Sonder',
      desc: 'Curated articles, research-backed advice, and actionable takeaways on boundaries, attachment styles, and healing.'
    },
    messages: {
      title: 'Private Encrypted Messages & Friends Circle | Sonder',
      desc: 'Connect in private one-on-one chats with trusted friends and compassionate listeners in a safe, encrypted space.'
    },
    healing: {
      title: 'Healing Hub & Streak Milestone Counter | Sonder',
      desc: 'Track your no-contact streaks, emotional recovery milestones, daily mood check-ins, and box breathing exercises.'
    },
    music: {
      title: 'Binaural & Emotional Soundscapes | Sonder',
      desc: 'Calming lo-fi beats, ambient theta waves, and reflective piano soundscapes curated for deep emotional relief.'
    },
    diary: {
      title: 'Encrypted Private Diary & Unsent Letters | Sonder',
      desc: 'Write unsent letters and process your emotions in a private, encrypted digital diary stored securely on your device.'
    },
    saved: {
      title: 'Saved Stories & Bookmarked Wisdom | Sonder',
      desc: 'Access your collection of saved reflections, advice articles, and favorite community moments.'
    },
    about: {
      title: 'About Sonder & Anonymous Privacy Charter | Sonder',
      desc: 'Learn about Sonder’s mission to build an empathetic, judgment-free sanctuary for emotional healing.'
    },
    contact: {
      title: 'Contact Support & Community Feedback | Sonder',
      desc: 'Get in touch with the Sonder team for community feedback, privacy inquiries, and support.'
    },
    profile: {
      title: 'My Anonymous Profile & Insights | Sonder',
      desc: 'Manage your anonymous avatar, bio, community milestones, and privacy settings.'
    }
  };

  const switchPane = (paneId) => {
    const targetPane = $(`pane-${paneId}`);
    if (!targetPane) return;
    qa('.ig-pane').forEach(p => p.classList.add('hidden'));
    targetPane.classList.remove('hidden');
    S.activePane = paneId;
    window.scrollTo(0,0);

    // Dynamic SEO Title & Meta Description Update
    const meta = PANE_SEO_META[paneId] || PANE_SEO_META.feed;
    document.title = meta.title;
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', meta.desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', meta.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', meta.desc);

    // Sync all nav buttons & links with accessibility attributes
    qa('.ig-nav-item').forEach(b => {
      const isActive = b.dataset.pane === paneId;
      b.classList.toggle('active-nav', isActive);
      if (isActive) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    qa('.ib-btn').forEach(b => {
      const isActive = b.dataset.pane === paneId;
      b.classList.toggle('active-ib', isActive);
      if (isActive) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    qa('.top-nav-link').forEach(l => {
      const isActive = l.dataset.pane === paneId;
      l.classList.toggle('active-top-nav', isActive);
      if (isActive) l.setAttribute('aria-current', 'page');
      else l.removeAttribute('aria-current');
    });

    if (location.hash.replace('#', '') !== paneId) {
      history.replaceState(null, '', '#' + paneId);
    }

    if(paneId === 'notif') {
      const badge = $('notif-badge');
      if (badge) { badge.classList.add('hidden'); badge.innerText = '0'; }
    }
    if(paneId === 'feed') updateDailyPromptCountdown();
    if(paneId === 'healing') renderTracker();
    if(paneId === 'explore') renderExplore(exploreFilter || 'all');
    if(paneId === 'reels') onEnterReels();
    else onLeaveReels();
    if(paneId === 'advice') loadAdviceNews(currentAdviceCategory);
    if(paneId === 'saved') renderSaved();
    if(paneId === 'messages') renderDMInbox();
    if(paneId === 'profile') updateProfileStats();
  };

  const setNewPrompt = () => {
    $('wm-prompt-text').innerText = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
  };

  // ─── DOUBLE-TAP LIKE ───────────────────────────────────────────────
  let lastTap = 0;
  const doubleTapLike = (e, post, reactSpan) => {
    const now = Date.now();
    if (now - lastTap < 350) {
      // Double tap!
      if (!post.userLiked) {
        post.reacts.love++;
        post.userLiked = true;
        if (reactSpan) reactSpan.innerText = Object.values(post.reacts).reduce((a,b)=>a+b,0);
      }
      // Show heart burst
      const burst = $('heart-burst');
      const rect = e.currentTarget.getBoundingClientRect();
      burst.style.left = (rect.left + rect.width/2 - 40) + 'px';
      burst.style.top  = (rect.top  + rect.height/2 - 40) + 'px';
      burst.classList.remove('bursting');
      void burst.offsetWidth; // reflow
      burst.classList.add('bursting');
      setTimeout(() => burst.classList.remove('bursting'), 800);
      showToast('💔 Liked');
    }
    lastTap = now;
  };

  // ─── TOGGLE SAVE ───────────────────────────────────────────────────
  const toggleSave = (postId, btn) => {
    const idx = S.saved.indexOf(postId);
    if (idx === -1) {
      S.saved.push(postId);
      btn.classList.add('saved');
      btn.title = 'Remove bookmark';
      showToast('Saved to bookmarks');
    } else {
      S.saved.splice(idx, 1);
      btn.classList.remove('saved');
      btn.title = 'Save post';
      showToast('Removed from saved');
    }
    saveData();
    if (S.activePane === 'saved') renderSaved();
  };

  // ─── TOGGLE FOLLOW ─────────────────────────────────────────────────
  const toggleFollow = (userId, btn) => {
    const idx = S.follows.indexOf(userId);
    if (idx === -1) {
      S.follows.push(userId);
      S.user.following = (S.user.following || 0) + 1;
      btn.classList.add('following');
      btn.innerText = 'Following';
      showToast(`Following ${userId.split('#')[0]}`);
    } else {
      S.follows.splice(idx, 1);
      S.user.following = Math.max(0, (S.user.following || 1) - 1);
      btn.classList.remove('following');
      btn.innerText = 'Follow';
      showToast('Unfollowed');
    }
    saveData();
    updateProfileStats();
  };

  // ─── RENDER FEED ───────────────────────────────────────────────────
  const renderFeed = () => {
    const list = $('ig-posts-list');
    list.innerHTML = '';
    list.setAttribute('aria-live', 'polite');

    const filter = $('filter-select').value;
    let viewPosts = S.posts;
    if(filter !== 'all') {
      viewPosts = viewPosts.filter(p => p.emotion === filter);
    }

    $('stories-count-label').innerText = `${viewPosts.length} stories`;

    if(viewPosts.length === 0) {
      $('empty-feed').classList.remove('hidden');
      $('feed-end').classList.add('hidden');
      return;
    }

    $('empty-feed').classList.add('hidden');
    $('feed-end').classList.remove('hidden');

    viewPosts.forEach(p => {
      const el = createPostCard(p, true);
      list.appendChild(el);
    });
  };

  const createPostCard = (p, showFollow = false) => {
    const el = document.createElement('div');
    el.className = 'ig-post';
    el.setAttribute('role', 'article');

    const em = EMOTIONS[p.emotion];
    const isGhost = p.userId === 'Ghost';
    const isSaved = S.saved.includes(p.id);
    const isFollowing = S.follows.includes(p.userId);
    const isMe = p.isMine;
    const totalReacts = Object.values(p.reacts).reduce((a,b)=>a+b,0);

    // Optional gradient image block
    const imgHtml = p.gradient ? `
      <div class="post-img-wrap">
        <div style="width:100%;height:180px;background:linear-gradient(135deg,${p.gradient[0]},${p.gradient[1]});display:flex;align-items:center;justify-content:center;">
          <span style="font-size:36px;opacity:0.5;">${em && em.label === 'Heartbreak' ? '💔' : em && em.label === 'Healing' ? '🌿' : em && em.label === 'Betrayal' ? '🗡' : '✨'}</span>
        </div>
      </div>` : '';

    el.innerHTML = `
      <div class="ig-post-head">
        <div class="ig-post-user">
          <div class="ig-post-avatar ${isGhost ? 'ghost-av' : ''}" aria-hidden="true">${p.avatar}</div>
          <div>
            <div class="ig-post-id ${isGhost ? 'ghost-id' : ''}">${escapeHTML(p.userId)}</div>
            <div class="ig-post-time">${timeAgo(p.date)}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${showFollow && !isMe ? `<button class="follow-btn${isFollowing ? ' following' : ''}" data-uid="${escapeHTML(p.userId)}">${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
          <button class="ig-post-more" aria-label="More options"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg></button>
        </div>
      </div>
      <div class="ig-post-emotion ${em.cls}" aria-label="Emotion: ${escapeHTML(em.label)}">${escapeHTML(em.label)}</div>
      <h2 class="ig-post-title">${escapeHTML(p.title)}</h2>
      ${imgHtml}
      <div class="ig-post-body">${escapeHTML(p.body)}</div>
      <div class="ig-post-foot">
        <button class="ig-post-action react-trig" aria-label="React to post">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span class="react-count">${totalReacts}</span>
        </button>
        <button class="ig-post-action comment-trig" aria-label="Comment">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
          <span>${p.comments.length}</span>
        </button>
        ${!isMe && !isGhost ? `
          <button class="ig-post-action dm-author-btn" data-uid="${escapeHTML(p.userId)}" title="Message author anonymously" aria-label="Message author anonymously">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </button>
        ` : ''}
        <div class="ig-post-action-spacer"></div>
        <button class="ig-post-action share-btn" aria-label="Share post">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
        <button class="ig-post-action post-bookmark-btn${isSaved ? ' saved' : ''}" data-id="${p.id}" title="${isSaved ? 'Remove bookmark' : 'Save post'}" aria-label="${isSaved ? 'Remove from saved' : 'Save post'}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? 'var(--accent)' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    `;

    // Double-tap like on body
    const reactSpan = el.querySelector('.react-count');
    el.querySelector('.ig-post-body').addEventListener('click', (e) => doubleTapLike(e, p, reactSpan));
    el.querySelector('.ig-post-title').addEventListener('click', (e) => doubleTapLike(e, p, reactSpan));

    // Open detail
    el.querySelector('.react-trig').onclick = () => openPostDetail(p);
    el.querySelector('.comment-trig').onclick = () => openPostDetail(p);

    // DM Author
    const dmAuthorBtn = el.querySelector('.dm-author-btn');
    if (dmAuthorBtn) {
      dmAuthorBtn.onclick = (e) => {
        e.stopPropagation();
        startDirectMessageWith({
          id: p.userId,
          name: p.userId,
          tag: p.userId,
          avatar: p.avatar,
          online: true,
          bio: `Author of "${p.title}"`,
          lastSeen: 'Active recently'
        });
      };
    }

    // Share
    el.querySelector('.share-btn').onclick = () => {
      navigator.clipboard?.writeText(window.location.href + '#' + p.id).catch(()=>{});
      showToast('Link copied to clipboard');
    };

    // Bookmark
    const bookmarkBtn = el.querySelector('.post-bookmark-btn');
    bookmarkBtn.onclick = (e) => { e.stopPropagation(); toggleSave(p.id, bookmarkBtn); };

    // Follow
    const followBtn = el.querySelector('.follow-btn');
    if (followBtn) {
      followBtn.onclick = (e) => { e.stopPropagation(); toggleFollow(p.userId, followBtn); };
    }

    // More options
    el.querySelector('.ig-post-more').onclick = (e) => {
      e.stopPropagation();
      showToast('Options coming soon');
    };

    return el;
  };

  let activePostId = null;
  const openPostDetail = (post) => {
    activePostId = post.id;
    const m = $('post-modal');
    m.classList.remove('hidden');
    
    const em = EMOTIONS[post.emotion];
    const isGhost = post.userId === 'Ghost';
    
    $('pm-content').innerHTML = `
      <div class="pm-modal-user">
        <div class="pm-modal-avatar ${isGhost ? 'ghost-av' : ''}">${post.avatar}</div>
        <div>
          <div class="pm-modal-id ${isGhost ? 'ghost-id' : ''}">${escapeHTML(post.userId)}</div>
          <div class="pm-modal-time">${formatDate(post.date)}</div>
        </div>
      </div>
      <div class="pm-modal-emotion ${em.cls}">${escapeHTML(em.label)}</div>
      <div class="pm-modal-title">${escapeHTML(post.title)}</div>
      <div class="pm-modal-body">${escapeHTML(post.body)}</div>
      <div class="pm-modal-actions-row" style="display:flex;justify-content:flex-end;margin-top:12px;">
        <button type="button" class="dpc-export-btn" id="pm-export-card-btn" style="padding:6px 14px;font-size:12px;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>Export Story Card</span>
        </button>
      </div>
    `;

    const exportBtn = $('pm-export-card-btn');
    if (exportBtn) {
      exportBtn.onclick = () => {
        openExportCardModal({
          text: post.body,
          author: post.userId || 'Anonymous',
          tag: em ? em.label : 'Sonder Story',
          emotion: post.emotion
        });
      };
    }
    
    updatePostModalReacts(post);
    renderComments(post);
  };

  $('pm-close').onclick = () => { $('post-modal').classList.add('hidden'); activePostId = null; };

  const updatePostModalReacts = (post) => {
    qa('.pm-react-btn').forEach(btn => {
      const rType = btn.dataset.reaction;
      btn.querySelector('.pm-rc').innerText = post.reacts[rType];
      // Reset active state for simulation
      btn.classList.remove('active-react');
      
      btn.onclick = () => {
        post.reacts[rType]++;
        btn.querySelector('.pm-rc').innerText = post.reacts[rType];
        btn.classList.add('active-react');
        saveData();
        renderFeed(); // background update
        
        // Sim live notif if it's mine
        if(post.isMine) {
          triggerNotif(`Someone reacted to your story`);
        }
      };
    });
  };

  const renderComments = (post) => {
    const clist = $('pm-comments-list');
    clist.innerHTML = '';
    $('pm-comments-count').innerText = post.comments.length;
    
    post.comments.forEach(c => {
      clist.innerHTML += `
        <div class="pm-comment-item">
          <div class="pm-comment-av">${c.avatar || getAvatar()}</div>
          <div>
            <div class="pm-comment-id">${escapeHTML(c.userId || c.user)}</div>
            <div class="pm-comment-text">${escapeHTML(c.text)}</div>
          </div>
        </div>
      `;
    });
  };

  $('pm-comment-submit').onclick = () => {
    if(!activePostId) return;
    const input = $('pm-comment-input');
    const txt = input.value.trim();
    if(!txt) return;
    
    const post = S.posts.find(p => p.id === activePostId);
    if(post) {
      post.comments.push({
        userId: S.user.id,
        avatar: S.user.avatar,
        text: txt,
        date: new Date().toISOString()
      });
      input.value = '';
      renderComments(post);
      saveData();
      renderFeed();
    }
  };

  // ─── SEARCH ───────────────────────────────────────────────────────
  const setupSearch = () => {
    const input = $('search-input');
    const clear = $('search-clear');
    const res = $('search-results');
    
    const performSearch = () => {
      const q = input.value.toLowerCase().trim();
      if(!q) {
        clear.classList.add('hidden');
        res.innerHTML = '<p class="search-hint">Search for keywords, titles, or emotions</p>';
        return;
      }
      clear.classList.remove('hidden');
      
      const hits = S.posts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.body.toLowerCase().includes(q) ||
        p.emotion.toLowerCase().includes(q)
      );
      
      if(hits.length === 0) {
        res.innerHTML = '<p class="search-hint">No stories found.</p>';
        return;
      }
      
      res.innerHTML = '';
      hits.forEach(p => {
        const el = document.createElement('div');
        el.className = 'ig-post';
        el.style.border = '1px solid var(--border)';
        el.style.padding = '12px';
        el.style.borderRadius = 'var(--r-sm)';
        el.style.marginBottom = '10px';
        el.innerHTML = `
          <div class="ig-post-title" style="font-size:15px">${escapeHTML(p.title)}</div>
          <div class="ig-post-body" style="font-size:13px">${escapeHTML(p.body)}</div>
        `;
        el.onclick = () => openPostDetail(p);
        res.appendChild(el);
      });
    };
    
    input.addEventListener('input', performSearch);
    clear.onclick = () => { input.value = ''; performSearch(); };
  };

  // ─── RIGHT SIDEBAR & LIVE SIMULATION ──────────────────────────────
  const setupRightSidebar = () => {
    // Online count
    $('online-count').innerText = Math.floor(200 + Math.random()*500).toLocaleString();
    
    // Online avatars
    const avs = $('online-avatars');
    if (avs) {
      avs.innerHTML = '';
      for(let i=0; i<12; i++) {
        avs.innerHTML += `<div class="online-av">${AVATARS[i % AVATARS.length]}</div>`;
      }
    }
    
    // Trending
    const trendList = $('trending-list');
    const topics = ["Missing them", "First holidays alone", "The sudden end", "Dreams about them", "Deleting photos"];
    topics.forEach((t, i) => {
      trendList.innerHTML += `
        <div class="trending-item">
          <div class="trending-rank">${i+1}</div>
          <div class="trending-info">
            <div class="trending-title">${t}</div>
            <div class="trending-meta">${Math.floor(10 + Math.random()*50)} stories</div>
          </div>
        </div>
      `;
    });
    
    // Ambient Sound
    qa('.right-ambient-btn, .sound-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const s = e.currentTarget.dataset.sound;
        // update UI
        qa('.right-ambient-btn, .sound-opt').forEach(b => {
          b.classList.remove('active-amb', 'active-opt');
          if(b.dataset.sound === s) {
            if(b.classList.contains('right-ambient-btn')) b.classList.add('active-amb');
            if(b.classList.contains('sound-opt')) b.classList.add('active-opt');
          }
        });
        
        $('ambient-sound-btn').classList.toggle('active-sound', s !== 'off');
        $('ig-sound-label').innerText = s === 'off' ? 'No Sound' : s.charAt(0).toUpperCase() + s.slice(1);
        
        // Sim audio change
        showToast(`Ambient sound: ${s}`);
      });
    });
    
    // Live Feed Simulation
    setInterval(() => {
      pushLiveEvent();
    }, 8000 + Math.random()*5000);
  };
  
  const pushLiveEvent = () => {
    const feed = $('live-feed');
    const events = [
      `<strong>${generateId()}</strong> shared a new story.`,
      `<strong>${generateId()}</strong> reacted to a story.`,
      `<strong>${generateId()}</strong> joined the Music Room.`,
      `<strong>${generateId()}</strong> is writing...`,
      `<strong>Ghost</strong> shared a secret.`
    ];
    const ev = events[Math.floor(Math.random()*events.length)];
    
    const el = document.createElement('div');
    el.className = 'live-item';
    el.innerHTML = `
      <div class="live-item-dot" style="background: var(--${Math.random()>0.5?'accent':'green'})"></div>
      <div>
        <div class="live-item-text">${ev}</div>
        <div class="live-item-time">Just now</div>
      </div>
    `;
    
    feed.prepend(el);
    if(feed.children.length > 5) feed.lastChild.remove();
    
    // Randomly show top banner notif occasionally
    if(Math.random() > 0.7) showLiveNotif(ev);
  };

  const triggerNotif = (msg) => {
    S.notifs.unshift({ text: msg, date: new Date().toISOString() });
    const b = $('notif-badge');
    b.classList.remove('hidden');
    let cnt = parseInt(b.innerText) || 0;
    b.innerText = cnt + 1;
    renderNotifs();
  };

  const renderNotifs = () => {
    const list = $('notif-list');
    list.innerHTML = '';
    if(S.notifs.length === 0) {
      $('empty-notif').classList.remove('hidden');
      return;
    }
    $('empty-notif').classList.add('hidden');
    
    S.notifs.forEach(n => {
      list.innerHTML += `
        <div class="notif-item">
          <div class="notif-av"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <div>
            <div class="notif-text">${n.text}</div>
            <div class="notif-time">${timeAgo(n.date)}</div>
          </div>
        </div>
      `;
    });
  };

  // ─── STORIES BAR (IG STORIES) ─────────────────────────────────────
  const setupStoriesBar = () => {
    const bar = $('stories-bar');
    
    HIGHLIGHT_STORIES.forEach((st, idx) => {
      const el = document.createElement('div');
      el.className = 'story-bubble';
      el.innerHTML = `
        <div class="story-ring-wrap">
          <div class="story-avatar">${getAvatar()}</div>
        </div>
        <span class="story-name">${st.user.split('#')[0]}</span>
      `;
      el.onclick = () => openStoryViewer(idx);
      bar.appendChild(el);
    });
    
    $('your-story-bubble').onclick = () => {
      openWrite();
    };
  };

  let svActiveIdx = 0;
  let svTimer = null;
  const openStoryViewer = (idx) => {
    const v = $('story-viewer');
    v.classList.remove('hidden');
    renderStorySlide(idx);
  };
  
  const closeStoryViewer = () => {
    $('story-viewer').classList.add('hidden');
    clearTimeout(svTimer);
  };
  $('sv-close').onclick = closeStoryViewer;
  
  const renderStorySlide = (idx) => {
    clearTimeout(svTimer);
    if(idx < 0) { closeStoryViewer(); return; }
    if(idx >= HIGHLIGHT_STORIES.length) { closeStoryViewer(); return; }
    
    svActiveIdx = idx;
    const st = HIGHLIGHT_STORIES[idx];
    
    $('sv-avatar').innerHTML = getAvatar();
    $('sv-id').innerText = st.user;
    $('sv-time').innerText = st.time;
    $('sv-emotion').innerText = EMOTIONS[st.emotion].label;
    $('sv-emotion').className = `sv-emotion ${EMOTIONS[st.emotion].cls}`;
    $('sv-title').innerText = st.title;
    $('sv-body').innerText = st.body;
    
    // Setup progress bars
    const pWrap = $('sv-progress-wrap');
    pWrap.innerHTML = '';
    HIGHLIGHT_STORIES.forEach((_, i) => {
      const bar = document.createElement('div');
      bar.className = 'sv-progress-bar';
      const fill = document.createElement('div');
      fill.className = 'sv-progress-fill';
      if(i < idx) fill.style.width = '100%';
      bar.appendChild(fill);
      pWrap.appendChild(bar);
    });
    
    // Animate active progress
    const activeFill = pWrap.children[idx].querySelector('.sv-progress-fill');
    setTimeout(() => { activeFill.style.width = '100%'; }, 50);
    
    svTimer = setTimeout(() => {
      renderStorySlide(idx + 1);
    }, 5000);
  };
  
  $('sv-tap-prev').onclick = () => renderStorySlide(svActiveIdx - 1);
  $('sv-tap-next').onclick = () => renderStorySlide(svActiveIdx + 1);

  // ─── UNIVERSAL MULTI-SOURCE MUSIC & SOUND SANCTUARY ─────────────
  // 1. Direct DRM-Free Streaming Engine (HTML5 Audio + Visualizer)
  // 2. Spotify Official Embed Hub
  // 3. SoundCloud Official Embed Hub
  // 4. Procedural Ambient Sound Sanctuary (Web Audio Multi-Channel Mixer)
  // 5. YouTube IFrame Player & Data API

  // ═════════════════════════════════════════════════════════════════════
  // DIRECT AUDIO & LO-FI CATALOGUE (100% Legal & Free)
  // ═════════════════════════════════════════════════════════════════════
  const DIRECT_AUDIO_CATALOGUE = [
    {
      id: "da_1",
      title: "Someone You Loved (Acoustic Solo)",
      artist: "Lewis Capaldi Tribute (Piano & Cello)",
      mood: "heartbreak",
      moodLabel: "Heartbreak Ballad",
      duration: 204,
      icon: "💔",
      url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=sad-piano-ambient-112199.mp3",
      synthFreq: 220
    },
    {
      id: "da_2",
      title: "Midnight Lo-Fi (Rainy Memories)",
      artist: "Quiet Melodies (Chill Lo-Fi)",
      mood: "lofi",
      moodLabel: "Sad Lo-Fi & Rain",
      duration: 168,
      icon: "🌧️",
      url: "https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3",
      synthFreq: 261.63
    },
    {
      id: "da_3",
      title: "Weightless 432Hz Calm",
      artist: "Ambient Sanctuary",
      mood: "healing",
      moodLabel: "Healing & Meditation",
      duration: 252,
      icon: "🌿",
      url: "https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=meditation-432hz-122709.mp3",
      synthFreq: 432
    },
    {
      id: "da_4",
      title: "Cathartic Acoustic Release",
      artist: "Broken Strings Ensemble",
      mood: "letitout",
      moodLabel: "Cathartic Release",
      duration: 195,
      icon: "😤",
      url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=emotional-acoustic-guitar-109012.mp3",
      synthFreq: 174.61
    },
    {
      id: "da_5",
      title: "New Horizons & Sunset",
      artist: "Hope & Dawn Project",
      mood: "movingon",
      moodLabel: "Moving Forward",
      duration: 210,
      icon: "🚀",
      url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=inspiring-cinematic-ambient-116199.mp3",
      synthFreq: 293.66
    },
    {
      id: "da_6",
      title: "Nocturne for Broken Hearts",
      artist: "Gentle Piano Solo",
      mood: "heartbreak",
      moodLabel: "Heartbreak Mood",
      duration: 185,
      icon: "🌙",
      url: "https://cdn.pixabay.com/download/audio/2022/02/10/audio_fc84f22c1b.mp3?filename=sad-emotional-piano-110825.mp3",
      synthFreq: 246.94
    },
    {
      id: "da_7",
      title: "Warm Tea & Gentle Rain",
      artist: "Lo-Fi Healing Lab",
      mood: "lofi",
      moodLabel: "Lo-Fi & Piano",
      duration: 220,
      icon: "☕",
      url: "https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=chill-lofi-song-8444.mp3",
      synthFreq: 329.63
    }
  ];

  // ═════════════════════════════════════════════════════════════════════
  // DIRECT AUDIO PLAYER STATE & CONTROLS
  // ═════════════════════════════════════════════════════════════════════
  let directAudio = new Audio();
  let directCurrentTrack = DIRECT_AUDIO_CATALOGUE[0];
  let directPlayQueue = [...DIRECT_AUDIO_CATALOGUE];
  let directQueueIndex = 0;
  let directIsPlaying = false;
  let directSynthCtx = null;
  let directSynthTimer = null;

  const DIRECT_QUEUE_STORAGE_KEY = 'shattered_direct_queue_v2';

  const saveDirectQueueState = () => {
    try {
      localStorage.setItem(DIRECT_QUEUE_STORAGE_KEY, JSON.stringify({
        queue: directPlayQueue,
        index: directQueueIndex,
        currentTrack: directCurrentTrack,
        hasUserQueue: true
      }));
    } catch(e){}
  };

  const loadDirectQueueState = () => {
    try {
      const stored = localStorage.getItem(DIRECT_QUEUE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e){}
    return null;
  };

  const playDirectTrack = (track, autoPlay = true) => {
    if (!track) return;
    directCurrentTrack = track;
    directAudio.src = track.url;
    directAudio.preload = "auto";

    // Update DOM
    const titleEl = $('direct-track-title');
    const artistEl = $('direct-track-artist');
    const moodEl = $('direct-mood-tag');
    const curTimeEl = $('direct-time-cur');
    const totalTimeEl = $('direct-time-total');

    if (titleEl) titleEl.innerText = track.title;
    if (artistEl) artistEl.innerText = track.artist;
    if (moodEl) moodEl.innerText = track.moodLabel;
    if (curTimeEl) curTimeEl.innerText = "0:00";
    if (totalTimeEl) totalTimeEl.innerText = formatTime(track.duration);

    // Update Mini-Player
    updateMiniPlayerWithDirect(track);

    saveDirectQueueState();
    renderDirectQueue();
    updateDirectCatalogHighlight(track.id);

    if (autoPlay) {
      directAudio.play().then(() => {
        directIsPlaying = true;
        syncDirectPlayUI(true);
      }).catch(err => {
        console.warn("Direct audio playback error, falling back to ambient synth:", err);
        startDirectSynthFallback(track.synthFreq || 220);
        directIsPlaying = true;
        syncDirectPlayUI(true);
      });
    } else {
      directIsPlaying = false;
      syncDirectPlayUI(false);
    }
  };

  const syncDirectPlayUI = (playing) => {
    $('direct-play-icon')?.classList.toggle('hidden', playing);
    $('direct-pause-icon')?.classList.toggle('hidden', !playing);
    $('direct-art-disc')?.classList.toggle('spinning', playing);
    $('direct-eq-bars')?.classList.toggle('playing', playing);

    // Mini Player Sync
    $('mini-play-icon')?.classList.toggle('hidden', playing);
    $('mini-pause-icon')?.classList.toggle('hidden', !playing);
    $('mini-pulse-dot')?.classList.toggle('hidden', !playing);

    renderDirectQueue();
  };

  const updateMiniPlayerWithDirect = (track) => {
    const mini = $('yt-mini-player');
    const title = $('mini-player-title');
    const artist = $('mini-player-artist');
    const thumb = $('mini-player-thumb');
    const dot = $('mini-pulse-dot');

    if (mini) mini.classList.remove('hidden');
    if (title) title.innerText = track.title;
    if (artist) artist.innerText = track.artist;
    if (thumb) thumb.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='44' fill='%23d85c80'><rect width='44' height='44'/><circle cx='22' cy='22' r='12' fill='%23111'/><circle cx='22' cy='22' r='4' fill='%23d85c80'/></svg>";
    if (dot) dot.classList.toggle('hidden', !directIsPlaying);
  };

  const startDirectSynthFallback = (baseFreq = 220) => {
    stopDirectSynthFallback();
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!directSynthCtx) directSynthCtx = new AudioCtx();
    if (directSynthCtx.state === 'suspended') directSynthCtx.resume();

    const gain = directSynthCtx.createGain();
    gain.gain.value = 0.12;
    gain.connect(directSynthCtx.destination);

    const chords = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 0.75];
    let idx = 0;

    const playNote = () => {
      if (!directIsPlaying) return;
      try {
        const osc = directSynthCtx.createOscillator();
        const noteGain = directSynthCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(chords[idx % chords.length], directSynthCtx.currentTime);
        noteGain.gain.setValueAtTime(0, directSynthCtx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.2, directSynthCtx.currentTime + 0.5);
        noteGain.gain.exponentialRampToValueAtTime(0.001, directSynthCtx.currentTime + 3.0);
        osc.connect(noteGain);
        noteGain.connect(gain);
        osc.start();
        osc.stop(directSynthCtx.currentTime + 3.0);
        idx++;
      } catch(e){}
    };

    playNote();
    directSynthTimer = setInterval(playNote, 2400);
  };

  const stopDirectSynthFallback = () => {
    if (directSynthTimer) {
      clearInterval(directSynthTimer);
      directSynthTimer = null;
    }
  };

  const advanceDirectQueue = () => {
    if (directPlayQueue.length === 0) return;
    if (directQueueIndex + 1 < directPlayQueue.length) {
      directQueueIndex++;
      playDirectTrack(directPlayQueue[directQueueIndex], true);
    } else {
      directQueueIndex = 0;
      playDirectTrack(directPlayQueue[0], true);
    }
    saveDirectQueueState();
  };

  const previousDirectQueue = () => {
    if (directPlayQueue.length === 0) return;
    if (directQueueIndex > 0) {
      directQueueIndex--;
      playDirectTrack(directPlayQueue[directQueueIndex], true);
    } else {
      directQueueIndex = directPlayQueue.length - 1;
      playDirectTrack(directPlayQueue[directQueueIndex], true);
    }
    saveDirectQueueState();
  };

  const addDirectToQueue = (track) => {
    const exists = directPlayQueue.some(t => t.id === track.id);
    if (!exists) {
      directPlayQueue.push(track);
    }
    saveDirectQueueState();
    renderDirectQueue();
    showToast(`Added "${track.title}" to queue`);
  };

  const renderDirectQueue = () => {
    const cont = $('direct-queue-container');
    if (!cont) return;
    cont.innerHTML = '';

    if (directPlayQueue.length === 0) {
      cont.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p style="font-size:12px;color:var(--text3);">Queue is empty. Click "+ Queue" on any track.</p></div>`;
      return;
    }

    directPlayQueue.forEach((t, idx) => {
      const isCurrent = directCurrentTrack && directCurrentTrack.id === t.id;
      const el = document.createElement('div');
      el.className = `song-item ${isCurrent ? 'active-song' : ''}`;
      el.innerHTML = `
        <div class="song-num">${idx + 1}</div>
        <div class="song-info">
          <div class="song-title">${escapeHTML(t.title)}</div>
          <div class="song-artist">${escapeHTML(t.artist)}</div>
        </div>
        <div class="song-play">${isCurrent && directIsPlaying ? '❚❚' : '▶'}</div>
      `;
      el.onclick = () => {
        directQueueIndex = idx;
        playDirectTrack(t, true);
      };
      cont.appendChild(el);
    });
  };

  const renderDirectCatalog = (moodFilter = 'all') => {
    const grid = $('audio-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = moodFilter === 'all' 
      ? DIRECT_AUDIO_CATALOGUE 
      : DIRECT_AUDIO_CATALOGUE.filter(t => t.mood === moodFilter);

    list.forEach(t => {
      const isCurrent = directCurrentTrack && directCurrentTrack.id === t.id;
      const card = document.createElement('div');
      card.className = `audio-track-card ${isCurrent ? 'active-card' : ''}`;
      card.dataset.trackId = t.id;
      card.innerHTML = `
        <div class="atc-header">
          <span class="atc-icon">${t.icon}</span>
          <span class="atc-badge">${t.moodLabel}</span>
        </div>
        <h4 class="atc-title">${escapeHTML(t.title)}</h4>
        <span class="atc-artist">${escapeHTML(t.artist)}</span>
        <div class="atc-actions">
          <button class="atc-play-btn">
            <span>${isCurrent && directIsPlaying ? 'Playing' : 'Play Audio'}</span>
          </button>
          <button class="atc-queue-btn">+ Queue</button>
        </div>
      `;

      card.querySelector('.atc-play-btn').onclick = (e) => {
        e.stopPropagation();
        addDirectToQueue(t);
        directQueueIndex = directPlayQueue.findIndex(item => item.id === t.id);
        playDirectTrack(t, true);
      };

      card.querySelector('.atc-queue-btn').onclick = (e) => {
        e.stopPropagation();
        addDirectToQueue(t);
      };

      card.onclick = () => {
        addDirectToQueue(t);
        directQueueIndex = directPlayQueue.findIndex(item => item.id === t.id);
        playDirectTrack(t, true);
      };

      grid.appendChild(card);
    });
  };

  const updateDirectCatalogHighlight = (activeId) => {
    qa('.audio-track-card').forEach(card => {
      card.classList.toggle('active-card', card.dataset.trackId === activeId);
    });
  };

  // ═════════════════════════════════════════════════════════════════════
  // PROCEDURAL AMBIENT SOUND SANCTUARY MIXER (Web Audio API)
  // ═════════════════════════════════════════════════════════════════════
  let ambientAudioCtx = null;
  let ambientIsActive = false;
  let ambientNodes = {
    rainGain: null,
    oceanGain: null,
    fireGain: null,
    binauralGain: null,
    binauralOsc: null
  };

  const initAmbientMixer = () => {
    if (ambientAudioCtx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ambientAudioCtx = new AudioCtx();

    // 1. Rain Generator (Filtered Noise Buffer)
    const bufferSize = ambientAudioCtx.sampleRate * 2;
    const noiseBuffer = ambientAudioCtx.createBuffer(1, bufferSize, ambientAudioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const rainSource = ambientAudioCtx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;
    const rainFilter = ambientAudioCtx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 1000;
    ambientNodes.rainGain = ambientAudioCtx.createGain();
    ambientNodes.rainGain.gain.value = 0.06;
    rainSource.connect(rainFilter);
    rainFilter.connect(ambientNodes.rainGain);
    ambientNodes.rainGain.connect(ambientAudioCtx.destination);
    rainSource.start();

    // 2. Ocean Generator (Modulated Noise)
    const oceanSource = ambientAudioCtx.createBufferSource();
    oceanSource.buffer = noiseBuffer;
    oceanSource.loop = true;
    const oceanFilter = ambientAudioCtx.createBiquadFilter();
    oceanFilter.type = 'bandpass';
    oceanFilter.frequency.value = 400;
    ambientNodes.oceanGain = ambientAudioCtx.createGain();
    ambientNodes.oceanGain.gain.value = 0.03;
    oceanSource.connect(oceanFilter);
    oceanFilter.connect(ambientNodes.oceanGain);
    ambientNodes.oceanGain.connect(ambientAudioCtx.destination);
    oceanSource.start();

    // 3. Fireplace Crackle Generator
    const fireSource = ambientAudioCtx.createBufferSource();
    fireSource.buffer = noiseBuffer;
    fireSource.loop = true;
    const fireFilter = ambientAudioCtx.createBiquadFilter();
    fireFilter.type = 'highpass';
    fireFilter.frequency.value = 2500;
    ambientNodes.fireGain = ambientAudioCtx.createGain();
    ambientNodes.fireGain.gain.value = 0.04;
    fireSource.connect(fireFilter);
    fireFilter.connect(ambientNodes.fireGain);
    ambientNodes.fireGain.connect(ambientAudioCtx.destination);
    fireSource.start();

    // 4. 432Hz Binaural Tone
    ambientNodes.binauralOsc = ambientAudioCtx.createOscillator();
    ambientNodes.binauralOsc.type = 'sine';
    ambientNodes.binauralOsc.frequency.value = 432;
    ambientNodes.binauralGain = ambientAudioCtx.createGain();
    ambientNodes.binauralGain.gain.value = 0.05;
    ambientNodes.binauralOsc.connect(ambientNodes.binauralGain);
    ambientNodes.binauralGain.connect(ambientAudioCtx.destination);
    ambientNodes.binauralOsc.start();
  };

  const toggleAmbientMixer = () => {
    initAmbientMixer();
    if (!ambientAudioCtx) return;

    if (ambientIsActive) {
      ambientAudioCtx.suspend();
      ambientIsActive = false;
      const btnText = $('ambient-btn-text');
      if (btnText) btnText.innerText = "Start Ambient Sound";
      showToast("Ambient sound paused");
    } else {
      ambientAudioCtx.resume();
      ambientIsActive = true;
      const btnText = $('ambient-btn-text');
      if (btnText) btnText.innerText = "Stop Ambient Sound";
      showToast("Ambient Sound Sanctuary playing 🌧️");
    }
  };

  // ═════════════════════════════════════════════════════════════════════
  // YOUTUBE DATA & IFRAME PLAYER ENGINE
  // ═════════════════════════════════════════════════════════════════════
  const YT_CACHE_KEY = 'shattered_yt_data_v3';
  const YT_CACHE_TTL_MS = 60 * 60 * 1000;
  const YT_QUEUE_STORAGE_KEY = 'shattered_yt_queue_v3';

  let ytPlayer = null;
  let ytReady = false;
  let ytSearchDebounceTimer = null;
  let ytCurrentVideo = null;
  let ytPlayQueue = [];
  let ytQueueIndex = -1;
  let ytIsPlaying = false;
  let ytProgressTimer = null;
  let ytDuration = 0;
  let ytCurrentTime = 0;
  let ytUsingFallback = false;
  let pendingPlayVideo = null;
  let pendingAutoPlay = false;

  const CURATED_MUSIC_VIDEOS = {
    heartbreak: [
      { id:"kQ8n19aWp4c", title:"drivers license", channelTitle:"Olivia Rodrigo", thumbnail:"https://img.youtube.com/vi/kQ8n19aWp4c/hqdefault.jpg" },
      { id:"bCuhuePlP8o", title:"Someone You Loved", channelTitle:"Lewis Capaldi", thumbnail:"https://img.youtube.com/vi/bCuhuePlP8o/hqdefault.jpg" },
      { id:"zlJDTxahav0", title:"Lose You To Love Me", channelTitle:"Selena Gomez", thumbnail:"https://img.youtube.com/vi/zlJDTxahav0/hqdefault.jpg" },
      { id:"FvOpPeKSf_4", title:"Glimpse of Us", channelTitle:"Joji", thumbnail:"https://img.youtube.com/vi/FvOpPeKSf_4/hqdefault.jpg" },
      { id:"V1Pl8CzNzCw", title:"traitor", channelTitle:"Olivia Rodrigo", thumbnail:"https://img.youtube.com/vi/V1Pl8CzNzCw/hqdefault.jpg" },
      { id:"hLQl3WQQoQ0", title:"Someone Like You", channelTitle:"Adele", thumbnail:"https://img.youtube.com/vi/hLQl3WQQoQ0/hqdefault.jpg" }
    ],
    healing: [
      { id:"k4V3Mo61fJM", title:"Fix You", channelTitle:"Coldplay", thumbnail:"https://img.youtube.com/vi/k4V3Mo61fJM/hqdefault.jpg" },
      { id:"iWZmdoY1aTE", title:"Happier", channelTitle:"Ed Sheeran", thumbnail:"https://img.youtube.com/vi/iWZmdoY1aTE/hqdefault.jpg" },
      { id:"UfcAVejslrU", title:"Weightless (Ambient Therapy)", channelTitle:"Marconi Union", thumbnail:"https://img.youtube.com/vi/UfcAVejslrU/hqdefault.jpg" },
      { id:"Ar48yzqn1G0", title:"Sparks", channelTitle:"Coldplay", thumbnail:"https://img.youtube.com/vi/Ar48yzqn1G0/hqdefault.jpg" },
      { id:"RBumgq5yVrA", title:"Let Her Go", channelTitle:"Passenger", thumbnail:"https://img.youtube.com/vi/RBumgq5yVrA/hqdefault.jpg" }
    ],
    lofi: [
      { id:"jfKfPfyJRdk", title:"lofi hip hop radio - beats to relax/study to", channelTitle:"Lofi Girl", thumbnail:"https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg" },
      { id:"5qap5aO4i9A", title:"Lofi Hip Hop - Chill Beats for Broken Hearts", channelTitle:"ChilledCow", thumbnail:"https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg" },
      { id:"lTRiuFIWV54", title:"Sad Piano & Rain - Midnight Memories", channelTitle:"Quiet Melodies", thumbnail:"https://img.youtube.com/vi/lTRiuFIWV54/hqdefault.jpg" },
      { id:"DWcJFNfaw9c", title:"Deep Rain Sleep & Solitude", channelTitle:"Ambient World", thumbnail:"https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg" }
    ],
    letitout: [
      { id:"gNi_6U5Pm_o", title:"good 4 u", channelTitle:"Olivia Rodrigo", thumbnail:"https://img.youtube.com/vi/gNi_6U5Pm_o/hqdefault.jpg" },
      { id:"tollGa3S0o8", title:"All Too Well (Sad Girl Autumn)", channelTitle:"Taylor Swift", thumbnail:"https://img.youtube.com/vi/tollGa3S0o8/hqdefault.jpg" },
      { id:"5GJWxDKyk3A", title:"Happier Than Ever", channelTitle:"Billie Eilish", thumbnail:"https://img.youtube.com/vi/5GJWxDKyk3A/hqdefault.jpg" },
      { id:"0yW7w8F2TVA", title:"Before He Cheats", channelTitle:"Carrie Underwood", thumbnail:"https://img.youtube.com/vi/0yW7w8F2TVA/hqdefault.jpg" }
    ],
    movingon: [
      { id:"gl1aHhXnN1k", title:"thank u, next", channelTitle:"Ariana Grande", thumbnail:"https://img.youtube.com/vi/gl1aHhXnN1k/hqdefault.jpg" },
      { id:"G7KNmW9a75Y", title:"Flowers", channelTitle:"Miley Cyrus", thumbnail:"https://img.youtube.com/vi/G7KNmW9a75Y/hqdefault.jpg" },
      { id:"YaEG2aWJnZ8", title:"Unstoppable", channelTitle:"Sia", thumbnail:"https://img.youtube.com/vi/YaEG2aWJnZ8/hqdefault.jpg" },
      { id:"k2qgadSvNyU", title:"New Rules", channelTitle:"Dua Lipa", thumbnail:"https://img.youtube.com/vi/k2qgadSvNyU/hqdefault.jpg" }
    ]
  };

  const saveQueueState = () => {
    try {
      localStorage.setItem(YT_QUEUE_STORAGE_KEY, JSON.stringify({
        queue: ytPlayQueue,
        index: ytQueueIndex,
        currentVideo: ytCurrentVideo,
        hasUserQueue: true
      }));
    } catch(e) {}
  };

  const loadQueueState = () => {
    try {
      const stored = localStorage.getItem(YT_QUEUE_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return null;
  };

  const getCachedData = (key) => {
    try {
      const item = localStorage.getItem(`${YT_CACHE_KEY}_${key}`);
      if (item) {
        const parsed = JSON.parse(item);
        if (Date.now() - parsed.timestamp < YT_CACHE_TTL_MS) return parsed.data;
      }
    } catch(e){}
    return null;
  };

  const setCachedData = (key, data) => {
    try {
      localStorage.setItem(`${YT_CACHE_KEY}_${key}`, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    } catch(e){}
  };

  const getCuratedFallback = (query) => {
    const q = query.toLowerCase();
    for (const [genre, list] of Object.entries(CURATED_MUSIC_VIDEOS)) {
      if (q.includes(genre)) return list;
    }
    const all = Object.values(CURATED_MUSIC_VIDEOS).flat();
    const matched = all.filter(v => v.title.toLowerCase().includes(q) || v.channelTitle.toLowerCase().includes(q));
    return matched.length > 0 ? matched : CURATED_MUSIC_VIDEOS.heartbreak;
  };

  const searchYouTubeDataAPI = async (query) => {
    const cleanQ = query.trim().toLowerCase();
    const cacheKey = `search_${cleanQ}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    renderVideoSkeletons();

    try {
      const response = await fetch(`/api/youtube-search?q=${encodeURIComponent(query)}&maxResults=12`);
      if (response.ok) {
        const json = await response.json();
        if (json.items && json.items.length > 0) {
          setCachedData(cacheKey, json.items);
          return json.items;
        }
      }
    } catch(err) {
      console.warn("YouTube proxy fetch error, using curated data:", err);
    }

    const fallback = getCuratedFallback(query);
    setCachedData(cacheKey, fallback);
    return fallback;
  };

  const loadYouTubeAPI = () => {
    if (window.YT && window.YT.Player) {
      ytReady = true;
      initYTPlayer();
      return;
    }
    window.onYouTubeIframeAPIReady = () => {
      ytReady = true;
      initYTPlayer();
    };
    if (!document.getElementById('yt-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-script';
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  };

  const getPlayerOrigin = () => {
    try {
      if (window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
        return window.location.origin;
      }
    } catch(e) {}
    return undefined;
  };

  const initYTPlayer = () => {
    if (ytPlayer) return;
    const embedTarget = $('yt-player-embed');
    if (!embedTarget || !window.YT || !window.YT.Player) return;

    const initialVideo = ytCurrentVideo || CURATED_MUSIC_VIDEOS.heartbreak[0];
    ytCurrentVideo = initialVideo;

    const playerVars = {
      'playsinline': 1,
      'autoplay': 0,
      'rel': 0,
      'modestbranding': 1,
      'enablejsapi': 1
    };
    const origin = getPlayerOrigin();
    if (origin) playerVars.origin = origin;

    try {
      ytPlayer = new window.YT.Player('yt-player-embed', {
        height: '100%',
        width: '100%',
        videoId: initialVideo.id,
        playerVars: playerVars,
        events: {
          'onReady': onYTReady,
          'onStateChange': onYTStateChange,
          'onError': onYTError
        }
      });
    } catch(err) {
      console.warn("Failed to initialize YT.Player:", err);
    }
  };

  const onYTReady = () => {
    ytReady = true;
    if (pendingPlayVideo) {
      const v = pendingPlayVideo;
      const auto = pendingAutoPlay;
      pendingPlayVideo = null;
      pendingAutoPlay = false;
      playVideoItem(v, auto);
    }
  };

  const onYTStateChange = (event) => {
    if (!window.YT) return;
    if (event.data === window.YT.PlayerState.PLAYING) {
      ytIsPlaying = true;
      ytUsingFallback = false;
      $('yt-fallback-notice')?.classList.add('hidden');
      if (ytPlayer && ytPlayer.getDuration) {
        const d = ytPlayer.getDuration();
        if (d > 0) ytDuration = Math.floor(d);
      }
      syncPlayUI(true);
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      ytIsPlaying = false;
      syncPlayUI(false);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      ytIsPlaying = false;
      syncPlayUI(false);
      advanceQueue();
    }
  };

  const onYTError = (event) => {
    console.warn("YouTube Player Error (101/150/153):", event.data);
    if (ytCurrentVideo) {
      const restLink = $('yt-restricted-link');
      if (restLink) restLink.href = `https://www.youtube.com/watch?v=${ytCurrentVideo.id}`;
      $('yt-fallback-notice')?.classList.remove('hidden');
    }
    ytUsingFallback = true;
  };

  const playVideoItem = (video, autoStart = true) => {
    if (!video || !video.id) return;
    ytCurrentVideo = video;
    $('yt-fallback-notice')?.classList.add('hidden');

    const titleEl = $('player-track-title');
    const artistEl = $('player-track-artist');
    const extLink = $('player-ext-link');

    if (titleEl) titleEl.innerText = video.title;
    if (artistEl) artistEl.innerText = video.channelTitle;
    if (extLink) {
      extLink.href = `https://www.youtube.com/watch?v=${video.id}`;
      extLink.title = `Watch ${video.title} on YouTube`;
    }

    saveQueueState();

    if (!ytReady || !ytPlayer || !ytPlayer.loadVideoById) {
      pendingPlayVideo = video;
      pendingAutoPlay = autoStart;
      if (!ytPlayer && window.YT && window.YT.Player) initYTPlayer();
      renderQueue();
      return;
    }

    try {
      if (autoStart) {
        ytPlayer.loadVideoById(video.id);
        ytIsPlaying = true;
        syncPlayUI(true);
      } else {
        ytPlayer.cueVideoById(video.id);
        ytIsPlaying = false;
        syncPlayUI(false);
      }
    } catch(e) {
      console.warn("Error loading video:", e);
    }

    renderQueue();
  };

  const addToQueue = (video) => {
    const exists = ytPlayQueue.some(v => v.id === video.id);
    if (!exists) ytPlayQueue.push(video);
    saveQueueState();
    updateQueueBadge();
    renderQueue();
    showToast(`Added "${video.title.slice(0, 24)}..." to YouTube queue`);
  };

  const advanceQueue = () => {
    if (ytPlayQueue.length === 0) return;
    ytQueueIndex = (ytQueueIndex + 1) % ytPlayQueue.length;
    playVideoItem(ytPlayQueue[ytQueueIndex], true);
    saveQueueState();
  };

  const previousQueue = () => {
    if (ytPlayQueue.length === 0) return;
    ytQueueIndex = (ytQueueIndex - 1 + ytPlayQueue.length) % ytPlayQueue.length;
    playVideoItem(ytPlayQueue[ytQueueIndex], true);
    saveQueueState();
  };

  const clearQueue = () => {
    ytPlayQueue = [];
    ytQueueIndex = -1;
    saveQueueState();
    updateQueueBadge();
    renderQueue();
    showToast("YouTube queue cleared");
  };

  const renderQueue = () => {
    const cont = $('songs-container');
    if (!cont) return;
    cont.innerHTML = '';
    if (ytPlayQueue.length === 0) {
      cont.innerHTML = `<div class="empty-state" style="padding:20px 0;"><p style="font-size:12px;color:var(--text3);">Queue is empty.</p></div>`;
      return;
    }
    ytPlayQueue.forEach((v, idx) => {
      const isCurrent = ytCurrentVideo && ytCurrentVideo.id === v.id;
      const el = document.createElement('div');
      el.className = `song-item ${isCurrent ? 'active-song' : ''}`;
      el.innerHTML = `
        <div class="song-num">${idx + 1}</div>
        <div class="song-info">
          <div class="song-title">${escapeHTML(v.title)}</div>
          <div class="song-artist">${escapeHTML(v.channelTitle)}</div>
        </div>
        <div class="song-play">${isCurrent && ytIsPlaying ? '❚❚' : '▶'}</div>
      `;
      el.onclick = () => {
        ytQueueIndex = idx;
        playVideoItem(v, true);
      };
      cont.appendChild(el);
    });
  };

  const updateQueueBadge = () => {
    const badge = $('queue-count-badge');
    if (badge) badge.innerText = ytPlayQueue.length;
  };

  const renderVideoGrid = (videos) => {
    const grid = $('yt-video-grid');
    const empty = $('yt-empty-state');
    if (!grid) return;
    grid.innerHTML = '';
    if (!videos || videos.length === 0) {
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    videos.forEach(v => {
      const card = document.createElement('div');
      card.className = 'yt-video-card';
      card.dataset.videoId = v.id;
      card.innerHTML = `
        <div class="yt-thumb-wrap" title="Play ${escapeHTML(v.title)}">
          <img class="yt-thumb-img" src="${v.thumbnail || `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}" alt="${escapeHTML(v.title)}" loading="lazy" />
          <div class="yt-card-play-overlay">
            <div class="yt-card-play-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            </div>
          </div>
        </div>
        <div class="yt-card-body">
          <h4 class="yt-card-title" title="${escapeHTML(v.title)}">${escapeHTML(v.title)}</h4>
          <span class="yt-card-channel">${escapeHTML(v.channelTitle)}</span>
          <div class="yt-card-actions">
            <button class="yt-card-queue-btn" title="Add to Play Queue">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              <span>Queue</span>
            </button>
            <a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer" class="player-ext-link" style="padding:3px 8px;font-size:10px;">
              YouTube ↗
            </a>
          </div>
        </div>
      `;

      card.querySelector('.yt-thumb-wrap').onclick = () => {
        addToQueue(v);
        ytQueueIndex = ytPlayQueue.findIndex(item => item.id === v.id);
        playVideoItem(v, true);
      };
      card.querySelector('.yt-card-title').onclick = () => {
        addToQueue(v);
        ytQueueIndex = ytPlayQueue.findIndex(item => item.id === v.id);
        playVideoItem(v, true);
      };
      card.querySelector('.yt-card-queue-btn').onclick = (e) => {
        e.stopPropagation();
        addToQueue(v);
      };
      grid.appendChild(card);
    });
  };

  const renderVideoSkeletons = () => {
    const grid = $('yt-video-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      grid.innerHTML += `
        <div class="yt-skeleton-card">
          <div class="yt-skeleton-thumb"></div>
          <div class="yt-skeleton-body">
            <div class="yt-skeleton-line w-80"></div>
            <div class="yt-skeleton-line w-50"></div>
          </div>
        </div>
      `;
    }
  };

  const syncPlayUI = (playing) => {
    $('play-icon')?.classList.toggle('hidden', playing);
    $('pause-icon')?.classList.toggle('hidden', !playing);
    renderQueue();
  };

  // ═════════════════════════════════════════════════════════════════════
  // SETUP MUSIC ROOM CONTROLLER
  // ═════════════════════════════════════════════════════════════════════
  const setupMusic = () => {
    // 1. Source Tab Switcher
    const switchMusicSource = (sourceKey) => {
      qa('.source-tab-btn').forEach(btn => {
        btn.classList.toggle('active-source', btn.dataset.source === sourceKey);
      });
      qa('.source-pane').forEach(pane => {
        pane.classList.toggle('hidden', pane.id !== `pane-source-${sourceKey}`);
        pane.classList.toggle('active-source-pane', pane.id === `pane-source-${sourceKey}`);
      });
      try { localStorage.setItem('shattered_music_source', sourceKey); } catch(e){}
    };

    qa('.source-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchMusicSource(btn.dataset.source);
      });
    });

    const savedSource = localStorage.getItem('shattered_music_source') || 'direct';
    switchMusicSource(savedSource);

    // 2. Direct Audio Engine Setup
    directAudio.addEventListener('timeupdate', () => {
      const curEl = $('direct-time-cur');
      const totalEl = $('direct-time-total');
      const fillEl = $('direct-progress-fill');
      const wrapEl = $('direct-progress-wrap');

      if (curEl) curEl.innerText = formatTime(Math.floor(directAudio.currentTime));
      if (totalEl && directAudio.duration) {
        totalEl.innerText = formatTime(Math.floor(directAudio.duration));
      }
      if (fillEl && directAudio.duration > 0) {
        const pct = (directAudio.currentTime / directAudio.duration) * 100;
        fillEl.style.width = `${pct}%`;
        if (wrapEl) wrapEl.setAttribute('aria-valuenow', Math.round(pct));
      }
    });

    directAudio.addEventListener('ended', advanceDirectQueue);

    $('direct-play-btn')?.addEventListener('click', () => {
      if (directIsPlaying) {
        directAudio.pause();
        stopDirectSynthFallback();
        directIsPlaying = false;
        syncDirectPlayUI(false);
      } else {
        if (!directCurrentTrack) directCurrentTrack = DIRECT_AUDIO_CATALOGUE[0];
        playDirectTrack(directCurrentTrack, true);
      }
    });

    $('direct-next-btn')?.addEventListener('click', advanceDirectQueue);
    $('direct-prev-btn')?.addEventListener('click', previousDirectQueue);
    $('direct-clear-queue')?.addEventListener('click', () => {
      directPlayQueue = [];
      directQueueIndex = -1;
      saveDirectQueueState();
      renderDirectQueue();
      showToast("Direct audio queue cleared");
    });

    const directProgWrap = $('direct-progress-wrap');
    if (directProgWrap) {
      directProgWrap.onclick = (e) => {
        const rect = directProgWrap.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, clickX / rect.width));
        if (directAudio.duration) {
          directAudio.currentTime = pct * directAudio.duration;
        }
      };
    }

    const directVolSlider = $('direct-volume');
    if (directVolSlider) {
      directVolSlider.oninput = () => {
        directAudio.volume = parseInt(directVolSlider.value) / 100;
      };
    }

    // Direct Mood Filter Chips
    qa('.direct-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        qa('.direct-chip').forEach(c => c.classList.remove('active-chip'));
        chip.classList.add('active-chip');
        renderDirectCatalog(chip.dataset.mood);
      });
    });

    // Initialize Direct Audio Queue
    const savedDirectState = loadDirectQueueState();
    if (savedDirectState && savedDirectState.hasUserQueue) {
      directPlayQueue = Array.isArray(savedDirectState.queue) ? savedDirectState.queue : [];
      directQueueIndex = typeof savedDirectState.index === 'number' ? savedDirectState.index : 0;
      directCurrentTrack = savedDirectState.currentTrack || directPlayQueue[directQueueIndex] || DIRECT_AUDIO_CATALOGUE[0];
    } else {
      directPlayQueue = [...DIRECT_AUDIO_CATALOGUE];
      directQueueIndex = 0;
      directCurrentTrack = directPlayQueue[0];
      saveDirectQueueState();
    }
    renderDirectQueue();
    renderDirectCatalog('heartbreak');
    playDirectTrack(directCurrentTrack, false);

    // 3. Spotify Chip Selector
    qa('.spotify-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        qa('.spotify-chip').forEach(c => c.classList.remove('active-spotify-chip'));
        chip.classList.add('active-spotify-chip');
        const uri = chip.dataset.spotifyUri;
        const iframe = $('spotify-iframe');
        if (iframe && uri) {
          iframe.src = `https://open.spotify.com/embed/${uri}?utm_source=generator&theme=0`;
        }
      });
    });

    // 4. SoundCloud Chip Selector
    qa('.sc-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        qa('.sc-chip').forEach(c => c.classList.remove('active-sc-chip'));
        chip.classList.add('active-sc-chip');
        const scUrl = chip.dataset.scUrl;
        const iframe = $('soundcloud-iframe');
        if (iframe && scUrl) {
          iframe.src = `https://w.soundcloud.com/player/?url=${scUrl}&color=%23d85c80&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
        }
      });
    });

    // 5. Ambient Sanctuary Sound Mixer Controls
    $('ambient-master-toggle')?.addEventListener('click', toggleAmbientMixer);

    const wireAmbientSlider = (sliderId, valId, nodeKey, gainMultiplier = 0.1) => {
      const slider = $(sliderId);
      const valEl = $(valId);
      if (slider) {
        slider.oninput = () => {
          const pct = parseInt(slider.value);
          if (valEl) valEl.innerText = `${pct}%`;
          if (ambientNodes[nodeKey] && ambientAudioCtx) {
            ambientNodes[nodeKey].gain.value = (pct / 100) * gainMultiplier;
          }
        };
      }
    };
    wireAmbientSlider('slider-rain', 'val-rain', 'rainGain', 0.1);
    wireAmbientSlider('slider-ocean', 'val-ocean', 'oceanGain', 0.08);
    wireAmbientSlider('slider-fire', 'val-fire', 'fireGain', 0.08);
    wireAmbientSlider('slider-binaural', 'val-binaural', 'binauralGain', 0.1);

    // 6. YouTube Player Engine Initialization
    loadYouTubeAPI();

    $('player-play-toggle')?.addEventListener('click', () => {
      if (ytIsPlaying) {
        if (ytPlayer && ytPlayer.pauseVideo) try { ytPlayer.pauseVideo(); } catch(e){}
        ytIsPlaying = false;
        syncPlayUI(false);
      } else {
        if (!ytCurrentVideo) ytCurrentVideo = CURATED_MUSIC_VIDEOS.heartbreak[0];
        playVideoItem(ytCurrentVideo, true);
      }
    });

    $('player-next')?.addEventListener('click', advanceQueue);
    $('player-prev')?.addEventListener('click', previousQueue);
    $('yt-skip-btn')?.addEventListener('click', advanceQueue);
    $('clear-queue-btn')?.addEventListener('click', clearQueue);

    // Mini-Player Global Controls
    $('mini-play-btn')?.addEventListener('click', () => {
      if (directIsPlaying) {
        directAudio.pause();
        stopDirectSynthFallback();
        directIsPlaying = false;
        syncDirectPlayUI(false);
      } else {
        playDirectTrack(directCurrentTrack, true);
      }
    });
    $('mini-next-btn')?.addEventListener('click', advanceDirectQueue);
    $('mini-prev-btn')?.addEventListener('click', previousDirectQueue);
    $('mini-player-expand')?.addEventListener('click', () => {
      switchPane('music');
      const card = $('direct-player-card') || $('yt-main-player-card');
      if (card) card.scrollIntoView({ behavior: 'smooth' });
    });

    // YouTube Genre Filter Chips
    qa('.yt-genre-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        qa('.yt-genre-chip').forEach(c => c.classList.remove('active-genre'));
        chip.classList.add('active-genre');
        const genre = chip.dataset.genre;
        const titleEl = $('yt-browse-title');
        if (titleEl) titleEl.innerText = `${chip.innerText} YouTube Videos`;
        const results = await searchYouTubeDataAPI(`${genre} music heartbreak emotional`);
        renderVideoGrid(results);
      });
    });

    // YouTube Search
    const searchInput = $('yt-search-input');
    const searchClear = $('yt-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const q = searchInput.value.trim();
        searchClear?.classList.toggle('hidden', !q);
        clearTimeout(ytSearchDebounceTimer);
        ytSearchDebounceTimer = setTimeout(async () => {
          if (!q) {
            const initialList = await searchYouTubeDataAPI('heartbreak');
            renderVideoGrid(initialList);
            return;
          }
          const results = await searchYouTubeDataAPI(q);
          renderVideoGrid(results);
          const titleEl = $('yt-browse-title');
          if (titleEl) titleEl.innerText = `Results for "${q}"`;
        }, 350);
      });
    }

    if (searchClear) {
      searchClear.addEventListener('click', async () => {
        if (searchInput) searchInput.value = '';
        searchClear.classList.add('hidden');
        const initialList = await searchYouTubeDataAPI('heartbreak');
        renderVideoGrid(initialList);
      });
    }

    // Initialize YouTube Queue
    const savedYTState = loadQueueState();
    if (savedYTState && savedYTState.hasUserQueue) {
      ytPlayQueue = Array.isArray(savedYTState.queue) ? savedYTState.queue : [];
      ytQueueIndex = typeof savedYTState.index === 'number' ? savedYTState.index : 0;
      ytCurrentVideo = savedYTState.currentVideo || (ytPlayQueue[ytQueueIndex] || CURATED_MUSIC_VIDEOS.heartbreak[0]);
      updateQueueBadge();
      renderQueue();
    } else {
      ytPlayQueue = [...CURATED_MUSIC_VIDEOS.heartbreak.slice(0, 4)];
      ytQueueIndex = 0;
      ytCurrentVideo = ytPlayQueue[0];
      saveQueueState();
      updateQueueBadge();
      renderQueue();
    }

    searchYouTubeDataAPI('heartbreak').then(list => {
      renderVideoGrid(list);
    });
  };

  // ─── HEALING HUB ──────────────────────────────────────────────────
  const setupHealing = () => {
    const refreshQ = () => {
      const q = HEALING_QUOTES[Math.floor(Math.random()*HEALING_QUOTES.length)];
      $('heal-quote-text').innerText = q.text;
      $('heal-quote-author').innerHTML = `&mdash; ${q.author}`;
    };
    $('hq-refresh-btn').onclick = refreshQ;
    refreshQ();
    
    const wg = $('wellness-grid');
    HEALING_TIPS.forEach(t => {
      wg.innerHTML += `
        <div class="wellness-card">
          <div class="wellness-card-icon">${t.icon}</div>
          <div class="wellness-card-title">${t.title}</div>
          <div class="wellness-card-text">${t.text}</div>
        </div>
      `;
    });
    
    // Mood tracker
    qa('.mood-btn').forEach(btn => {
      btn.onclick = (e) => {
        qa('.mood-btn').forEach(b => b.classList.remove('selected-mood'));
        btn.classList.add('selected-mood');
        
        S.user.moods.push({
          val: parseInt(btn.dataset.mood),
          date: new Date().toISOString()
        });
        saveData();
        renderChart();
        showToast("Mood logged.");
      };
    });
    
    // Setup Chart
    renderChart();
  };
  
  const renderChart = () => {
    const canvas = $('mood-chart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0,0,w,h);
    
    // Grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    for(let i=0; i<5; i++) {
      const y = (h/4) * i;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    
    const moods = S.user.moods.slice(-7); // Last 7
    if(moods.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '13px Inter';
      ctx.textAlign = 'center';
      ctx.fillText("Log your mood to see trends", w/2, h/2);
      return;
    }
    
    const stepX = w / Math.max(moods.length - 1, 1);
    
    // Line
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(200,90,124, 0.8)'; // accent
    ctx.lineWidth = 3;
    
    const points = [];
    moods.forEach((m, i) => {
      const x = i === 0 && moods.length === 1 ? w/2 : i * stepX;
      // Map 1-9 to h-0
      const y = h - ((m.val - 1) / 8) * h;
      // clamp y so dots don't clip
      const cy = Math.max(6, Math.min(h-6, y));
      if(i===0) ctx.moveTo(x, cy);
      else ctx.lineTo(x, cy);
      points.push({x, y: cy});
    });
    ctx.stroke();
    
    // Fill
    if(points.length > 1) {
      ctx.lineTo(points[points.length-1].x, h);
      ctx.lineTo(points[0].x, h);
      ctx.fillStyle = 'rgba(200,90,124, 0.1)';
      ctx.fill();
    }
    
    // Dots
    ctx.fillStyle = '#fff';
    points.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
    });
    
    // Labels
    const lCon = $('chart-labels');
    lCon.innerHTML = '';
    moods.forEach(m => {
      const d = new Date(m.date);
      lCon.innerHTML += `<span class="chart-label">${d.toLocaleDateString('en-US',{weekday:'short'})}</span>`;
    });
  };

  // ─── DIARY ────────────────────────────────────────────────────────
  const setupDiary = () => {
    $('submit-diary-btn').onclick = () => {
      const title = $('diary-title').value.trim();
      const body = $('diary-body').value.trim();
      if(!body) return alert("Write something first.");
      
      S.diary.unshift({
        id: 'd_'+Date.now(),
        title: title || 'Untitled Entry',
        body: body,
        date: new Date().toISOString()
      });
      
      saveData();
      $('diary-title').value = '';
      $('diary-body').value = '';
      renderDiary();
      showToast("Saved to diary.");
    };
    
    renderDiary();
    renderMyStories();
  };
  
  const renderDiary = () => {
    const list = $('diary-list');
    list.innerHTML = '';
    if(S.diary.length === 0) {
      $('empty-diary').classList.remove('hidden');
      return;
    }
    $('empty-diary').classList.add('hidden');
    
    S.diary.forEach(d => {
      const el = document.createElement('div');
      el.className = 'diary-card';
      el.innerHTML = `
        <div class="diary-card-head">
          <div class="diary-card-title">${escapeHTML(d.title)}</div>
          <div class="diary-card-date">${formatDate(d.date)}</div>
        </div>
        <div class="diary-card-preview">${escapeHTML(d.body)}</div>
        <div class="diary-card-foot">
          <span class="diary-lock"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Private</span>
          <button class="diary-del">Delete</button>
        </div>
      `;
      el.querySelector('.diary-del').onclick = (e) => {
        e.stopPropagation();
        if(confirm("Delete this entry?")) {
          S.diary = S.diary.filter(x => x.id !== d.id);
          saveData();
          renderDiary();
        }
      };
      
      el.onclick = () => {
        $('dm-content').innerHTML = `
          <div class="pm-modal-time" style="margin-bottom:12px">${formatDate(d.date)}</div>
          <div class="pm-modal-title">${escapeHTML(d.title)}</div>
          <div class="pm-modal-body">${escapeHTML(d.body)}</div>
          <div style="display:flex;justify-content:flex-end;margin-top:14px;">
            <button type="button" class="dpc-export-btn" id="dm-export-btn" style="padding:6px 14px;font-size:12px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>Export As Image Card</span>
            </button>
          </div>
        `;
        const exportBtn = $('dm-export-btn');
        if (exportBtn) {
          exportBtn.onclick = () => {
            openExportCardModal({
              text: d.body,
              author: "Private Reflection",
              tag: "Sonder Journal"
            });
          };
        }
        $('diary-modal').classList.remove('hidden');
      };
      
      list.appendChild(el);
    });
    
    $('dm-close').onclick = () => $('diary-modal').classList.add('hidden');
  };
  
  const renderMyStories = () => {
    const list = $('my-stories-list');
    list.innerHTML = '';
    const myPosts = S.posts.filter(p => p.isMine);
    
    if(myPosts.length === 0) {
      $('empty-my').classList.remove('hidden');
      return;
    }
    $('empty-my').classList.add('hidden');
    
    myPosts.forEach(p => {
      const el = document.createElement('div');
      el.className = 'ig-post';
      el.style.border = '1px solid var(--border)';
      el.style.padding = '12px';
      el.style.borderRadius = 'var(--r-sm)';
      el.style.marginBottom = '10px';
      el.innerHTML = `
        <div class="ig-post-head" style="margin-bottom:6px">
          <div class="ig-post-title" style="margin:0; font-size:15px">${p.title}</div>
          <div class="ig-post-time">${formatDate(p.date)}</div>
        </div>
        <div class="ig-post-body" style="font-size:13px">${p.body}</div>
        <div class="diary-card-foot" style="margin-top:8px; padding-top:8px">
          <span class="diary-lock" style="color:var(--text3)">${Object.values(p.reacts).reduce((a,b)=>a+b,0)} Reacts</span>
          <button class="diary-del">Delete Story</button>
        </div>
      `;
      
      el.querySelector('.diary-del').onclick = (e) => {
        e.stopPropagation();
        if(confirm("Delete this shared story?")) {
          S.posts = S.posts.filter(x => x.id !== p.id);
          saveData();
          renderMyStories();
          renderFeed();
        }
      };
      
      el.onclick = () => openPostDetail(p);
      list.appendChild(el);
    });
  };

  // ─── ROUTER ───────────────────────────────────────────────────────
  const initRouter = () => {
    // Wire top-nav links
    qa('.top-nav-link[data-pane]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pane = link.dataset.pane;
        switchPane(pane);
        // update hash without re-triggering hashchange
        history.replaceState(null, '', '#' + pane);
        qa('.top-nav-link').forEach(l => l.classList.remove('active-top-nav'));
        link.classList.add('active-top-nav');
      });
    });

    // Handle hash on load
    window.addEventListener('hashchange', () => {
      const pane = location.hash.replace('#', '') || 'feed';
      switchPane(pane);
    });

    const initPane = location.hash.replace('#', '') || 'feed';
    switchPane(initPane);
  };

  // ─── CONTACT FORM ─────────────────────────────────────────────────
  const setupContact = () => {
    const form = $('contact-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const thankyou = $('contact-thankyou');
      if (thankyou) {
        form.style.display = 'none';
        thankyou.classList.remove('hidden');
        setTimeout(() => {
          form.style.display = '';
          form.reset();
          thankyou.classList.add('hidden');
        }, 4000);
      }
      showToast('Message sent!');
    });
  };

  // ─── PROFILE PANE ─────────────────────────────────────────────────
  const updateProfileStats = () => {
    const statStories = $('profile-stat-stories');
    const statDiary   = $('profile-stat-diary');
    const statMoods   = $('profile-stat-moods');
    const statFollow  = $('profile-stat-following');
    const statFllwrs  = $('profile-stat-followers');
    if (statStories) statStories.innerText = S.posts.filter(p => p.isMine).length;
    if (statDiary)   statDiary.innerText   = S.diary.length;
    if (statMoods)   statMoods.innerText   = S.user.moods.length;
    if (statFollow)  statFollow.innerText  = S.user.following || 0;
    if (statFllwrs)  statFllwrs.innerText  = S.user.followers || 0;
  };

  const setupProfile = () => {
    const pid    = $('profile-id');
    const pjoin  = $('profile-joined');
    const bigAv  = $('profile-big-avatar');
    const bioText = $('profile-bio-text');
    const bioInput = $('profile-bio-input');
    const bioCharCount = $('bio-char-count');

    if (pid)   pid.innerText   = S.user.id;
    if (pjoin) pjoin.innerText = new Date(S.user.joined).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
    if (bigAv) bigAv.innerHTML = S.user.avatar;
    if (bioText) bioText.innerText = S.user.bio || 'No bio yet. Tell the community a little about your journey.';
    updateProfileStats();

    // Bio editing
    const editBtn   = $('profile-edit-btn');
    const bioDisplay = $('profile-bio-display');
    const bioEdit   = $('profile-bio-edit');
    if (editBtn) {
      editBtn.onclick = () => {
        bioDisplay.classList.add('hidden');
        bioEdit.classList.remove('hidden');
        bioInput.value = S.user.bio || '';
        if (bioCharCount) bioCharCount.innerText = bioInput.value.length;
        bioInput.focus();
      };
    }
    if (bioInput) {
      bioInput.addEventListener('input', () => {
        if (bioCharCount) bioCharCount.innerText = bioInput.value.length;
      });
    }
    const saveBtn   = $('profile-bio-save');
    const cancelBtn = $('profile-bio-cancel');
    if (saveBtn) {
      saveBtn.onclick = () => {
        S.user.bio = bioInput.value.trim();
        if (bioText) bioText.innerText = S.user.bio || 'No bio yet. Tell the community a little about your journey.';
        bioDisplay.classList.remove('hidden');
        bioEdit.classList.add('hidden');
        saveData();
        showToast('Bio saved');
      };
    }
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        bioDisplay.classList.remove('hidden');
        bioEdit.classList.add('hidden');
      };
    }

  };

  // ─── EXPLORE PANE ─────────────────────────────────────────────────
  let exploreFilter = 'all';

  const setupExplore = () => {
    qa('.explore-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        qa('.explore-chip').forEach(c => c.classList.remove('active-chip'));
        chip.classList.add('active-chip');
        exploreFilter = chip.dataset.emotion;
        renderExplore(exploreFilter);
      });
    });
  };

  const EMOTION_EMOJIS = { heartbreak:'\ud83d\udc94', betrayal:'\ud83d\udde1', longing:'\ud83c\udf19', healing:'\ud83c\udf3f', anger:'\ud83d\udd25', acceptance:'\ud83d\udd4a' };
  const GRADIENT_MAPS = {
    heartbreak: ['#3d1626','#1a0a12'], betrayal: ['#1a3a5c','#0d1a2b'],
    longing:    ['#3a1a3d','#180f1a'], healing:  ['#1e3a1a','#0f1a0d'],
    anger:      ['#3d1a1a','#1a0f0f'], acceptance:['#0f3d3a','#0a1a1a']
  };

  const renderExplore = (filter) => {
    const grid = $('explore-grid');
    const empty = $('empty-explore');
    if (!grid) return;
    grid.innerHTML = '';

    let posts = [...S.posts];
    if (filter !== 'all') posts = posts.filter(p => p.emotion === filter);

    if (posts.length === 0) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    posts.forEach(p => {
      const em     = EMOTIONS[p.emotion];
      const emEmoji = EMOTION_EMOJIS[p.emotion] || '\u2728';
      const grad   = p.gradient ? p.gradient : (GRADIENT_MAPS[p.emotion] || ['#1a0a12','#3d1626']);
      const card = document.createElement('div');
      card.className = 'explore-card';
      card.setAttribute('role', 'listitem');
      card.setAttribute('aria-label', p.title);
      card.tabIndex = 0;

      card.innerHTML = `
        <div class="explore-card-bg" style="background:linear-gradient(135deg,${grad[0]},${grad[1]});">
          <span style="font-size:28px;opacity:0.4;">${emEmoji}</span>
        </div>
        <div class="explore-card-overlay">
          <span class="explore-card-overlay-emoji">${emEmoji}</span>
          <span class="explore-card-overlay-title">${escapeHTML(p.title)}</span>
        </div>
        <span class="explore-card-emotion-tag ${em.cls}">${escapeHTML(em.label)}</span>
      `;

      card.onclick = () => openPostDetail(p);
      card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openPostDetail(p); });
      grid.appendChild(card);
    });
  };

  // ─── SAVED PANE ───────────────────────────────────────────────────
  const setupSaved = () => { /* renders on pane switch */ };

  const renderSaved = () => {
    const list  = $('saved-list');
    const empty = $('empty-saved');
    if (!list) return;
    list.innerHTML = '';

    const savedPosts = S.posts.filter(p => S.saved.includes(p.id));
    if (savedPosts.length === 0) {
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');

    savedPosts.forEach(p => {
      const card = createPostCard(p, false);
      list.appendChild(card);
    });
  };

  // ─── IMAGE ATTACH IN WRITE MODAL ──────────────────────────────────
  let pendingImageDataUrl = null;

  const setupImageAttach = () => {
    const fileInput = $('wm-image-input');
    const preview   = $('wm-image-preview');
    const previewImg = $('wm-preview-img');
    const removeBtn  = $('wm-image-remove');
    if (!fileInput) return;

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (!file.type.startsWith('image/')) { showToast('Please select an image file'); return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        pendingImageDataUrl = ev.target.result;
        previewImg.src = pendingImageDataUrl;
        preview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
    });

    if (removeBtn) {
      removeBtn.onclick = () => {
        pendingImageDataUrl = null;
        previewImg.src = '';
        preview.classList.add('hidden');
        fileInput.value = '';
      };
    }

    // Patch wm-submit to include image
    const origSubmit = $('wm-submit').onclick;
    $('wm-submit').onclick = () => {
      const title = $('wm-title').value.trim();
      const body  = $('wm-body').value.trim();
      if (!body) return alert('Please write something.');
      const isAnon = $('post-anon').checked;
      const emKey  = $('wm-emotion').value;
      const newPost = {
        id: 'p_' + Date.now(),
        userId: isAnon ? S.user.id : 'Ghost',
        avatar: isAnon ? S.user.avatar : getAvatar(),
        title: title || 'Untitled',
        body, emotion: emKey,
        date: new Date().toISOString(),
        reacts: { love:0, cry:0, angry:0, healing:0, peace:0 },
        comments: [], isMine: true,
        imageUrl: pendingImageDataUrl || null,
        gradient: pendingImageDataUrl ? null : null
      };
      S.posts.unshift(newPost);
      saveData();
      $('wm-title').value = '';
      $('wm-body').value  = '';
      pendingImageDataUrl = null;
      if (previewImg)  previewImg.src = '';
      if (preview)     preview.classList.add('hidden');
      if (fileInput)   fileInput.value = '';
      $('wm-char').innerText = '0';
      $('write-modal').classList.add('hidden');
      showToast('Story shared \u2728');
      renderFeed();
      renderMyStories();
      updateProfileStats();
      if (S.activePane !== 'feed') switchPane('feed');
    };
  };

  // ─── RELATIONSHIP ADVICE & NEWS (Real-Life API Updates) ───────────
  let currentAdviceCategory = 'all';

  const setupAdviceSection = () => {
    // Initial load
    fetchLiveAdviceSlip();
    loadAdviceNews('all');

    // Refresh advice button
    const refreshBtn = $('refresh-advice-btn');
    if (refreshBtn) {
      refreshBtn.onclick = () => {
        fetchLiveAdviceSlip(true);
      };
    }

    // Copy advice button
    const copyBtn = $('copy-advice-btn');
    if (copyBtn) {
      copyBtn.onclick = () => {
        const text = $('live-advice-quote')?.innerText || '';
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text);
          showToast('📋 Advice copied to clipboard!');
          const btnText = $('copy-advice-btn-text');
          if (btnText) {
            btnText.innerText = 'Copied!';
            setTimeout(() => { btnText.innerText = 'Copy'; }, 2000);
          }
        }
      };
    }

    // Category filter chips
    qa('#advice-chips .advice-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        qa('#advice-chips .advice-chip').forEach(b => b.classList.remove('active-chip'));
        e.currentTarget.classList.add('active-chip');
        const cat = e.currentTarget.dataset.category || 'all';
        currentAdviceCategory = cat;
        loadAdviceNews(cat, $('advice-search-input')?.value || '');
      });
    });

    // Search input
    const searchInput = $('advice-search-input');
    const searchClear = $('advice-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim();
        if (searchClear) searchClear.classList.toggle('hidden', !term);
        loadAdviceNews(currentAdviceCategory, term);
      });
    }
    if (searchClear) {
      searchClear.onclick = () => {
        if (searchInput) searchInput.value = '';
        searchClear.classList.add('hidden');
        loadAdviceNews(currentAdviceCategory, '');
      };
    }
  };

  const fetchLiveAdviceSlip = async (showToastNotice = false) => {
    const quoteEl = $('live-advice-quote');
    const sourceEl = $('live-advice-source');
    if (quoteEl) quoteEl.style.opacity = '0.5';

    try {
      const res = await fetch(getApiUrl('/api/advice-slip/daily'));
      const data = await res.json();
      if (data && data.advice) {
        if (quoteEl) {
          quoteEl.innerText = `"${data.advice}"`;
          quoteEl.style.opacity = '1';
        }
        if (sourceEl) {
          sourceEl.innerText = `Source: ${data.source || 'Live Advice Slip API'}`;
        }
        if (showToastNotice) {
          showToast('✨ Fresh live relationship advice loaded!');
        }
      }
    } catch (err) {
      if (quoteEl) {
        quoteEl.innerText = '"Never allow someone to be your priority while allowing yourself to be their option."';
        quoteEl.style.opacity = '1';
      }
    }
  };

  const loadAdviceNews = async (category = 'all', searchQuery = '') => {
    const grid = $('advice-grid');
    const emptyState = $('empty-advice');
    if (!grid) return;

    try {
      let url = `${getApiUrl('/api/advice-news')}?category=${encodeURIComponent(category)}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;

      const res = await fetch(url);
      const data = await res.json();
      const items = data.items || [];

      grid.innerHTML = '';
      if (items.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }
      if (emptyState) emptyState.classList.add('hidden');

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'advice-card';
        card.innerHTML = `
          <div class="ac-top-row">
            <span class="ac-category-tag">${escapeHTML(item.categoryLabel || item.category)}</span>
            <span class="ac-read-time">${escapeHTML(item.readTime || '3 min read')}</span>
          </div>
          <h4 class="ac-title">${escapeHTML(item.title)}</h4>
          <p class="ac-summary">${escapeHTML(item.summary)}</p>
          ${item.takeaways && item.takeaways.length ? `
            <div class="ac-takeaways-title">Key Actionable Insights</div>
            <ul class="ac-takeaways">
              ${item.takeaways.map(t => `<li>${escapeHTML(t)}</li>`).join('')}
            </ul>
          ` : ''}
          <div class="ac-footer">
            <span class="ac-source-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              ${escapeHTML(item.source)}
            </span>
            <a href="${item.sourceUrl || '#'}" target="_blank" rel="noopener noreferrer" class="ac-link">
              Read Source ↗
            </a>
          </div>
        `;
        grid.appendChild(card);
      });
    } catch (e) {
      console.error('Failed to load advice news:', e);
    }
  };

  // ─── PRIVATE CHATS WITH FRIENDS & DIRECT MESSAGES (INSTAGRAM DM & WHATSAPP UX) ─────
  let activeDmThreadId = null;
  let activeDmFilter = 'all'; // 'all' | 'unread' | 'friends'
  let chatAttachmentData = null;
  let activeEmojiCategory = 'smileys';

  const EMOJI_CATEGORIES = {
    smileys: ['😊', '🥰', '🥹', '😍', '😌', '🥺', '😭', '💔', '🤍', '✨', '🔥', '😴', '🥲', '🤗', '😇', '🌸', '💫', '🌻'],
    love: ['❤️', '💖', '💗', '💓', '💞', '💕', '🫂', '🕊️', '🥀', '🌿', '☕', '🩹', '💌', '🖤', '🌙', '🤲', '🙏', '✨'],
    hands: ['👍', '👏', '🤝', '✌️', '🤞', '👋', '🫶', '💪', '🙌', '🫰', '🤙', '✊', '👌', '✋', '👐', '🙇', '🙏', '✍️'],
    nature: ['🌸', '🕯️', '🍫', '🎧', '🧸', '🎈', '📚', '🌊', '☀️', '🌻', '🍃', '🌧️', '☕', '🍵', '🛋️', '🪴', '🌌', '💎']
  };

  // Synthesized Web Audio feedback chimes
  const playChime = (type = 'send') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'send') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'receive') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, ctx.currentTime);
        osc.frequency.setValueAtTime(659, ctx.currentTime + 0.06);
        osc.frequency.setValueAtTime(784, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'call') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(480, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio policy
    }
  };

  const setupMessages = () => {
    // Initial render of inbox & friends
    renderDMInbox();
    renderFriendsList();

    // Auto-open first active thread if none is selected
    if (!activeDmThreadId && S.dms && S.dms.length > 0) {
      openDMThread(S.dms[0].threadId);
    }

    // Sidebar Filter Switchers: All vs Unread vs Friends
    const tabAllBtn = $('dm-tab-all-btn');
    const tabUnreadBtn = $('dm-tab-unread-btn');
    const tabFriendsBtn = $('dm-tab-friends-btn');

    if (tabAllBtn) tabAllBtn.onclick = () => setDMFilter('all');
    if (tabUnreadBtn) tabUnreadBtn.onclick = () => setDMFilter('unread');
    if (tabFriendsBtn) tabFriendsBtn.onclick = () => setDMFilter('friends');

    // Search input in sidebar
    const searchInput = $('dm-search-input');
    const searchClear = $('dm-search-clear');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        const val = searchInput.value.trim();
        if (searchClear) searchClear.classList.toggle('hidden', !val);
        if (activeDmFilter === 'friends') {
          renderFriendsList(val);
        } else {
          renderDMInbox(val);
        }
      });
    }
    if (searchClear) {
      searchClear.onclick = () => {
        if (searchInput) searchInput.value = '';
        searchClear.classList.add('hidden');
        if (activeDmFilter === 'friends') {
          renderFriendsList();
        } else {
          renderDMInbox();
        }
      };
    }

    // "New Chat" & "Add Friend" buttons
    const newChatBtn = $('dm-new-chat-btn');
    const addFriendBtn = $('dm-add-friend-btn');
    const ntsStartBtn = $('dm-nts-start-btn');
    if (newChatBtn) newChatBtn.onclick = openNewDMModal;
    if (addFriendBtn) addFriendBtn.onclick = openAddFriendModal;
    if (ntsStartBtn) ntsStartBtn.onclick = openNewDMModal;

    // Mobile back button (returns to conversation thread list)
    const backBtn = $('dm-back-btn');
    if (backBtn) {
      backBtn.onclick = () => {
        activeDmThreadId = null;
        S.activeDmThread = null;
        const container = $('dm-container');
        if (container) {
          container.classList.remove('dm-active');
          container.classList.remove('thread-open');
        }
        const nts = $('dm-no-thread-selected');
        const threadView = $('dm-thread');
        if (nts) nts.classList.remove('hidden');
        if (threadView) threadView.classList.add('hidden');
        renderDMInbox($('dm-search-input')?.value || '');
      };
    }

    // Header Friend status toggle button
    const friendToggleBtn = $('dm-th-friend-toggle');
    if (friendToggleBtn) {
      friendToggleBtn.onclick = () => {
        if (!activeDmThreadId) return;
        const thread = (S.dms || []).find(t => t.threadId === activeDmThreadId);
        if (!thread || !thread.recipient) return;
        toggleFriendStatus(thread.recipient);
      };
    }

    // Call Actions (Audio & Video Stubs)
    const callBtn = $('dm-th-call-btn');
    const videoBtn = $('dm-th-video-btn');
    if (callBtn) {
      callBtn.onclick = () => {
        if (!activeDmThreadId) return;
        const thread = (S.dms || []).find(t => t.threadId === activeDmThreadId);
        const name = thread?.recipient?.name || 'Friend';
        playChime('call');
        showToast(`📞 Calling ${name}… (End-to-End Encrypted Audio Call)`);
      };
    }
    if (videoBtn) {
      videoBtn.onclick = () => {
        if (!activeDmThreadId) return;
        const thread = (S.dms || []).find(t => t.threadId === activeDmThreadId);
        const name = thread?.recipient?.name || 'Friend';
        playChime('call');
        showToast(`📹 Starting encrypted video connection with ${name}…`);
      };
    }

    // Voice Note simulation buttons
    const voiceTriggerBtn = $('dm-voice-trigger-btn');
    const handleSendVoiceNote = () => {
      if (!activeDmThreadId) return;
      const thread = (S.dms || []).find(t => t.threadId === activeDmThreadId);
      if (!thread) return;

      const voiceMsg = {
        id: 'msg_v_' + Date.now(),
        sender: 'me',
        isVoice: true,
        duration: '0:14',
        text: 'Voice note (0:14)',
        timestamp: Date.now(),
        status: 'read'
      };
      if (!thread.messages) thread.messages = [];
      thread.messages.push(voiceMsg);
      thread.lastActivity = Date.now();
      saveData();
      syncMessageToServer(thread.threadId, voiceMsg);
      renderDMMessages(thread);
      renderDMInbox($('dm-search-input')?.value || '');
      playChime('send');
      showToast('🎙️ Voice note sent');
      triggerEmpatheticResponse(thread, "I just sent a voice note");
    };

    if (voiceTriggerBtn) voiceTriggerBtn.onclick = handleSendVoiceNote;

    // Image Attachment Handling
    const imageUpload = $('dm-image-upload');
    const previewWrap = $('dm-attached-preview');
    const previewThumb = $('dm-preview-thumb');
    const removeAttachBtn = $('dm-remove-attachment-btn');

    if (imageUpload) {
      imageUpload.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          chatAttachmentData = re.target.result;
          if (previewThumb) previewThumb.src = chatAttachmentData;
          if (previewWrap) previewWrap.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
      });
    }

    if (removeAttachBtn) {
      removeAttachBtn.onclick = () => {
        chatAttachmentData = null;
        if (imageUpload) imageUpload.value = '';
        if (previewWrap) previewWrap.classList.add('hidden');
      };
    }

    // Clear thread button
    const clearBtn = $('dm-clear-thread-btn');
    if (clearBtn) {
      clearBtn.onclick = () => {
        if (!activeDmThreadId) return;
        if (confirm('Clear message history for this private conversation?')) {
          const thread = S.dms.find(t => t.threadId === activeDmThreadId);
          if (thread) {
            thread.messages = [];
            thread.lastActivity = Date.now();
            saveData();
            renderDMMessages(thread);
            renderDMInbox();
            showToast('Conversation history cleared');
          }
        }
      };
    }

    // Interactive Emoji Popover Setup
    setupEmojiPopover();

    // Message input & auto-expanding textarea
    const dmInput = $('dm-input');
    const sendBtn = $('dm-send-btn');

    if (dmInput) {
      dmInput.addEventListener('input', () => {
        dmInput.style.height = 'auto';
        dmInput.style.height = Math.min(dmInput.scrollHeight, 120) + 'px';
      });

      dmInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendActiveDMMessage();
        }
      });
    }
    if (sendBtn) {
      sendBtn.onclick = () => {
        sendActiveDMMessage();
      };
    }

    // Mobile back button already initialized above

    // Quick empathy chips in composer
    qa('.dm-emp-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = e.currentTarget.dataset.emoji || '❤️';
        insertEmojiIntoInput(emoji);
      });
    });

    // Modals wiring
    setupNewDMModal();
    setupAddFriendModal();
  };

  const setupEmojiPopover = () => {
    const popover = $('dm-emoji-popover');
    const toggleBtn = $('dm-emoji-toggle-btn');
    const grid = $('dm-ep-grid');
    if (!popover || !toggleBtn) return;

    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      popover.classList.toggle('hidden');
      if (!popover.classList.contains('hidden')) {
        renderEmojiCategory(activeEmojiCategory);
      }
    };

    qa('.dm-ep-tab').forEach(tab => {
      tab.onclick = (e) => {
        e.stopPropagation();
        qa('.dm-ep-tab').forEach(t => t.classList.remove('active-ep-tab'));
        tab.classList.add('active-ep-tab');
        activeEmojiCategory = tab.dataset.cat || 'smileys';
        renderEmojiCategory(activeEmojiCategory);
      };
    });

    document.addEventListener('click', (e) => {
      if (popover && !popover.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        popover.classList.add('hidden');
      }
    });
  };

  const renderEmojiCategory = (cat) => {
    const grid = $('dm-ep-grid');
    if (!grid) return;
    const emojis = EMOJI_CATEGORIES[cat] || EMOJI_CATEGORIES.smileys;
    grid.innerHTML = '';
    emojis.forEach(em => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dm-ep-btn';
      btn.innerText = em;
      btn.title = em;
      btn.onclick = (e) => {
        e.stopPropagation();
        insertEmojiIntoInput(em);
      };
      grid.appendChild(btn);
    });
  };

  const insertEmojiIntoInput = (emoji) => {
    const dmInput = $('dm-input');
    if (!dmInput) return;
    const start = dmInput.selectionStart || dmInput.value.length;
    const end = dmInput.selectionEnd || dmInput.value.length;
    const current = dmInput.value;
    dmInput.value = current.substring(0, start) + emoji + current.substring(end);
    dmInput.focus();
    dmInput.selectionStart = dmInput.selectionEnd = start + emoji.length;
  };

  const setDMFilter = (filter) => {
    activeDmFilter = filter;
    const tabAllBtn = $('dm-tab-all-btn');
    const tabUnreadBtn = $('dm-tab-unread-btn');
    const tabFriendsBtn = $('dm-tab-friends-btn');
    const threadList = $('dm-thread-list');
    const friendsList = $('dm-friends-list');
    const titleLabel = $('dm-sidebar-title-label');

    if (tabAllBtn) tabAllBtn.classList.toggle('active-dm-tab', filter === 'all');
    if (tabUnreadBtn) tabUnreadBtn.classList.toggle('active-dm-tab', filter === 'unread');
    if (tabFriendsBtn) tabFriendsBtn.classList.toggle('active-dm-tab', filter === 'friends');

    if (filter === 'friends') {
      if (threadList) threadList.classList.add('hidden');
      if (friendsList) friendsList.classList.remove('hidden');
      if (titleLabel) titleLabel.innerHTML = '<span>Friends Circle</span>';
      renderFriendsList($('dm-search-input')?.value || '');
    } else {
      if (threadList) threadList.classList.remove('hidden');
      if (friendsList) friendsList.classList.add('hidden');
      if (titleLabel) titleLabel.innerHTML = filter === 'unread' ? '<span>Unread Messages</span>' : '<span>Conversations</span>';
      renderDMInbox($('dm-search-input')?.value || '');
    }
  };

  const updateGlobalUnreadBadges = () => {
    const totalUnread = (S.dms || []).reduce((acc, t) => acc + (t.unreadCount || 0), 0);
    const pill = $('dm-total-unread-pill');
    const tabBadge = $('dm-unread-tab-badge');
    const navBadge = $('dm-badge');
    const mobileBadge = $('dm-badge-mobile');

    if (pill) {
      pill.innerText = totalUnread;
      pill.classList.toggle('hidden', totalUnread === 0);
    }
    if (tabBadge) {
      tabBadge.innerText = totalUnread;
      tabBadge.classList.toggle('hidden', totalUnread === 0);
    }
    if (navBadge) {
      navBadge.innerText = totalUnread;
      navBadge.classList.toggle('hidden', totalUnread === 0);
    }
    if (mobileBadge) {
      mobileBadge.innerText = totalUnread;
      mobileBadge.classList.toggle('hidden', totalUnread === 0);
    }

    const friendsCountEl = $('dm-friends-count');
    if (friendsCountEl) {
      friendsCountEl.innerText = (S.friends || []).length;
    }
  };

  const isFriend = (personId) => {
    if (!S.friends) return false;
    return S.friends.some(f => f.id === personId || f.name === personId);
  };

  const toggleFriendStatus = (person) => {
    if (!S.friends) S.friends = [];
    const idx = S.friends.findIndex(f => f.id === person.id || f.name === person.name);
    if (idx >= 0) {
      S.friends.splice(idx, 1);
      showToast(`Removed ${person.name} from friends`);
    } else {
      S.friends.unshift({
        id: person.id || person.name,
        name: person.name,
        tag: person.tag || person.name,
        avatar: person.avatar || getAvatar(),
        online: person.online !== false,
        bio: person.bio || 'Sonder Community Friend',
        status: person.online ? 'Active now • Connected' : 'Offline',
        addedAt: Date.now()
      });
      showToast(`Added ${person.name} to your friends circle ✨`);
    }
    saveData();
    updateGlobalUnreadBadges();
    updateChatHeaderFriendStatus();
    renderFriendsList($('dm-search-input')?.value || '');
  };

  const updateChatHeaderFriendStatus = () => {
    const friendToggleBtn = $('dm-th-friend-toggle');
    if (!friendToggleBtn || !activeDmThreadId) return;
    const thread = (S.dms || []).find(t => t.threadId === activeDmThreadId);
    if (!thread || !thread.recipient) return;

    const isF = isFriend(thread.recipient.id);
    friendToggleBtn.innerHTML = isF ? '<span>★ Friend</span>' : '<span>+ Add Friend</span>';
    friendToggleBtn.style.background = isF ? 'rgba(0, 199, 149, 0.15)' : 'rgba(255, 255, 255, 0.08)';
    friendToggleBtn.style.color = isF ? 'var(--accent)' : 'var(--text2)';
  };

  const renderFriendsList = (searchFilter = '') => {
    const listEl = $('dm-friends-list');
    const emptyEl = $('empty-dm');
    if (!listEl) return;

    updateGlobalUnreadBadges();

    let friends = [...(S.friends || [])];
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      friends = friends.filter(f =>
        (f.name || '').toLowerCase().includes(q) ||
        (f.tag || '').toLowerCase().includes(q) ||
        (f.bio || '').toLowerCase().includes(q)
      );
    }

    listEl.innerHTML = '';
    if (friends.length === 0) {
      listEl.innerHTML = `
        <div class="dm-empty-inbox" style="padding:24px 12px;text-align:center;">
          <p style="font-size:13px;color:var(--text2);margin-bottom:6px;">No friends found</p>
          <span style="font-size:11.5px;color:var(--text3);">Tap "+ Add Friend" above to build your trusted circle.</span>
        </div>
      `;
      return;
    }

    friends.forEach(f => {
      const card = document.createElement('div');
      card.className = 'dm-friend-card';
      card.innerHTML = `
        <div class="dm-fc-left">
          <div class="dm-fc-avatar-wrap">
            <div class="dm-fc-avatar">${f.avatar || getAvatar()}</div>
            ${f.online ? '<span class="dm-fc-online-dot"></span>' : ''}
          </div>
          <div class="dm-fc-info">
            <span class="dm-fc-name">${escapeHTML(f.name)}</span>
            <span class="dm-fc-status">${escapeHTML(f.status || (f.online ? 'Active now' : 'Seen recently'))}</span>
          </div>
        </div>
        <div class="dm-fc-actions">
          <button type="button" class="dm-fc-chat-btn" title="Open private chat">Message</button>
          <button type="button" class="dm-fc-remove-btn" title="Remove from friends">&times;</button>
        </div>
      `;

      card.querySelector('.dm-fc-chat-btn').onclick = (e) => {
        e.stopPropagation();
        startDirectMessageWith(f);
      };

      card.querySelector('.dm-fc-remove-btn').onclick = (e) => {
        e.stopPropagation();
        if (confirm(`Remove ${f.name} from your friends circle?`)) {
          toggleFriendStatus(f);
        }
      };

      card.onclick = () => {
        startDirectMessageWith(f);
      };

      listEl.appendChild(card);
    });
  };

  const renderDMInbox = (searchFilter = '') => {
    const listEl = $('dm-thread-list');
    const emptyEl = $('empty-dm');
    if (!listEl) return;

    updateGlobalUnreadBadges();

    let threads = [...(S.dms || [])];
    threads.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

    if (activeDmFilter === 'unread') {
      threads = threads.filter(t => (t.unreadCount || 0) > 0);
    }

    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      threads = threads.filter(t => 
        (t.recipient?.name || '').toLowerCase().includes(q) ||
        (t.recipient?.tag || '').toLowerCase().includes(q) ||
        (t.messages || []).some(m => (m.text || '').toLowerCase().includes(q))
      );
    }

    listEl.innerHTML = '';
    if (threads.length === 0) {
      if (emptyEl) {
        emptyEl.classList.remove('hidden');
        const emptyTitle = $('empty-dm-title');
        const emptySub = $('empty-dm-sub');
        if (emptyTitle) emptyTitle.innerText = activeDmFilter === 'unread' ? 'No unread conversations' : 'No conversations found';
        if (emptySub) emptySub.innerText = activeDmFilter === 'unread' ? 'You are all caught up on your messages.' : 'Tap "New Chat" or add a friend to start chatting.';
      }
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    threads.forEach(t => {
      const lastMsg = t.messages && t.messages.length ? t.messages[t.messages.length - 1] : null;
      let previewText = 'Started a conversation';
      if (lastMsg) {
        if (lastMsg.isVoice) {
          previewText = lastMsg.sender === 'me' ? 'You: 🎙️ Voice note (0:14)' : '🎙️ Voice note (0:14)';
        } else if (lastMsg.image) {
          previewText = lastMsg.sender === 'me' ? 'You: 📷 Photo' : '📷 Photo';
        } else {
          previewText = lastMsg.sender === 'me' ? `You: ${lastMsg.text}` : lastMsg.text;
        }
      }

      const timeStr = lastMsg ? formatMessageTime(lastMsg.timestamp) : '';
      const isActive = t.threadId === activeDmThreadId;
      const hasUnread = (t.unreadCount || 0) > 0;

      const item = document.createElement('div');
      item.className = `dm-thread-item ${isActive ? 'active-thread' : ''} ${hasUnread ? 'has-unread' : ''}`;
      item.dataset.threadId = t.threadId;

      item.innerHTML = `
        <div class="dm-ti-avatar-wrap">
          <div class="dm-ti-avatar">${t.recipient.avatar || getAvatar()}</div>
          ${t.recipient.online ? '<span class="dm-ti-online-dot"></span>' : ''}
        </div>
        <div class="dm-ti-content">
          <div class="dm-ti-top-row">
            <span class="dm-ti-name" style="${hasUnread ? 'font-weight:700;color:#ffffff;' : ''}">${escapeHTML(t.recipient.name || 'Anonymous')}</span>
            <span class="dm-ti-time" style="${hasUnread ? 'color:var(--accent);font-weight:600;' : ''}">${escapeHTML(timeStr)}</span>
          </div>
          <div class="dm-ti-bottom-row">
            <span class="dm-ti-preview" style="${hasUnread ? 'color:#ffffff;font-weight:600;' : ''}">${escapeHTML(previewText)}</span>
            ${hasUnread ? `<span class="dm-ti-badge">${t.unreadCount}</span>` : ''}
          </div>
        </div>
      `;

      item.onclick = () => {
        openDMThread(t.threadId);
      };

      listEl.appendChild(item);
    });
  };

  const openDMThread = (threadId) => {
    const thread = (S.dms || []).find(t => t.threadId === threadId);
    if (!thread) return;

    activeDmThreadId = threadId;
    S.activeDmThread = threadId;

    // Reset unread count
    thread.unreadCount = 0;
    saveData();
    updateGlobalUnreadBadges();

    // Notify backend
    try {
      fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId })
      }).catch(() => {});
    } catch(e) {}

    // Update UI elements
    const container = $('dm-container');
    if (container) {
      container.classList.add('thread-open');
      container.classList.add('dm-active');
    }

    const nts = $('dm-no-thread-selected');
    const threadView = $('dm-thread');
    if (nts) nts.classList.add('hidden');
    if (threadView) threadView.classList.remove('hidden');

    // Populate header
    const avatarEl = $('dm-thread-avatar');
    const nameEl = $('dm-thread-name');
    const statusEl = $('dm-th-status');
    const onlineDot = $('dm-th-online-dot');

    if (avatarEl) avatarEl.innerHTML = thread.recipient.avatar || getAvatar();
    if (nameEl) nameEl.innerText = thread.recipient.name || 'Anonymous';
    if (statusEl) statusEl.innerText = thread.recipient.lastSeen || (thread.recipient.online ? 'Active now • End-to-end encrypted' : 'Seen recently');
    if (onlineDot) onlineDot.classList.toggle('hidden', !thread.recipient.online);

    updateChatHeaderFriendStatus();

    // Render messages & highlight thread item
    renderDMMessages(thread);
    renderDMInbox($('dm-search-input')?.value || '');

    // Focus input
    const dmInput = $('dm-input');
    if (dmInput) {
      setTimeout(() => dmInput.focus(), 50);
    }
  };

  const renderDMMessages = (thread) => {
    const msgStream = $('dm-messages');
    if (!msgStream) return;

    msgStream.innerHTML = '';

    const messages = thread.messages || [];
    let lastDateStr = '';

    messages.forEach((m, idx) => {
      const isMe = m.sender === 'me';
      const msgDate = new Date(m.timestamp || Date.now());
      const dateHeaderStr = getDateHeaderString(msgDate);

      // WhatsApp / IG Date Divider Header
      if (dateHeaderStr !== lastDateStr) {
        const dateDivider = document.createElement('div');
        dateDivider.className = 'dm-date-divider';
        dateDivider.innerHTML = `<span>${escapeHTML(dateHeaderStr)}</span>`;
        msgStream.appendChild(dateDivider);
        lastDateStr = dateHeaderStr;
      }

      const row = document.createElement('div');
      row.className = `dm-msg-row ${isMe ? 'sent' : 'received'}`;
      row.dataset.msgId = m.id;

      const timeFormatted = formatMessageClock(m.timestamp);

      let bodyContent = '';
      if (m.isVoice) {
        bodyContent = `
          <div class="dm-voice-bubble" id="vb_${m.id}">
            <button type="button" class="dm-voice-play-btn" title="Play audio">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <div class="dm-voice-wave">
              <span class="dm-voice-bar" style="height:8px"></span>
              <span class="dm-voice-bar" style="height:14px"></span>
              <span class="dm-voice-bar" style="height:10px"></span>
              <span class="dm-voice-bar" style="height:16px"></span>
              <span class="dm-voice-bar" style="height:12px"></span>
              <span class="dm-voice-bar" style="height:7px"></span>
            </div>
            <span style="font-size:11px;opacity:0.85;margin-left:4px;">${m.duration || '0:14'}</span>
          </div>
        `;
      } else {
        bodyContent = `
          <div>${escapeHTML(m.text)}</div>
          ${m.image ? `<div class="dm-msg-img-wrap"><img src="${m.image}" class="dm-msg-img" alt="Attached photo" /></div>` : ''}
        `;
      }

      // Read receipt checkmark formatting
      let receiptHtml = '';
      if (isMe) {
        const isRead = m.status === 'read';
        receiptHtml = `<span class="dm-receipt-icon ${isRead ? 'read' : ''}" title="${isRead ? 'Read' : 'Delivered'}">✓✓</span>`;
      }

      row.innerHTML = `
        ${!isMe ? `<div class="dm-msg-avatar">${thread.recipient.avatar || getAvatar()}</div>` : ''}
        <div class="dm-msg-body-wrap">
          <div class="dm-msg-actions-hover">
            <button type="button" class="dm-mah-btn dm-mah-react" title="React with Heart">❤️</button>
            <button type="button" class="dm-mah-btn dm-mah-copy" title="Copy text">📋</button>
            ${isMe ? '<button type="button" class="dm-mah-btn dm-mah-del" title="Delete message">🗑️</button>' : ''}
          </div>
          <div class="dm-msg-bubble">
            ${bodyContent}
            ${m.reaction ? `<span class="dm-msg-reaction-badge">${escapeHTML(m.reaction)}</span>` : ''}
          </div>
          <div class="dm-msg-meta">
            <span>${timeFormatted}</span>
            ${receiptHtml}
          </div>
        </div>
      `;

      // Wire Voice Play Button Toggle
      const playBtn = row.querySelector('.dm-voice-play-btn');
      if (playBtn) {
        playBtn.onclick = (e) => {
          e.stopPropagation();
          const vb = row.querySelector('.dm-voice-bubble');
          if (vb) {
            vb.classList.toggle('playing');
            playChime('call');
          }
        };
      }

      // Wire Hover Actions
      const reactBtn = row.querySelector('.dm-mah-react');
      if (reactBtn) {
        reactBtn.onclick = (e) => {
          e.stopPropagation();
          m.reaction = m.reaction === '❤️' ? null : '❤️';
          saveData();
          renderDMMessages(thread);
        };
      }

      const copyBtn = row.querySelector('.dm-mah-copy');
      if (copyBtn) {
        copyBtn.onclick = (e) => {
          e.stopPropagation();
          if (navigator.clipboard && m.text) {
            navigator.clipboard.writeText(m.text).then(() => {
              showToast('📋 Message copied to clipboard');
            }).catch(() => {
              showToast('Message text copied');
            });
          } else {
            showToast('Message text copied');
          }
        };
      }

      const delBtn = row.querySelector('.dm-mah-del');
      if (delBtn) {
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm('Delete this message for yourself?')) {
            thread.messages.splice(idx, 1);
            saveData();
            renderDMMessages(thread);
            renderDMInbox($('dm-search-input')?.value || '');
            showToast('Message deleted');
          }
        };
      }

      // Allow tapping bubble to toggle reaction
      const bubbleEl = row.querySelector('.dm-msg-bubble');
      if (bubbleEl) {
        bubbleEl.onclick = () => {
          m.reaction = m.reaction ? null : '❤️';
          saveData();
          renderDMMessages(thread);
        };
      }

      msgStream.appendChild(row);
    });

    // Auto-scroll to bottom on render
    setTimeout(() => {
      msgStream.scrollTop = msgStream.scrollHeight;
    }, 20);
  };

  const getDateHeaderString = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const syncMessageToServer = (threadId, message) => {
    try {
      fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, message })
      }).catch(() => {});
    } catch (e) {}
  };

  const sendActiveDMMessage = () => {
    if (!activeDmThreadId) return;
    const thread = (S.dms || []).find(t => t.threadId === activeDmThreadId);
    if (!thread) return;

    const input = $('dm-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text && !chatAttachmentData) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      sender: 'me',
      text: text || 'Photo Attachment',
      image: chatAttachmentData || null,
      timestamp: Date.now(),
      status: 'read'
    };

    if (!thread.messages) thread.messages = [];
    thread.messages.push(newMsg);
    thread.lastActivity = Date.now();

    input.value = '';
    input.style.height = 'auto';
    chatAttachmentData = null;
    $('dm-attached-preview')?.classList.add('hidden');
    $('dm-emoji-popover')?.classList.add('hidden');
    if ($('dm-image-upload')) $('dm-image-upload').value = '';

    saveData();
    syncMessageToServer(thread.threadId, newMsg);
    renderDMMessages(thread);
    renderDMInbox($('dm-search-input')?.value || '');

    // Play subtle synthesized chime
    playChime('send');

    // Trigger realistic compassionate response from friend
    triggerEmpatheticResponse(thread, text);
  };

  const triggerEmpatheticResponse = (thread, userText) => {
    const typingRow = $('dm-typing-row');
    const typingLabel = $('dm-typing-label');

    // Show typing indicator after 500ms
    setTimeout(() => {
      if (activeDmThreadId === thread.threadId) {
        if (typingLabel) typingLabel.innerText = `${thread.recipient.name} is typing…`;
        if (typingRow) typingRow.classList.remove('hidden');
        const msgStream = $('dm-messages');
        if (msgStream) msgStream.scrollTop = msgStream.scrollHeight;
      }
    }, 500);

    // Deliver reply after 2.2 seconds
    setTimeout(() => {
      if (typingRow) typingRow.classList.add('hidden');

      const replyText = generateEmpatheticResponse(userText, thread.recipient.name);
      const replyMsg = {
        id: 'msg_' + Date.now(),
        sender: 'them',
        text: replyText,
        timestamp: Date.now(),
        status: 'received'
      };

      thread.messages.push(replyMsg);
      thread.lastActivity = Date.now();

      // If user is currently looking at another thread or pane, increment unread count
      if (activeDmThreadId !== thread.threadId || S.activePane !== 'messages') {
        thread.unreadCount = (thread.unreadCount || 0) + 1;
        showToast(`💬 New message from ${thread.recipient.name}`);
      }

      saveData();
      syncMessageToServer(thread.threadId, replyMsg);
      updateGlobalUnreadBadges();

      if (activeDmThreadId === thread.threadId) {
        renderDMMessages(thread);
        playChime('receive');
      }
      renderDMInbox($('dm-search-input')?.value || '');
    }, 2200);
  };

  const generateEmpatheticResponse = (input, partnerName) => {
    const lower = (input || '').toLowerCase();

    if (lower.includes('cry') || lower.includes('hurts') || lower.includes('pain') || lower.includes('sad') || lower.includes('broken')) {
      const responses = [
        "I hear you, and it's completely okay to let those tears fall. Crying is your nervous system's way of releasing the weight you've been carrying for too long. You are safe here.",
        "Holding space for your pain right now. Be gentle with your heart tonight — you don't have to have it all figured out today 🕊️",
        "It hurts so deeply because what you felt was real. Honor your feelings, take slow deep breaths, and know that you are not alone in this valley."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lower.includes('miss') || lower.includes('text') || lower.includes('call') || lower.includes('contact') || lower.includes('back')) {
      const responses = [
        "I know how loud the silence feels, but you are protecting your peace. Staying no-contact is not a punishment; it is boundary self-care. Stay strong, you've got this 🌿",
        "The urge to reach out is just dopamine withdrawal in your brain. Breathe through the wave — you've survived 100% of your hardest days so far.",
        "Remember why it ended. Don't trade long-term healing for ten seconds of temporary relief. I believe in you."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lower.includes('betray') || lower.includes('cheat') || lower.includes('lie') || lower.includes('angry') || lower.includes('hate')) {
      const responses = [
        "Your anger is completely valid. Anger is just the part of you that loves yourself recognizing that you deserved so much better. Feel it, then let it fuel your self-worth.",
        "Their actions were a reflection of their capacity, not your worth. You gave pure love, and that speaks to who you are, not what they took."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('nobody')) {
      const responses = [
        "You might feel alone in this moment, but you are deeply seen here. Every single one of us in Sonder is walking this road with you. We're in this together 🕊️",
        "Loneliness after a connection is hard, but it's also a sacred space where you get to rediscover yourself. I'm right here with you."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    const genericResponses = [
      "Thank you for sharing that with me. How is your heart feeling in this exact moment?",
      "I truly appreciate you opening up. Take it one day at a time — what is one kind thing you can do for yourself tonight?",
      "That resonates so deeply. Sending you warmth and strength. I'm always here if you need a listening ear ✨",
      "Grateful to connect with you. Healing isn't a straight line, but every step forward counts."
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  };

  const setupNewDMModal = () => {
    const modal = $('new-dm-modal');
    const closeBtn = $('new-dm-close');
    const searchInput = $('new-dm-search-input');

    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderNewDMMembers(searchInput.value.trim());
      });
    }
  };

  const openNewDMModal = () => {
    const modal = $('new-dm-modal');
    const searchInput = $('new-dm-search-input');
    if (searchInput) searchInput.value = '';
    renderNewDMMembers();
    if (modal) modal.classList.remove('hidden');
  };

  const renderNewDMMembers = (filter = '') => {
    const listEl = $('new-dm-members-list');
    if (!listEl) return;

    let personas = [...COMMUNITY_PERSONAS];
    if (filter) {
      const q = filter.toLowerCase();
      personas = personas.filter(p => p.name.toLowerCase().includes(q) || p.tag.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q));
    }

    listEl.innerHTML = '';

    if (personas.length === 0 && filter) {
      // Allow starting chat with custom handle
      const customItem = document.createElement('div');
      customItem.className = 'ndm-member-item';
      customItem.innerHTML = `
        <div class="ndm-member-left">
          <div class="ndm-member-avatar">${getAvatar()}</div>
          <div>
            <div class="ndm-member-name">${escapeHTML(filter)}</div>
            <div class="ndm-member-bio">Start private chat with this member</div>
          </div>
        </div>
        <button type="button" class="ndm-chat-btn">Chat</button>
      `;
      customItem.onclick = () => {
        startDirectMessageWith({
          id: filter,
          name: filter,
          tag: filter,
          avatar: getAvatar(),
          online: true,
          bio: 'Community member',
          lastSeen: 'Active now'
        });
        $('new-dm-modal')?.classList.add('hidden');
      };
      listEl.appendChild(customItem);
      return;
    }

    personas.forEach(p => {
      const item = document.createElement('div');
      item.className = 'ndm-member-item';
      item.innerHTML = `
        <div class="ndm-member-left">
          <div class="ndm-member-avatar">${p.avatar || getAvatar()}</div>
          <div>
            <div class="ndm-member-name">${escapeHTML(p.name)}</div>
            <div class="ndm-member-bio">${escapeHTML(p.bio)}</div>
          </div>
        </div>
        <button type="button" class="ndm-chat-btn">Chat</button>
      `;

      item.onclick = () => {
        startDirectMessageWith(p);
        $('new-dm-modal')?.classList.add('hidden');
      };

      listEl.appendChild(item);
    });
  };

  const setupAddFriendModal = () => {
    const modal = $('add-friend-modal');
    const closeBtn = $('add-friend-close');
    const submitBtn = $('add-friend-submit-btn');
    const input = $('add-friend-input');

    if (closeBtn && modal) {
      closeBtn.onclick = () => modal.classList.add('hidden');
    }
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }

    if (submitBtn && input) {
      submitBtn.onclick = () => {
        const handle = input.value.trim();
        if (!handle) return;
        toggleFriendStatus({
          id: handle,
          name: handle,
          tag: handle,
          avatar: getAvatar(),
          online: true,
          bio: 'Added friend',
          status: 'Active now • Connected'
        });
        input.value = '';
        modal?.classList.add('hidden');
        setDMFilter('friends');
      };
    }
  };

  const openAddFriendModal = () => {
    const modal = $('add-friend-modal');
    const listEl = $('add-friend-suggestions-list');
    const input = $('add-friend-input');
    if (input) input.value = '';

    if (listEl) {
      listEl.innerHTML = '';
      COMMUNITY_PERSONAS.forEach(p => {
        const isAlready = isFriend(p.id);
        const item = document.createElement('div');
        item.className = 'ndm-member-item';
        item.innerHTML = `
          <div class="ndm-member-left">
            <div class="ndm-member-avatar">${p.avatar || getAvatar()}</div>
            <div>
              <div class="ndm-member-name">${escapeHTML(p.name)}</div>
              <div class="ndm-member-bio">${escapeHTML(p.bio)}</div>
            </div>
          </div>
          <button type="button" class="ndm-chat-btn" style="${isAlready ? 'background:rgba(255,255,255,0.1);color:var(--text2);' : ''}">${isAlready ? 'Friend' : '+ Add'}</button>
        `;

        item.querySelector('.ndm-chat-btn').onclick = (e) => {
          e.stopPropagation();
          toggleFriendStatus(p);
          openAddFriendModal(); // refresh view
        };

        listEl.appendChild(item);
      });
    }

    if (modal) modal.classList.remove('hidden');
  };

  const startDirectMessageWith = (recipient) => {
    if (!recipient || !recipient.id) return;

    // Check if thread already exists
    let thread = (S.dms || []).find(t => t.recipient?.id === recipient.id || t.recipient?.name === recipient.name);

    if (!thread) {
      thread = {
        threadId: 'th_' + Date.now(),
        recipient: {
          id: recipient.id,
          name: recipient.name || recipient.id,
          tag: recipient.tag || recipient.id,
          avatar: recipient.avatar || getAvatar(),
          online: recipient.online !== false,
          bio: recipient.bio || 'Sonder Community Member',
          lastSeen: recipient.lastSeen || 'Active now'
        },
        unreadCount: 0,
        lastActivity: Date.now(),
        messages: []
      };
      if (!S.dms) S.dms = [];
      S.dms.unshift(thread);
      saveData();
    }

    // Switch to messages pane and activate chats tab
    switchPane('messages');
    setDMFilter('all');
    openDMThread(thread.threadId);
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageClock = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // ─── 1. NO-CONTACT & HEALING MILESTONE TRACKER ─────────────────────
  const MILESTONES = [
    { days: 1, name: "The First Step", icon: "🌱", desc: "You made the conscious choice to choose yourself." },
    { days: 3, name: "Breaking Reflex", icon: "🧱", desc: "Overcoming the strongest physical reflex to reach out." },
    { days: 7, name: "One Week Strong", icon: "🕊️", desc: "7 days of reclaiming your peace and morning routine." },
    { days: 14, name: "Dopamine Reset", icon: "🧠", desc: "Your nervous system begins recalibrating its baseline." },
    { days: 30, name: "Month of Clarity", icon: "🌿", desc: "The emotional fog begins to clear into sharp perspective." },
    { days: 60, name: "Reclaiming Self", icon: "✨", desc: "You are remembering who you were before they arrived." },
    { days: 90, name: "New Horizon", icon: "🌅", desc: "A quarter year of resilience. The worst storm is behind you." },
    { days: 180, name: "Inner Peace", icon: "🤍", desc: "Indifference replaces resentment. True freedom." }
  ];

  const setupTracker = () => {
    renderTracker();

    // Set Date Modal triggers
    const setDateBtn = $('tracker-set-date-btn');
    const modal = $('set-tracker-modal');
    const closeBtn = $('set-tracker-close');
    const cancelBtn = $('set-tracker-cancel');
    const saveBtn = $('set-tracker-save');
    const dateInput = $('tracker-date-input');

    if (setDateBtn) {
      setDateBtn.onclick = () => {
        if (modal && dateInput) {
          const currentStart = S.tracker?.startDate || (Date.now() - 86400000 * 5.2);
          const d = new Date(currentStart);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
          dateInput.value = localISOTime;
          modal.classList.remove('hidden');
        }
      };
    }

    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.add('hidden');
    if (cancelBtn && modal) cancelBtn.onclick = () => modal.classList.add('hidden');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }

    if (saveBtn && dateInput) {
      saveBtn.onclick = () => {
        if (!dateInput.value) return alert('Please choose a valid date.');
        const chosenTime = new Date(dateInput.value).getTime();
        if (isNaN(chosenTime) || chosenTime > Date.now()) {
          return alert('Start date cannot be in the future.');
        }
        if (!S.tracker) S.tracker = {};
        S.tracker.startDate = chosenTime;
        saveData();
        renderTracker();
        if (modal) modal.classList.add('hidden');
        showToast('🎯 Recovery start date updated!');
      };
    }

    // Shield button in tracker hero card
    const shieldBtn = $('tracker-sos-trigger');
    if (shieldBtn) {
      shieldBtn.onclick = openSOSModal;
    }
  };

  const renderTracker = () => {
    const daysEl = $('tracker-days-num');
    const hoursEl = $('tracker-hours');
    const minsEl = $('tracker-mins');
    const nextTargetEl = $('tracker-next-milestone');
    const badgesGrid = $('tracker-badges-grid');
    if (!daysEl) return;

    const start = S.tracker?.startDate || (Date.now() - 86400000 * 5.2);
    const diffMs = Math.max(0, Date.now() - start);
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const totalDays = Math.floor(totalHours / 24);
    const remainHours = totalHours % 24;
    const remainMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.innerText = totalDays;
    if (hoursEl) hoursEl.innerText = `${remainHours} hours`;
    if (minsEl) minsEl.innerText = `${remainMins} mins`;

    // Calculate next milestone
    const nextMs = MILESTONES.find(m => totalDays < m.days);
    if (nextTargetEl) {
      if (nextMs) {
        const daysLeft = nextMs.days - totalDays;
        nextTargetEl.innerText = `Next: Day ${nextMs.days} • ${nextMs.name} ${nextMs.icon} (${daysLeft} day${daysLeft > 1 ? 's' : ''} to go)`;
      } else {
        nextTargetEl.innerText = `All Milestones Unlocked! You are unstoppable 🕊️`;
      }
    }

    // Render milestone badges
    if (badgesGrid) {
      badgesGrid.innerHTML = '';
      MILESTONES.forEach(m => {
        const isUnlocked = totalDays >= m.days;
        const item = document.createElement('div');
        item.className = `thc-badge-item ${isUnlocked ? 'badge-unlocked' : 'badge-locked'}`;
        item.title = `${m.name}: ${m.desc}`;
        item.innerHTML = `
          <span class="thc-badge-icon">${m.icon}</span>
          <span class="thc-badge-name">${escapeHTML(m.name)}</span>
          <span class="thc-badge-days">Day ${m.days} ${isUnlocked ? '✓' : '🔒'}</span>
        `;
        badgesGrid.appendChild(item);
      });
    }
  };

  // ─── 2. EMERGENCY SOS GROUNDING & BOX BREATHING COOLDOWN ────────────
  let breathInterval = null;
  let breathPhaseIndex = 0;
  let breathSecondsRemaining = 4;

  const BREATH_PHASES = [
    { name: 'Breathe In', cls: 'inhale', instruction: 'Inhale slowly through your nose… Fill your lungs with calm.' },
    { name: 'Hold Gently', cls: 'hold', instruction: 'Hold gently… Notice the peaceful stillness in your body.' },
    { name: 'Breathe Out', cls: 'exhale', instruction: 'Exhale slowly through your mouth… Release all urgency and pressure.' },
    { name: 'Hold Empty', cls: 'hold', instruction: 'Hold empty… You are safe. You are in complete control.' }
  ];

  const setupSOSGrounding = () => {
    const pillBtn = $('sos-pill-btn');
    const closeBtn = $('sos-close-btn');
    const doneBtn = $('sos-done-btn');
    const journalBtn = $('sos-journal-btn');
    const modal = $('sos-modal');

    if (pillBtn) pillBtn.onclick = openSOSModal;
    if (closeBtn) closeBtn.onclick = closeSOSModal;
    if (doneBtn) doneBtn.onclick = () => {
      closeSOSModal();
      showToast('🌟 Proud of you for holding your peace.');
    };

    if (journalBtn) {
      journalBtn.onclick = () => {
        closeSOSModal();
        switchPane('diary');
        $('diary-title')?.focus();
        showToast('Write everything down without breaking your boundary.');
      };
    }

    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) closeSOSModal();
      };
    }
  };

  const openSOSModal = () => {
    const modal = $('sos-modal');
    if (modal) {
      modal.classList.remove('hidden');
      startBoxBreathing();
    }
  };

  const closeSOSModal = () => {
    const modal = $('sos-modal');
    if (modal) {
      modal.classList.add('hidden');
      stopBoxBreathing();
    }
  };

  const startBoxBreathing = () => {
    stopBoxBreathing();
    breathPhaseIndex = 0;
    breathSecondsRemaining = 4;
    updateBreathingUI();

    breathInterval = setInterval(() => {
      breathSecondsRemaining--;
      if (breathSecondsRemaining <= 0) {
        breathPhaseIndex = (breathPhaseIndex + 1) % BREATH_PHASES.length;
        breathSecondsRemaining = 4;
      }
      updateBreathingUI();
    }, 1000);
  };

  const stopBoxBreathing = () => {
    if (breathInterval) {
      clearInterval(breathInterval);
      breathInterval = null;
    }
  };

  const updateBreathingUI = () => {
    const phase = BREATH_PHASES[breathPhaseIndex];
    const circle = $('breath-circle');
    const label = $('breath-phase-label');
    const sec = $('breath-seconds');
    const inst = $('breath-instructions');

    if (circle) circle.className = `breath-circle ${phase.cls}`;
    if (label) label.innerText = phase.name;
    if (sec) sec.innerText = breathSecondsRemaining;
    if (inst) inst.innerText = phase.instruction;
  };

  // ─── 3. 24-HOUR DAILY COMMUNITY PROMPT ─────────────────────────────
  const DAILY_PROMPTS = [
    "What is something you forgave them for that you now realize you shouldn't have?",
    "What part of yourself did you silence just to keep the connection alive?",
    "If you could whisper one truth to yourself on the day you met them, what would it say?",
    "What was the exact moment you realized love wasn't enough to save it?",
    "What is a small, quiet boundary you are fiercely proud of holding today?",
    "What lie did you tell yourself because the truth was too heavy to carry?",
    "How has your definition of a 'safe partner' changed through this heartbreak?",
    "What is one piece of music you couldn't listen to for months that you can now enjoy in peace?",
    "What did this ending teach you about your own resilience that you never knew before?",
    "What is something beautiful you rediscovered about your solitude?"
  ];

  const getTodayPrompt = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
  };

  const setupDailyPrompt = () => {
    const questionEl = $('dpc-question');
    const answerBtn = $('dpc-answer-btn');
    const exportBtn = $('dpc-export-btn');

    const promptText = getTodayPrompt();
    if (questionEl) questionEl.innerText = `“${promptText}”`;

    updateDailyPromptCountdown();
    setInterval(updateDailyPromptCountdown, 60000);

    if (answerBtn) {
      answerBtn.onclick = () => {
        $('write-modal')?.classList.remove('hidden');
        const titleInput = $('wm-title');
        const bodyInput = $('wm-body');
        if (titleInput) titleInput.value = `Response to Daily Prompt`;
        if (bodyInput) {
          bodyInput.value = `Prompt: "${promptText}"\n\n`;
          bodyInput.focus();
        }
      };
    }

    if (exportBtn) {
      exportBtn.onclick = () => {
        openExportCardModal({
          text: promptText,
          author: "Daily Community Question",
          tag: "Sonder Daily Reflection",
          emotion: "healing"
        });
      };
    }
  };

  const updateDailyPromptCountdown = () => {
    const countEl = $('dpc-countdown');
    if (!countEl) return;

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const diffMs = midnight - now;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    countEl.innerText = `Resets in ${hours}h ${mins}m`;
  };

  // ─── 4. VIRAL SOCIAL STORY & QUOTE CARD CANVAS EXPORTER ─────────────
  let exportCardData = {
    text: "Every day you choose yourself is a quiet victory.",
    author: "Sonder Reflection",
    tag: "Healing & Self-Worth",
    aspectRatio: "story",
    theme: "slate"
  };

  const setupCardExporter = () => {
    const modal = $('export-card-modal');
    const closeBtn = $('export-card-close');
    const downloadBtn = $('export-download-btn');

    if (closeBtn && modal) closeBtn.onclick = () => modal.classList.add('hidden');
    if (modal) {
      modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      };
    }

    // Ratio toggles
    qa('.emc-ratio-btn').forEach(btn => {
      btn.onclick = () => {
        qa('.emc-ratio-btn').forEach(b => b.classList.remove('active-ratio'));
        btn.classList.add('active-ratio');
        exportCardData.aspectRatio = btn.dataset.ratio || 'story';
        renderExportCardCanvas();
      };
    });

    // Theme chips
    qa('.emc-theme-chip').forEach(chip => {
      chip.onclick = () => {
        qa('.emc-theme-chip').forEach(c => c.classList.remove('active-theme'));
        chip.classList.add('active-theme');
        exportCardData.theme = chip.dataset.theme || 'slate';
        renderExportCardCanvas();
      };
    });

    // Download PNG
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const canvas = $('export-quote-canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `sonder-reflection-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✨ Card saved to your gallery!');
      };
    }
  };

  const openExportCardModal = ({ text, author, tag }) => {
    exportCardData.text = text || "Every heart has a story.";
    exportCardData.author = author || "Anonymous";
    exportCardData.tag = tag || "Sonder Sanctuary";

    const modal = $('export-card-modal');
    if (modal) {
      modal.classList.remove('hidden');
      renderExportCardCanvas();
    }
  };

  const renderExportCardCanvas = () => {
    const canvas = $('export-quote-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const isStory = exportCardData.aspectRatio === 'story';
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;

    // Theme Palettes
    const THEMES = {
      slate:    { bg1: '#0d1317', bg2: '#06090c', accent: '#00c795', text: '#ffffff', subText: '#94a3b8' },
      emerald:  { bg1: '#071f18', bg2: '#020c09', accent: '#38bdf8', text: '#ffffff', subText: '#6ee7b7' },
      midnight: { bg1: '#0c1228', bg2: '#040712', accent: '#a78bfa', text: '#ffffff', subText: '#c4b5fd' },
      rose:     { bg1: '#240d18', bg2: '#0c0307', accent: '#fb7185', text: '#ffffff', subText: '#fbcfe8' }
    };

    const theme = THEMES[exportCardData.theme] || THEMES.slate;

    // Draw Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bg1);
    bgGrad.addColorStop(1, theme.bg2);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Radial Glow in center
    const glow = ctx.createRadialGradient(width/2, height/2, 50, width/2, height/2, width*0.6);
    glow.addColorStop(0, theme.accent + '22');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    // Outer subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, width - 80, height - 80);

    // Header Logo & Branding
    ctx.fillStyle = theme.accent;
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('S O N D E R', width / 2, isStory ? 200 : 130);

    // Tag badge pill
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    const tagText = (exportCardData.tag || 'SONDER').toUpperCase();
    ctx.font = '600 20px sans-serif';
    const tagWidth = ctx.measureText(tagText).width + 40;
    const tagY = isStory ? 260 : 180;
    roundRect(ctx, width/2 - tagWidth/2, tagY, tagWidth, 36, 18, true, false);

    ctx.fillStyle = theme.accent;
    ctx.fillText(tagText, width / 2, tagY + 25);

    // Large Quotation Mark
    ctx.fillStyle = theme.accent + '44';
    ctx.font = 'italic bold 120px serif';
    ctx.fillText('“', width / 2, isStory ? 480 : 320);

    // Word Wrap Text in Center
    ctx.fillStyle = theme.text;
    ctx.font = '500 48px serif';
    ctx.textAlign = 'center';

    const maxTextWidth = width - 240;
    const lineHeight = 72;
    const words = (exportCardData.text || '').split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = ctx.measureText(testLine).width;
      if (testWidth > maxTextWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    if (lines.length > 8) {
      lines = lines.slice(0, 7);
      lines.push('…');
    }

    const textBlockHeight = lines.length * lineHeight;
    let startY = (height / 2) - (textBlockHeight / 2) + 20;
    if (!isStory) startY = 400;

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + (idx * lineHeight));
    });

    // Author & Footer
    ctx.fillStyle = theme.subText;
    ctx.font = 'italic 28px sans-serif';
    ctx.fillText(`— ${exportCardData.author}`, width / 2, startY + (lines.length * lineHeight) + 60);

    // Watermark Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '500 22px sans-serif';
    ctx.fillText('sonder.app • anonymous stories & healing wisdom', width / 2, height - (isStory ? 100 : 70));
  };

  const roundRect = (ctx, x, y, width, height, radius, fill, stroke) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  };

  // ═══════════════════════════════════════════════════════════════════
  // REELS & STORIES VERTICAL VIDEO FEED (INSTAGRAM REELS UX)
  // ═══════════════════════════════════════════════════════════════════
  const reelsState = {
    items: [],
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    isMuted: true, // starts muted by default
    activeReelId: null,
    activeCommentReelId: null,
    observer: null,
    sentinelObserver: null
  };

  const setupReels = () => {
    // Global Mute Toggle button
    const muteBtn = $('reels-global-mute-btn');
    if (muteBtn) {
      muteBtn.onclick = toggleGlobalReelsMute;
    }

    // Comments Sheet Close button & Backdrop
    const rcmClose = $('reels-comments-close');
    const rcmModal = $('reels-comments-modal');
    if (rcmClose && rcmModal) {
      rcmClose.onclick = () => rcmModal.classList.add('hidden');
      rcmModal.onclick = (e) => {
        if (e.target === rcmModal) rcmModal.classList.add('hidden');
      };
    }

    // Comments Post Submission
    const rcmSubmit = $('rcm-comment-submit');
    const rcmInput = $('rcm-comment-input');
    if (rcmSubmit && rcmInput) {
      const handleCommentSubmit = async () => {
        const text = rcmInput.value.trim();
        if (!text || !reelsState.activeCommentReelId) return;

        const currentReel = reelsState.items.find(r => r.id === reelsState.activeCommentReelId);
        if (!currentReel) return;

        const newComment = {
          id: 'c_' + Date.now(),
          username: S.user.id || 'Sonder Member',
          handle: `@${(S.user.id || 'member').toLowerCase().replace(/\s+/g, '')}`,
          avatar: S.user.avatar || getAvatar(),
          text: text,
          timestamp: Date.now(),
          likes: 0
        };

        if (!currentReel.commentsList) currentReel.commentsList = [];
        currentReel.commentsList.unshift(newComment);
        currentReel.stats.comments = currentReel.commentsList.length;

        rcmInput.value = '';
        renderReelsComments(currentReel);
        updateReelCardCounts(currentReel.id, currentReel);
        showToast('Comment posted ✨');

        try {
          await fetch(getApiUrl(`/api/reels/${currentReel.id}/comment`), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: S.user.id || 'Sonder Member',
              handle: `@${(S.user.id || 'member').toLowerCase().replace(/\s+/g, '')}`,
              avatar: S.user.avatar,
              text: text
            })
          });
        } catch (e) {}
      };

      rcmSubmit.onclick = handleCommentSubmit;
      rcmInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCommentSubmit();
        }
      };
    }

    // Set up Video Autoplay IntersectionObserver (plays video only when >= 55% in view)
    if ('IntersectionObserver' in window) {
      reelsState.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const card = entry.target;
          const video = card.querySelector('.reel-video');
          const reelId = card.dataset.reelId;
          if (!video) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            reelsState.activeReelId = reelId;
            video.muted = reelsState.isMuted;
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay policy fallback: mute and play
                video.muted = true;
                video.play().catch(() => {});
              });
            }

            // Preload next adjacent video in queue
            const nextCard = card.nextElementSibling;
            if (nextCard) {
              const nextVideo = nextCard.querySelector('.reel-video');
              if (nextVideo && nextVideo.preload !== 'auto') {
                nextVideo.preload = 'auto';
              }
            }
          } else {
            video.pause();
          }
        });
      }, {
        root: $('reels-feed-container'),
        threshold: [0.2, 0.55, 0.8]
      });

      // Infinite scroll sentinel observer
      const sentinel = $('reels-sentinel');
      if (sentinel) {
        reelsState.sentinelObserver = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && !reelsState.isLoading && reelsState.hasMore) {
            loadReelsPage(reelsState.currentPage + 1);
          }
        }, {
          root: $('reels-feed-container'),
          threshold: 0.1
        });
        reelsState.sentinelObserver.observe(sentinel);
      }
    }

    // Load first page of reels
    loadReelsPage(1);
  };

  const onEnterReels = () => {
    const container = $('reels-feed-container');
    if (!container) return;
    const firstCard = container.querySelector('.reel-card');
    if (firstCard) {
      const video = firstCard.querySelector('.reel-video');
      if (video) {
        video.muted = reelsState.isMuted;
        video.play().catch(() => {});
      }
    }
  };

  const onLeaveReels = () => {
    qa('#reels-cards-stream .reel-video').forEach(vid => {
      vid.pause();
    });
  };

  const toggleGlobalReelsMute = () => {
    reelsState.isMuted = !reelsState.isMuted;
    const label = $('reels-mute-label');
    const iconMuteOn = document.querySelector('.icon-mute-on');
    const iconMuteOff = document.querySelector('.icon-mute-off');

    if (label) label.innerText = reelsState.isMuted ? 'Muted' : 'Sound On';
    if (iconMuteOn) iconMuteOn.classList.toggle('hidden', !reelsState.isMuted);
    if (iconMuteOff) iconMuteOff.classList.toggle('hidden', reelsState.isMuted);

    qa('#reels-cards-stream .reel-video').forEach(vid => {
      vid.muted = reelsState.isMuted;
    });

    playChime('send');
    showToast(reelsState.isMuted ? '🔇 Audio muted' : '🔊 Audio unmuted');
  };

  const loadReelsPage = async (page = 1) => {
    if (reelsState.isLoading) return;
    reelsState.isLoading = true;

    const stream = $('reels-cards-stream');
    const sentinel = $('reels-sentinel');

    try {
      const res = await fetch(getApiUrl(`/api/reels?page=${page}&limit=4`));
      const data = await res.json();
      const items = data.items || [];

      if (items.length === 0) {
        reelsState.hasMore = false;
        if (sentinel) sentinel.classList.add('hidden');
        reelsState.isLoading = false;
        return;
      }

      items.forEach(reel => {
        // Prevent duplicate IDs
        if (!reelsState.items.some(r => r.id === reel.id)) {
          reelsState.items.push(reel);
          const cardEl = createReelCardElement(reel);
          if (stream) stream.appendChild(cardEl);
          if (reelsState.observer) reelsState.observer.observe(cardEl);
        }
      });

      reelsState.currentPage = page;
    } catch (e) {
      console.error('Error fetching reels:', e);
    } finally {
      reelsState.isLoading = false;
    }
  };

  const createReelCardElement = (reel) => {
    const card = document.createElement('div');
    card.className = 'reel-card';
    card.dataset.reelId = reel.id;

    card.innerHTML = `
      <video class="reel-video" src="${reel.videoUrl}" poster="${reel.thumbnailUrl || ''}" playsinline webkit-playsinline loop preload="metadata" ${reelsState.isMuted ? 'muted' : ''}></video>
      
      <div class="reel-gradient-overlay"></div>
      
      <div class="reel-center-play-indicator">
        <svg class="rcpi-pause" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      </div>

      <div class="reel-big-heart-pop">❤️</div>

      <!-- Right Action Sidebar (IG style) -->
      <aside class="reel-action-bar">
        <button type="button" class="reel-act-btn reel-like-btn ${reel.userLiked ? 'liked' : ''}" title="Like story">
          <div class="reel-act-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <span class="reel-act-count reel-like-count">${reel.stats.likes}</span>
        </button>

        <button type="button" class="reel-act-btn reel-comment-btn" title="View comments">
          <div class="reel-act-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="reel-act-count reel-comment-count">${reel.stats.comments}</span>
        </button>

        <button type="button" class="reel-act-btn reel-share-btn" title="Share story">
          <div class="reel-act-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
          <span class="reel-act-count reel-share-count">${reel.stats.shares}</span>
        </button>

        <button type="button" class="reel-act-btn reel-save-btn ${reel.userSaved ? 'saved' : ''}" title="Save story">
          <div class="reel-act-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </div>
          <span class="reel-act-count reel-save-count">${reel.stats.saves}</span>
        </button>

        <div class="reel-music-disc" title="${escapeHTML(reel.audioTrack?.title || 'Audio')}">
          <div class="reel-music-disc-inner"></div>
        </div>
      </aside>

      <!-- Bottom Meta Overlay -->
      <div class="reel-meta-bottom">
        <div class="reel-author-row">
          <div class="reel-avatar">${reel.author.avatar || getAvatar()}</div>
          <div class="reel-author-info">
            <span class="reel-username">${escapeHTML(reel.author.name)}</span>
            ${reel.author.isVerified ? '<span class="reel-verified">✓</span>' : ''}
            <button type="button" class="reel-follow-btn ${reel.author.isFollowing ? 'following' : ''}">${reel.author.isFollowing ? 'Following' : '+ Follow'}</button>
          </div>
        </div>

        <div class="reel-caption-wrap">
          <span class="reel-caption-text">${escapeHTML(reel.caption)}</span>
          <button type="button" class="reel-caption-more-btn">more</button>
        </div>

        <div class="reel-audio-row">
          <span class="reel-audio-icon">🎵</span>
          <span class="reel-audio-title">${escapeHTML(reel.audioTrack?.title || 'Original Audio')} &bull; ${escapeHTML(reel.audioTrack?.artist || 'Sonder')}</span>
        </div>
      </div>

      <!-- Playback Progress Bar -->
      <div class="reel-progress-bar">
        <div class="reel-progress-fill"></div>
      </div>
    `;

    const video = card.querySelector('.reel-video');
    const playIndicator = card.querySelector('.reel-center-play-indicator');
    const heartPop = card.querySelector('.reel-big-heart-pop');
    const progressFill = card.querySelector('.reel-progress-fill');
    const captionText = card.querySelector('.reel-caption-text');
    const captionMore = card.querySelector('.reel-caption-more-btn');
    const followBtn = card.querySelector('.reel-follow-btn');
    const likeBtn = card.querySelector('.reel-like-btn');
    const commentBtn = card.querySelector('.reel-comment-btn');
    const shareBtn = card.querySelector('.reel-share-btn');
    const saveBtn = card.querySelector('.reel-save-btn');

    // Progress bar update
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const pct = (video.currentTime / video.duration) * 100;
        if (progressFill) progressFill.style.width = pct + '%';
      }
    });

    // Caption "See more" toggle
    if (captionMore && captionText) {
      captionMore.onclick = (e) => {
        e.stopPropagation();
        const isExp = captionText.classList.toggle('expanded');
        captionMore.innerText = isExp ? 'less' : 'more';
      };
    }

    // Follow toggle
    if (followBtn) {
      followBtn.onclick = (e) => {
        e.stopPropagation();
        reel.author.isFollowing = !reel.author.isFollowing;
        followBtn.classList.toggle('following', reel.author.isFollowing);
        followBtn.innerText = reel.author.isFollowing ? 'Following' : '+ Follow';
        showToast(reel.author.isFollowing ? `Following ${reel.author.name} ✨` : `Unfollowed ${reel.author.name}`);
      };
    }

    // Like Toggle
    const handleLikeToggle = (triggerSource = 'btn') => {
      reel.userLiked = !reel.userLiked;
      reel.stats.likes += reel.userLiked ? 1 : -1;
      updateReelCardCounts(reel.id, reel);

      if (triggerSource === 'doubletap' && heartPop) {
        heartPop.classList.remove('pop');
        void heartPop.offsetWidth;
        heartPop.classList.add('pop');
        setTimeout(() => heartPop.classList.remove('pop'), 600);
      }

      playChime('send');
      if (reel.userLiked) showToast('❤️ Liked story');

      try {
        fetch(getApiUrl(`/api/reels/${reel.id}/like`), { method: 'POST' }).catch(() => {});
      } catch (e) {}
    };

    if (likeBtn) {
      likeBtn.onclick = (e) => {
        e.stopPropagation();
        handleLikeToggle('btn');
      };
    }

    // Comment Sheet Open
    if (commentBtn) {
      commentBtn.onclick = (e) => {
        e.stopPropagation();
        openReelsCommentsSheet(reel);
      };
    }

    // Share Button
    if (shareBtn) {
      shareBtn.onclick = (e) => {
        e.stopPropagation();
        if (navigator.share) {
          navigator.share({
            title: `Sonder Story: ${reel.author.name}`,
            text: reel.caption,
            url: window.location.href
          }).catch(() => {});
        } else {
          navigator.clipboard?.writeText(window.location.href);
          showToast('🔗 Story link copied to clipboard!');
        }
      };
    }

    // Save Toggle
    if (saveBtn) {
      saveBtn.onclick = (e) => {
        e.stopPropagation();
        reel.userSaved = !reel.userSaved;
        reel.stats.saves += reel.userSaved ? 1 : -1;
        updateReelCardCounts(reel.id, reel);
        showToast(reel.userSaved ? '🔖 Saved to your bookmarks' : 'Removed from saved');

        try {
          fetch(getApiUrl(`/api/reels/${reel.id}/save`), { method: 'POST' }).catch(() => {});
        } catch (e) {}
      };
    }

    // Tap to Play/Pause vs Double-Tap to Like
    let tapCount = 0;
    let singleTapTimeout = null;

    video.onclick = (e) => {
      e.stopPropagation();
      tapCount++;

      if (tapCount === 1) {
        singleTapTimeout = setTimeout(() => {
          tapCount = 0;
          // Single tap: Toggle play/pause
          if (video.paused) {
            video.play().catch(() => {});
            if (playIndicator) {
              playIndicator.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
              playIndicator.classList.add('animate-play');
              setTimeout(() => playIndicator.classList.remove('animate-play'), 400);
            }
          } else {
            video.pause();
            if (playIndicator) {
              playIndicator.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
              playIndicator.classList.add('animate-play');
              setTimeout(() => playIndicator.classList.remove('animate-play'), 400);
            }
          }
        }, 260);
      } else if (tapCount === 2) {
        clearTimeout(singleTapTimeout);
        tapCount = 0;
        // Double tap: Like!
        if (!reel.userLiked) {
          handleLikeToggle('doubletap');
        } else {
          if (heartPop) {
            heartPop.classList.remove('pop');
            void heartPop.offsetWidth;
            heartPop.classList.add('pop');
            setTimeout(() => heartPop.classList.remove('pop'), 600);
          }
        }
      }
    };

    return card;
  };

  const updateReelCardCounts = (reelId, reel) => {
    const card = document.querySelector(`.reel-card[data-reel-id="${reelId}"]`);
    if (!card) return;

    const likeBtn = card.querySelector('.reel-like-btn');
    const likeCount = card.querySelector('.reel-like-count');
    const commentCount = card.querySelector('.reel-comment-count');
    const saveBtn = card.querySelector('.reel-save-btn');
    const saveCount = card.querySelector('.reel-save-count');

    if (likeBtn) likeBtn.classList.toggle('liked', reel.userLiked);
    if (likeCount) likeCount.innerText = reel.stats.likes;
    if (commentCount) commentCount.innerText = reel.stats.comments;
    if (saveBtn) saveBtn.classList.toggle('saved', reel.userSaved);
    if (saveCount) saveCount.innerText = reel.stats.saves;
  };

  const openReelsCommentsSheet = (reel) => {
    reelsState.activeCommentReelId = reel.id;
    const modal = $('reels-comments-modal');
    const myAvatar = $('rcm-my-avatar');
    if (myAvatar) myAvatar.innerHTML = S.user.avatar || getAvatar();
    renderReelsComments(reel);
    if (modal) modal.classList.remove('hidden');
  };

  const renderReelsComments = (reel) => {
    const countEl = $('rcm-comments-count');
    const listEl = $('rcm-comments-list');
    if (!listEl) return;

    const comments = reel.commentsList || [];
    if (countEl) countEl.innerText = comments.length;

    if (comments.length === 0) {
      listEl.innerHTML = `
        <div style="text-align:center;padding:40px 10px;color:var(--text3);font-size:13px;">
          <p style="margin-bottom:4px;color:var(--text2);">No comments yet.</p>
          <span>Be the first to share an encouraging reflection!</span>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    comments.forEach(c => {
      const item = document.createElement('div');
      item.className = 'rcm-comment-item';
      item.innerHTML = `
        <div class="rcm-ci-avatar">${c.avatar || getAvatar()}</div>
        <div class="rcm-ci-body">
          <div class="rcm-ci-user-row">
            <span class="rcm-ci-name">${escapeHTML(c.username)}</span>
            <span class="rcm-ci-time">${formatMessageTime(c.timestamp)}</span>
          </div>
          <p class="rcm-ci-text">${escapeHTML(c.text)}</p>
        </div>
      `;
      listEl.appendChild(item);
    });
  };

  // Run!
  init();
});
