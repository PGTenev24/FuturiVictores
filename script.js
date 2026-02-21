// ══════════════════════════════════════════
// API KEY — paste your Gemini key here
// Get one free at: aistudio.google.com
// ══════════════════════════════════════════
const GEMINI_API_KEY = "AIzaSyD-ZE_44v0j1sodBc985y64np9HD9FkXQQ";

// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const state = {
  user: null,
  currentExercise: null,
  reps: 0,
  tracking: false,
  webcamStream: null,
  sessionLog: [],
  currentQuestFilter: "daily",
};

// ══════════════════════════════════════════
// DATA
// ══════════════════════════════════════════
const QUESTS = {
  daily: [
    {
      id: "d1",
      name: "Morning Walk",
      desc: "Walk for 15 minutes outside.",
      icon: "🚶",
      reward: 10,
      xp: 20,
      difficulty: "Easy",
    },
    {
      id: "d2",
      name: "Drink Water",
      desc: "Drink 8 glasses of water today.",
      icon: "💧",
      reward: 8,
      xp: 15,
      difficulty: "Easy",
    },
    {
      id: "d3",
      name: "10 Push-Ups",
      desc: "Complete 10 push-ups in one session.",
      icon: "💪",
      reward: 12,
      xp: 25,
      difficulty: "Medium",
    },
    {
      id: "d4",
      name: "Stretch Break",
      desc: "Do a 5-minute full-body stretch.",
      icon: "🧘",
      reward: 8,
      xp: 15,
      difficulty: "Easy",
    },
    {
      id: "d5",
      name: "No Screen Hour",
      desc: "Go one hour without any screens.",
      icon: "📵",
      reward: 15,
      xp: 30,
      difficulty: "Medium",
    },
    {
      id: "d6",
      name: "Healthy Meal",
      desc: "Eat at least one home-cooked healthy meal.",
      icon: "🥗",
      reward: 10,
      xp: 20,
      difficulty: "Easy",
    },
  ],
  weekly: [
    {
      id: "w1",
      name: "5K Steps Daily",
      desc: "Hit 5,000 steps every day this week.",
      icon: "👟",
      reward: 50,
      xp: 100,
      difficulty: "Medium",
    },
    {
      id: "w2",
      name: "3 Workouts",
      desc: "Complete 3 training sessions this week.",
      icon: "🏋️",
      reward: 60,
      xp: 120,
      difficulty: "Hard",
    },
    {
      id: "w3",
      name: "Sleep 7hrs",
      desc: "Get at least 7 hours of sleep 5 nights.",
      icon: "😴",
      reward: 40,
      xp: 80,
      difficulty: "Medium",
    },
    {
      id: "w4",
      name: "No Junk Food",
      desc: "Avoid junk food for the entire week.",
      icon: "🚫",
      reward: 70,
      xp: 140,
      difficulty: "Hard",
    },
  ],
  monthly: [
    {
      id: "m1",
      name: "30-Day Streak",
      desc: "Complete at least one quest every day for 30 days.",
      icon: "🔥",
      reward: 200,
      xp: 400,
      difficulty: "Legendary",
    },
    {
      id: "m2",
      name: "100 Workouts",
      desc: "Log 100 total reps across all training sessions.",
      icon: "🏆",
      reward: 150,
      xp: 300,
      difficulty: "Hard",
    },
    {
      id: "m3",
      name: "Mindful Month",
      desc: "Complete a mindfulness activity every week this month.",
      icon: "🌿",
      reward: 120,
      xp: 250,
      difficulty: "Medium",
    },
  ],
};

const RANKS = [
  {
    name: "Seedling",
    icon: "🌱",
    minXp: 0,
    desc: "Just getting started — every champion was once here.",
  },
  {
    name: "Sprout",
    icon: "🌿",
    minXp: 100,
    desc: "You're growing. Keep it up!",
  },
  {
    name: "Runner",
    icon: "🏃",
    minXp: 300,
    desc: "Building momentum and healthy habits.",
  },
  {
    name: "Warrior",
    icon: "⚔️",
    minXp: 600,
    desc: "Discipline is your superpower.",
  },
  {
    name: "Champion",
    icon: "🏆",
    minXp: 1000,
    desc: "You inspire others just by showing up.",
  },
  {
    name: "Legend",
    icon: "🌟",
    minXp: 2000,
    desc: "Elite. You've redefined what's possible.",
  },
];

const ACHIEVEMENTS = [
  {
    id: "a1",
    name: "First Step",
    icon: "👣",
    desc: "Complete your first quest.",
    reward: 5,
  },
  {
    id: "a2",
    name: "On a Roll",
    icon: "🔥",
    desc: "Complete 3 quests.",
    reward: 10,
  },
  {
    id: "a3",
    name: "Quest Master",
    icon: "🗺️",
    desc: "Complete 10 quests.",
    reward: 25,
  },
  { id: "a4", name: "XP Hunter", icon: "⚡", desc: "Earn 100 XP.", reward: 15 },
  {
    id: "a5",
    name: "Iron Will",
    icon: "🦾",
    desc: "Log a 50-rep training session.",
    reward: 20,
  },
  {
    id: "a6",
    name: "Century Club",
    icon: "💯",
    desc: "Earn 500 XP.",
    reward: 50,
  },
];

// ══════════════════════════════════════════
// LOCALSTORAGE PERSISTENCE
// ══════════════════════════════════════════
function saveUserState() {
  if (!state.user) return;
  const copy = {
    ...state.user,
    completedQuests: [...state.user.completedQuests],
    earnedAchievements: [...awardedAch],
  };
  localStorage.setItem(`hq_user_${state.user.username}`, JSON.stringify(copy));
}

function loadUserState(username) {
  const data = localStorage.getItem(`hq_user_${username}`);
  if (!data) return null;
  const parsed = JSON.parse(data);
  parsed.completedQuests = new Set(parsed.completedQuests || []);
  return parsed;
}

function saveAccount(username, password, data) {
  const accounts = JSON.parse(localStorage.getItem("hq_accounts") || "{}");
  accounts[username] = {
    password,
    data: { ...data, completedQuests: [] },
  };
  localStorage.setItem("hq_accounts", JSON.stringify(accounts));
}

function getAccount(username) {
  const accounts = JSON.parse(localStorage.getItem("hq_accounts") || "{}");
  return accounts[username] || null;
}

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
function signIn() {
  const usernameEl = document.getElementById("siUsername");
  const passwordEl = document.getElementById("siPassword");
  const err = document.getElementById("siError");
  if (!usernameEl || !passwordEl) return;
  const username = usernameEl.value.trim().toLowerCase();
  const password = passwordEl.value;
  if (!username || !password) {
    if (err) err.textContent = "Please fill in all fields.";
    return;
  }
  const account = getAccount(username);
  if (!account || account.password !== password) {
    if (err) err.textContent = "Invalid username or password.";
    return;
  }
  if (err) err.textContent = "";

  try {
    state.user = loadUserState(username) || account.data;
    state.user.completedQuests =
      state.user.completedQuests instanceof Set
        ? state.user.completedQuests
        : new Set(
            Array.isArray(state.user.completedQuests)
              ? state.user.completedQuests
              : [],
          );

    awardedAch.clear();
    if (Array.isArray(state.user.earnedAchievements)) {
      state.user.earnedAchievements.forEach((id) => awardedAch.add(id));
    }

    localStorage.setItem("hq_active_user", username);
    afterSignIn();
    closeModal("signModal");
    showToast("👋", `Welcome back, ${state.user.name || username}!`);
  } catch (e) {
    console.error("Sign in error:", e);
    if (err) err.textContent = "Something went wrong. Please try again.";
  }
}

// Temporary store for step 1 data while user fills step 2
let _pendingSignUp = null;

function signUp() {
  const nameEl = document.getElementById("suName");
  const usernameEl = document.getElementById("suUsername");
  const passwordEl = document.getElementById("suPassword");
  const err = document.getElementById("suError");
  if (!nameEl || !usernameEl || !passwordEl) return;

  const name = nameEl.value.trim();
  const username = usernameEl.value.trim().toLowerCase();
  const password = passwordEl.value;

  if (!name || !username || !password) {
    if (err) err.textContent = "Please fill in all fields.";
    return;
  }
  if (getAccount(username)) {
    if (err) err.textContent = "Username already taken.";
    return;
  }
  if (password.length < 4) {
    if (err) err.textContent = "Password too short (min 4 chars).";
    return;
  }
  if (err) err.textContent = "";

  // Store step 1 and show body profile step
  _pendingSignUp = { name, username, password };
  showBodyProfileStep();
}

function showBodyProfileStep() {
  const signUpView = document.getElementById("signUpView");
  const bodyProfileView = document.getElementById("bodyProfileView");
  if (!signUpView || !bodyProfileView) return;
  signUpView.style.display = "none";
  bodyProfileView.style.display = "block";
}

function finishSignUp() {
  if (!_pendingSignUp) return;

  const age = document.getElementById("bpAge")?.value?.trim();
  const weight = document.getElementById("bpWeight")?.value?.trim();
  const weightUnit = document.getElementById("bpWeightUnit")?.value || "kg";
  const height = document.getElementById("bpHeight")?.value?.trim();
  const heightUnit = document.getElementById("bpHeightUnit")?.value || "cm";
  const bodyType = document.querySelector(
    ".bp-option-btn.active[data-group=\'bodyType\']",
  )?.dataset.value;
  const goal = document.querySelector(
    ".bp-option-btn.active[data-group=\'goal\']",
  )?.dataset.value;
  const activity = document.querySelector(
    ".bp-option-btn.active[data-group=\'activity\']",
  )?.dataset.value;
  const bpErr = document.getElementById("bpError");

  if (!age || !weight || !height || !bodyType || !goal || !activity) {
    if (bpErr) bpErr.textContent = "Please complete all fields and selections.";
    return;
  }
  if (bpErr) bpErr.textContent = "";

  const { name, username, password } = _pendingSignUp;
  _pendingSignUp = null;

  const profile = {
    age: +age,
    weight: +weight,
    weightUnit,
    height: +height,
    heightUnit,
    bodyType,
    goal,
    activity,
  };

  const userData = {
    name,
    username,
    stars: 0,
    xp: 0,
    streak: 1,
    completedQuests: new Set(),
    earnedAchievements: [],
    profile,
  };

  saveAccount(username, password, userData);
  state.user = userData;
  awardedAch.clear();
  localStorage.setItem("hq_active_user", username);
  saveUserState();

  afterSignIn();
  closeModal("signModal");
  showToast(
    "\u{1F389}",
    `Welcome to HealthQuest, ${name}! Generating your quests...`,
  );
  generateAIQuests();
}

function afterSignIn() {
  const u = state.user;
  if (!u) return;

  const signinBtn = document.getElementById("signinBtn");
  if (signinBtn) signinBtn.style.display = "none";

  const userStats = document.getElementById("userStats");
  if (userStats) userStats.classList.add("visible");

  const avatarBtn = document.getElementById("avatarBtn");
  if (avatarBtn) {
    avatarBtn.classList.add("visible");
    avatarBtn.textContent = u.name ? u.name[0].toUpperCase() : "?";
  }

  const signoutBtn = document.getElementById("signoutBtn");
  if (signoutBtn) signoutBtn.style.display = "inline-block";

  const settingsSignBtn = document.getElementById("settingsSignBtn");
  if (settingsSignBtn) {
    settingsSignBtn.textContent = "Signed In ✓";
    settingsSignBtn.disabled = true;
  }

  const settingsAccountDesc = document.getElementById("settingsAccountDesc");
  if (settingsAccountDesc)
    settingsAccountDesc.textContent = `Signed in as ${u.username}`;

  // Show body profile section in settings
  const profileGroup = document.getElementById("profileGroup");
  if (profileGroup) profileGroup.style.display = "block";

  updateHeaderStats();
  loadAIQuestsIfSaved();
  renderQuestsGrid();
  renderAchievements();
  populateProfileSettings();
  updateFriendBadge();
  renderFriendsList();
  renderPendingRequests();
  renderLeaderboard();
}

function signOut() {
  state.user = null;
  awardedAch.clear();
  localStorage.removeItem("hq_active_user");

  const signinBtn = document.getElementById("signinBtn");
  if (signinBtn) signinBtn.style.display = "inline-block";

  const userStats = document.getElementById("userStats");
  if (userStats) userStats.classList.remove("visible");

  const avatarBtn = document.getElementById("avatarBtn");
  if (avatarBtn) {
    avatarBtn.classList.remove("visible");
    avatarBtn.textContent = "";
  }

  const signoutBtn = document.getElementById("signoutBtn");
  if (signoutBtn) signoutBtn.style.display = "none";

  const settingsSignBtn = document.getElementById("settingsSignBtn");
  if (settingsSignBtn) {
    settingsSignBtn.textContent = "Sign In";
    settingsSignBtn.disabled = false;
  }

  const settingsAccountDesc = document.getElementById("settingsAccountDesc");
  if (settingsAccountDesc) settingsAccountDesc.textContent = "Not signed in";

  const profileGroup = document.getElementById("profileGroup");
  if (profileGroup) profileGroup.style.display = "none";

  const siUsername = document.getElementById("siUsername");
  const siPassword = document.getElementById("siPassword");
  if (siUsername) siUsername.value = "";
  if (siPassword) siPassword.value = "";

  renderQuestsGrid();
  renderAchievements();
  showToast("👋", "Signed out. See you soon!");
}

function updateHeaderStats() {
  if (!state.user) return;
  const rank = getRank(state.user.xp);

  const headerStreak = document.getElementById("headerStreak");
  if (headerStreak) headerStreak.textContent = state.user.streak;

  const headerStars = document.getElementById("headerStars");
  if (headerStars) headerStars.textContent = state.user.stars;

  const headerRank = document.getElementById("headerRank");
  if (headerRank) headerRank.textContent = rank.name;
}

// ══════════════════════════════════════════
// AI QUEST GENERATION
// ══════════════════════════════════════════
async function generateAIQuests() {
  if (!state.user?.profile) return;

  const grid = document.getElementById("questsGrid");
  if (grid) {
    grid.innerHTML = `<div class="quest-generating">
      <div class="quest-gen-spinner"></div>
      <p>AI is crafting your personalised quests...</p>
    </div>`;
  }

  const p = state.user.profile;
  const weightDisplay = `${p.weight}${p.weightUnit}`;
  const heightDisplay = `${p.height}${p.heightUnit}`;

  const prompt = `You are a personal health coach creating customised fitness quests for a user.

User profile:
- Name: ${state.user.name}
- Age: ${p.age}
- Weight: ${weightDisplay}
- Height: ${heightDisplay}
- Body type: ${p.bodyType}
- Fitness goal: ${p.goal}
- Activity level: ${p.activity}

Generate exactly 13 quests total: 6 daily, 4 weekly, and 3 monthly. Each quest must be realistically achievable for this specific person given their body type, age, and goal. A heavy-set sedentary person should NOT get the same quests as a lean very active person.

Respond ONLY with a valid JSON object, no markdown, no explanation:
{
  "daily": [
    {"id":"d1","name":"...","desc":"...","icon":"<single emoji>","reward":<5-20>,"xp":<10-40>,"difficulty":"Easy|Medium|Hard"},
    ... 6 items total
  ],
  "weekly": [
    {"id":"w1","name":"...","desc":"...","icon":"<single emoji>","reward":<30-80>,"xp":<60-160>,"difficulty":"Easy|Medium|Hard|Legendary"},
    ... 4 items total
  ],
  "monthly": [
    {"id":"m1","name":"...","desc":"...","icon":"<single emoji>","reward":<100-250>,"xp":<200-500>,"difficulty":"Hard|Legendary"},
    ... 3 items total
  ]
}`;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_KEY_HERE") {
    console.warn(
      "No Gemini API key set. Open script.js and replace YOUR_GEMINI_KEY_HERE.",
    );
    renderQuestsGrid();
    showToast(
      "🔑",
      "Add your Gemini API key in script.js to enable AI quests.",
    );
    return;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
        }),
      },
    );

    if (!response.ok) {
      const errData = await response.json();
      console.error(
        "Gemini API error:",
        response.status,
        JSON.stringify(errData),
      );
      throw new Error(
        `API error ${response.status}: ${errData?.error?.message || "unknown"}`,
      );
    }

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) throw new Error("Empty response from Gemini");

    const clean = text.replace(/```json|```/g, "").trim();
    console.log("Cleaned text:", clean);

    const generated = JSON.parse(clean);

    if (generated.daily && generated.weekly && generated.monthly) {
      state.user.aiQuests = generated;
      saveUserState();
      QUESTS.daily = generated.daily;
      QUESTS.weekly = generated.weekly;
      QUESTS.monthly = generated.monthly;
      renderQuestsGrid();
      showToast("🤖", "Your personalised quests are ready!");
    } else {
      throw new Error(
        "Invalid quest format — missing daily/weekly/monthly keys",
      );
    }
  } catch (e) {
    console.error("AI quest generation failed:", e.message);
    renderQuestsGrid();
    showToast("⚠️", `Quest generation failed: ${e.message}`);
  }
}

// Load AI quests from saved state if available
function loadAIQuestsIfSaved() {
  if (state.user?.aiQuests) {
    const q = state.user.aiQuests;
    if (q.daily?.length) QUESTS.daily = q.daily;
    if (q.weekly?.length) QUESTS.weekly = q.weekly;
    if (q.monthly?.length) QUESTS.monthly = q.monthly;
  }
}

// ══════════════════════════════════════════
// BODY PROFILE — option button picker
// ══════════════════════════════════════════
function selectBpOption(btn, group) {
  document
    .querySelectorAll(`.bp-option-btn[data-group="${group}"]`)
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

function selectSpOption(btn, group) {
  document
    .querySelectorAll(`.sp-option-btn[data-group="${group}"]`)
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

// Save profile from settings page
async function saveProfile() {
  if (!state.user) return;
  const age = document.getElementById("spAge")?.value?.trim();
  const weight = document.getElementById("spWeight")?.value?.trim();
  const weightUnit = document.getElementById("spWeightUnit")?.value || "kg";
  const height = document.getElementById("spHeight")?.value?.trim();
  const heightUnit = document.getElementById("spHeightUnit")?.value || "cm";
  const bodyType = document.querySelector(
    ".sp-option-btn.active[data-group='bodyType']",
  )?.dataset.value;
  const goal = document.querySelector(
    ".sp-option-btn.active[data-group='goal']",
  )?.dataset.value;
  const activity = document.querySelector(
    ".sp-option-btn.active[data-group='activity']",
  )?.dataset.value;
  const msg = document.getElementById("profileSaveMsg");

  if (!age || !weight || !height || !bodyType || !goal || !activity) {
    if (msg) {
      msg.textContent = "Please fill in all fields.";
      msg.style.color = "#e07a5f";
    }
    return;
  }

  state.user.profile = {
    age: +age,
    weight: +weight,
    weightUnit,
    height: +height,
    heightUnit,
    bodyType,
    goal,
    activity,
  };
  // Clear old AI quests so they get regenerated
  state.user.aiQuests = null;
  saveUserState();

  if (msg) {
    msg.textContent = "Saved! Regenerating your quests...";
    msg.style.color = "var(--green)";
  }
  await generateAIQuests();
  if (msg) {
    msg.textContent = "Profile saved and quests updated ✓";
  }
}

// Populate settings profile fields from saved state
function populateProfileSettings() {
  if (!state.user?.profile) return;
  const p = state.user.profile;
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  };
  set("spAge", p.age);
  set("spWeight", p.weight);
  set("spWeightUnit", p.weightUnit);
  set("spHeight", p.height);
  set("spHeightUnit", p.heightUnit);

  // Activate the right option buttons
  ["bodyType", "goal", "activity"].forEach((group) => {
    const val = p[group];
    if (!val) return;
    document
      .querySelectorAll(`.sp-option-btn[data-group="${group}"]`)
      .forEach((b) => {
        b.classList.toggle("active", b.dataset.value === val);
      });
  });
}

// ══════════════════════════════════════════
// RANKS
// ══════════════════════════════════════════
function getRank(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r;
  }
  return rank;
}

// ══════════════════════════════════════════
// QUESTS
// ══════════════════════════════════════════
function filterQuests(type, btn) {
  state.currentQuestFilter = type;
  document
    .querySelectorAll(".quest-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderQuestsGrid();
}

function renderQuestsGrid() {
  const grid = document.getElementById("questsGrid");
  if (!grid) return;
  const quests = QUESTS[state.currentQuestFilter] || [];
  const completed = state.user ? state.user.completedQuests : new Set();
  grid.innerHTML = quests
    .map((q) => {
      const done = completed.has(q.id);
      return `
      <div class="quest-card ${done ? "completed" : ""}">
        <div class="quest-icon">${q.icon}</div>
        <div class="quest-name">${q.name}</div>
        <div class="quest-desc">${q.desc}</div>
        <div class="quest-meta">
          <div class="quest-reward">⭐ ${q.reward} stars</div>
          <div class="quest-difficulty">${q.difficulty}</div>
        </div>
        <button class="btn-start-quest" ${done || !state.user ? "disabled" : ""} onclick="completeQuest('${q.id}')">
          ${done ? "Completed" : state.user ? "Mark Complete" : "Sign in to track"}
        </button>
      </div>`;
    })
    .join("");
}

// ══════════════════════════════════════════
// CONFETTI BURST
// ══════════════════════════════════════════
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const colors = [
    "#3d7a4f",
    "#6abf7b",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#a855f7",
    "#ec4899",
    "#ffffff",
  ];
  const pieces = Array.from({ length: 140 }, () => ({
    x: Math.random() * canvas.width,
    y: -10 - Math.random() * 200,
    w: 6 + Math.random() * 8,
    h: 10 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 4,
    vy: 2.5 + Math.random() * 3.5,
    opacity: 1,
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.07; // gravity
      p.rotation += p.rotSpeed;
      if (frame > 80) p.opacity -= 0.018;
      if (p.y < canvas.height && p.opacity > 0) alive = true;

      ctx.save();
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (alive) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = "none";
    }
  }
  draw();
}

// ══════════════════════════════════════════
// LEVEL-UP ANIMATION
// ══════════════════════════════════════════
function showLevelUp(newRank) {
  // Remove any existing level-up overlay
  const existing = document.getElementById("levelUpOverlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "levelUpOverlay";
  overlay.innerHTML = `
    <div class="lu-card">
      <div class="lu-rays"></div>
      <div class="lu-content">
        <div class="lu-label">RANK UP!</div>
        <div class="lu-icon">${newRank.icon}</div>
        <div class="lu-name">${newRank.name}</div>
        <div class="lu-desc">${newRank.desc}</div>
        <button class="lu-btn" onclick="document.getElementById('levelUpOverlay').remove()">Keep Going 🔥</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // Inject styles if not already present
  if (!document.getElementById("levelUpStyles")) {
    const style = document.createElement("style");
    style.id = "levelUpStyles";
    style.textContent = `
      #levelUpOverlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.75);
        backdrop-filter: blur(8px);
        animation: lu-fadein 0.4s ease forwards;
      }
      @keyframes lu-fadein { from { opacity:0 } to { opacity:1 } }

      .lu-card {
        position: relative;
        background: var(--surface);
        border: 2px solid var(--green);
        border-radius: 32px;
        padding: 3.5rem 3rem;
        text-align: center;
        max-width: 380px;
        width: 90%;
        box-shadow: 0 0 80px var(--green-glow), 0 24px 64px rgba(0,0,0,0.4);
        animation: lu-popin 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        overflow: hidden;
      }
      @keyframes lu-popin {
        from { transform: scale(0.6); opacity:0; }
        to   { transform: scale(1);   opacity:1; }
      }

      .lu-rays {
        position: absolute;
        inset: 0;
        background: conic-gradient(
          from 0deg,
          transparent 0deg, var(--green-glow) 10deg,
          transparent 20deg, var(--green-glow) 30deg,
          transparent 40deg, var(--green-glow) 50deg,
          transparent 60deg, var(--green-glow) 70deg,
          transparent 80deg, var(--green-glow) 90deg,
          transparent 100deg, var(--green-glow) 110deg,
          transparent 120deg, var(--green-glow) 130deg,
          transparent 140deg, var(--green-glow) 150deg,
          transparent 160deg, var(--green-glow) 170deg,
          transparent 180deg, var(--green-glow) 190deg,
          transparent 200deg, var(--green-glow) 210deg,
          transparent 220deg, var(--green-glow) 230deg,
          transparent 240deg, var(--green-glow) 250deg,
          transparent 260deg, var(--green-glow) 270deg,
          transparent 280deg, var(--green-glow) 290deg,
          transparent 300deg, var(--green-glow) 310deg,
          transparent 320deg, var(--green-glow) 330deg,
          transparent 340deg, var(--green-glow) 350deg,
          transparent 360deg
        );
        animation: lu-spin 8s linear infinite;
        opacity: 0.6;
        pointer-events: none;
      }
      @keyframes lu-spin { to { transform: rotate(360deg); } }

      .lu-content { position: relative; z-index: 1; }

      .lu-label {
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.2em;
        color: var(--green);
        text-transform: uppercase;
        margin-bottom: 1.2rem;
      }
      .lu-icon {
        font-size: 5rem;
        line-height: 1;
        margin-bottom: 0.8rem;
        animation: lu-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;
      }
      @keyframes lu-bounce {
        from { transform: scale(0) rotate(-20deg); }
        to   { transform: scale(1) rotate(0deg); }
      }
      .lu-name {
        font-family: "DM Serif Display", serif;
        font-size: 2.4rem;
        color: var(--text);
        margin-bottom: 0.6rem;
      }
      .lu-desc {
        font-size: 0.88rem;
        color: var(--text-muted);
        line-height: 1.6;
        margin-bottom: 2rem;
      }
      .lu-btn {
        background: var(--green);
        color: white;
        border: none;
        padding: 0.85rem 2.2rem;
        border-radius: 999px;
        font-family: "DM Sans", sans-serif;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .lu-btn:hover {
        background: var(--green-light);
        transform: translateY(-2px);
      }
    `;
    document.head.appendChild(style);
  }

  // Also fire confetti for level-up
  launchConfetti();
}

// ══════════════════════════════════════════
// COMPLETE QUEST
// ══════════════════════════════════════════
function completeQuest(qid) {
  if (!state.user) return;
  if (state.user.completedQuests.has(qid)) return;

  const allQuests = [...QUESTS.daily, ...QUESTS.weekly, ...QUESTS.monthly];
  const q = allQuests.find((x) => x.id === qid);
  if (!q) return;

  // Capture rank before applying XP
  const rankBefore = getRank(state.user.xp);

  state.user.completedQuests.add(qid);
  state.user.stars += q.reward;
  state.user.xp += q.xp;
  state.user.streak = Math.max(state.user.streak, 1);

  // Check for rank-up
  const rankAfter = getRank(state.user.xp);
  const didLevelUp = rankAfter.name !== rankBefore.name;

  updateHeaderStats();
  renderQuestsGrid();
  checkAchievements();
  saveUserState();

  // Confetti on every quest complete
  launchConfetti();

  if (didLevelUp) {
    // Delay level-up screen slightly so confetti fires first
    setTimeout(() => showLevelUp(rankAfter), 600);
  } else {
    const msgEl = document.getElementById("questCompleteMsg");
    if (msgEl)
      msgEl.textContent = `+${q.reward} ⭐ stars and +${q.xp} XP earned!`;
    openModal("questCompleteModal");
  }
}

// ══════════════════════════════════════════
// ACHIEVEMENTS
// ══════════════════════════════════════════
const awardedAch = new Set();

function checkAchievements(repSession) {
  if (!state.user) return;
  const u = state.user;
  ACHIEVEMENTS.forEach((a) => {
    if (a.id === "a1" && u.completedQuests.size >= 1) awardAch(a);
    if (a.id === "a2" && u.completedQuests.size >= 3) awardAch(a);
    if (a.id === "a3" && u.completedQuests.size >= 10) awardAch(a);
    if (a.id === "a4" && u.xp >= 100) awardAch(a);
    if (a.id === "a6" && u.xp >= 500) awardAch(a);
    if (a.id === "a5" && repSession) awardAch(a);
  });
}

function awardAch(a) {
  if (!state.user) return;
  if (awardedAch.has(a.id)) return;
  awardedAch.add(a.id);
  state.user.stars += a.reward;
  state.user.earnedAchievements = [...awardedAch];
  updateHeaderStats();
  renderAchievements();
  showToast("🏆", `Achievement unlocked: ${a.name}! +${a.reward} ⭐`);
  saveUserState();
}

function renderAchievements() {
  const grid = document.getElementById("achievementsGrid");
  const ranksList = document.getElementById("ranksList");
  const xpBar = document.getElementById("xpBar");
  const xpCurrent = document.getElementById("xpCurrent");
  const xpNext = document.getElementById("xpNext");
  const currentRankIcon = document.getElementById("currentRankIcon");
  const currentRankName = document.getElementById("currentRankName");
  const currentRankDesc = document.getElementById("currentRankDesc");

  const xp = state.user ? state.user.xp : 0;
  const currentRank = getRank(xp);
  const currentRankIdx = RANKS.indexOf(currentRank);
  const nextRank = RANKS[currentRankIdx + 1];

  if (currentRankIcon) currentRankIcon.textContent = currentRank.icon;
  if (currentRankName) currentRankName.textContent = currentRank.name;
  if (currentRankDesc) currentRankDesc.textContent = currentRank.desc;

  if (xpCurrent) xpCurrent.textContent = xp;
  if (xpNext) xpNext.textContent = nextRank ? nextRank.minXp : "MAX";
  if (xpBar) {
    const pct = nextRank
      ? Math.min(
          100,
          ((xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) *
            100,
        )
      : 100;
    xpBar.style.width = pct + "%";
  }

  if (ranksList) {
    ranksList.innerHTML = RANKS.map((r) => {
      const achieved = xp >= r.minXp;
      const isCurrent = r.name === currentRank.name;
      return `<div class="rank-item ${isCurrent ? "current" : achieved ? "achieved" : "locked-rank"}">
        <div class="rank-item-icon">${r.icon}</div>
        <div class="rank-item-name">${r.name}</div>
      </div>`;
    }).join("");
  }

  if (grid) {
    grid.innerHTML = ACHIEVEMENTS.map((a) => {
      const unlocked = awardedAch.has(a.id);
      return `<div class="ach-card ${unlocked ? "" : "locked"}">
        <div class="ach-badge ${unlocked ? "" : "locked-badge"}">${unlocked ? "Unlocked" : "Locked"}</div>
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="ach-reward">+${a.reward} ⭐</div>
      </div>`;
    }).join("");
  }
}

// ══════════════════════════════════════════
// TRAINING / QUICKPOSE SIMULATION
// ══════════════════════════════════════════
function selectExercise(name, el, icon) {
  document
    .querySelectorAll(".exercise-card")
    .forEach((c) => c.classList.remove("selected"));
  el.classList.add("selected");
  state.currentExercise = { name, icon };
  const repLabel = document.getElementById("repLabel");
  if (repLabel)
    repLabel.textContent = name === "Plank Hold" ? "seconds" : "reps";
  const btnStart = document.getElementById("btnStart");
  if (btnStart) btnStart.disabled = false;
}

let poseTimer = null;

async function startTracking() {
  if (!state.currentExercise) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    state.webcamStream = stream;
    const video = document.getElementById("webcam");
    if (video) video.srcObject = stream;
    document.getElementById("cameraOverlay")?.classList.add("hidden");
  } catch (e) {
    showToast("📷", "Camera not available — using simulated mode!");
  }

  state.reps = 0;
  state.tracking = true;
  document.getElementById("repCounter").textContent = "0";
  const btnStart = document.getElementById("btnStart");
  if (btnStart) btnStart.style.display = "none";
  document.getElementById("btnStop")?.classList.add("visible");
  const statusEl = document.getElementById("exerciseStatus");
  if (statusEl) {
    statusEl.textContent = "👁️ Tracking... Keep going!";
    statusEl.className = "exercise-status";
  }

  simulateQuickPose();
}

function simulateQuickPose() {
  if (!state.tracking) return;
  const delay = 1800 + Math.random() * 1200;
  poseTimer = setTimeout(() => {
    if (!state.tracking) return;
    state.reps++;
    const isGoodForm = Math.random() > 0.25;
    const statusEl = document.getElementById("exerciseStatus");
    if (statusEl) {
      statusEl.textContent = isGoodForm ? "✅ Good form!" : "⚠️ Fix your form!";
      statusEl.className = isGoodForm
        ? "exercise-status"
        : "exercise-status bad";
    }
    const repCounter = document.getElementById("repCounter");
    if (repCounter) repCounter.textContent = state.reps;
    simulateQuickPose();
  }, delay);
}

function stopTracking() {
  state.tracking = false;
  clearTimeout(poseTimer);
  state.webcamStream?.getTracks().forEach((t) => t.stop());
  state.webcamStream = null;

  document.getElementById("cameraOverlay")?.classList.remove("hidden");
  const btnStart = document.getElementById("btnStart");
  if (btnStart) {
    btnStart.style.display = "inline-block";
    btnStart.disabled = !state.currentExercise;
  }
  document.getElementById("btnStop")?.classList.remove("visible");
  const statusEl = document.getElementById("exerciseStatus");
  if (statusEl) statusEl.textContent = "";

  const reps = state.reps;
  const exercise = state.currentExercise;
  if (reps > 0 && exercise) {
    const entry = { exercise: exercise.name, icon: exercise.icon, reps };
    state.sessionLog.push(entry);
    renderSessionLog();

    if (state.user) {
      const earned = Math.floor(reps * 2);
      const rankBefore = getRank(state.user.xp);
      state.user.stars += earned;
      state.user.xp += Math.floor(reps * 1.5);
      const rankAfter = getRank(state.user.xp);
      updateHeaderStats();
      launchConfetti();
      if (rankAfter.name !== rankBefore.name) {
        setTimeout(() => showLevelUp(rankAfter), 600);
      }
      showToast(
        "🏋️",
        `Session done! +${earned} ⭐ for ${reps} ${exercise.name}`,
      );
      if (reps >= 50) checkAchievements(true);
      saveUserState();
    } else {
      showToast(
        "🏋️",
        `${reps} ${exercise.name} done! Sign in to save progress.`,
      );
    }
  }
  state.reps = 0;
  const repCounter = document.getElementById("repCounter");
  if (repCounter) repCounter.textContent = "0";
}

function renderSessionLog() {
  const log = document.getElementById("sessionLog");
  const items = document.getElementById("sessionLogItems");
  if (!log || !items) return;
  log.style.display = "block";
  items.innerHTML = state.sessionLog
    .slice()
    .reverse()
    .map(
      (e) =>
        `<div class="log-item"><span>${e.icon} ${e.exercise}</span><span class="log-reps">${e.reps} ${
          e.exercise === "Plank Hold" ? "sec" : "reps"
        }</span></div>`,
    )
    .join("");
}

// ══════════════════════════════════════════
// SOCIAL SYSTEM
// ══════════════════════════════════════════

// Get public profile of any user (safe — no password)
function getPublicProfile(username) {
  const saved = localStorage.getItem(`hq_user_${username}`);
  if (!saved) return null;
  const d = JSON.parse(saved);
  return {
    username,
    name: d.name || username,
    xp: d.xp || 0,
    stars: d.stars || 0,
    streak: d.streak || 0,
    completedQuests: Array.isArray(d.completedQuests)
      ? d.completedQuests.length
      : 0,
    rank: getRank(d.xp || 0),
  };
}

// Get all registered usernames
function getAllUsernames() {
  const accounts = JSON.parse(localStorage.getItem("hq_accounts") || "{}");
  return Object.keys(accounts);
}

// Social data helpers — stored per user
function getSocialData(username) {
  const raw = localStorage.getItem(`hq_social_${username}`);
  return raw
    ? JSON.parse(raw)
    : { friends: [], incoming: [], outgoing: [], nudges: [] };
}

function saveSocialData(username, data) {
  localStorage.setItem(`hq_social_${username}`, JSON.stringify(data));
}

// Send friend request
function sendFriendRequest(toUsername) {
  if (!state.user) return;
  const me = state.user.username;
  if (toUsername === me) {
    showToast("😅", "You can't add yourself!");
    return;
  }

  const myData = getSocialData(me);
  const theirData = getSocialData(toUsername);

  if (myData.friends.includes(toUsername)) {
    showToast("👥", "Already friends!");
    return;
  }
  if (myData.outgoing.includes(toUsername)) {
    showToast("⏳", "Request already sent!");
    return;
  }
  if (theirData.incoming.includes(me)) {
    showToast("⏳", "Request already sent!");
    return;
  }

  // If they already sent us a request, auto-accept
  if (myData.incoming.includes(toUsername)) {
    acceptFriendRequest(toUsername);
    return;
  }

  myData.outgoing.push(toUsername);
  theirData.incoming.push(me);
  saveSocialData(me, myData);
  saveSocialData(toUsername, theirData);

  showToast("📨", `Friend request sent to ${toUsername}!`);
  renderFriendsList();
  renderPendingRequests();
  updateFriendBadge();
}

// Accept friend request
function acceptFriendRequest(fromUsername) {
  if (!state.user) return;
  const me = state.user.username;
  const myData = getSocialData(me);
  const theirData = getSocialData(fromUsername);

  myData.incoming = myData.incoming.filter((u) => u !== fromUsername);
  theirData.outgoing = theirData.outgoing.filter((u) => u !== me);

  if (!myData.friends.includes(fromUsername)) myData.friends.push(fromUsername);
  if (!theirData.friends.includes(me)) theirData.friends.push(me);

  saveSocialData(me, myData);
  saveSocialData(fromUsername, theirData);

  showToast("🎉", `You and ${fromUsername} are now friends!`);
  renderFriendsList();
  renderPendingRequests();
  updateFriendBadge();
}

// Decline friend request
function declineFriendRequest(fromUsername) {
  if (!state.user) return;
  const me = state.user.username;
  const myData = getSocialData(me);
  const theirData = getSocialData(fromUsername);

  myData.incoming = myData.incoming.filter((u) => u !== fromUsername);
  theirData.outgoing = theirData.outgoing.filter((u) => u !== me);

  saveSocialData(me, myData);
  saveSocialData(fromUsername, theirData);

  renderPendingRequests();
  updateFriendBadge();
}

// Remove friend
function removeFriend(username) {
  if (!state.user) return;
  const me = state.user.username;
  const myData = getSocialData(me);
  const theirData = getSocialData(username);

  myData.friends = myData.friends.filter((u) => u !== username);
  theirData.friends = theirData.friends.filter((u) => u !== me);

  saveSocialData(me, myData);
  saveSocialData(username, theirData);

  showToast("👋", `Removed ${username} from friends.`);
  renderFriendsList();
}

// Update notification badge on nav
function updateFriendBadge() {
  const badge = document.getElementById("friendBadge");
  if (!badge || !state.user) return;
  const myData = getSocialData(state.user.username);
  const count = myData.incoming.length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

// Search users
function searchUsers() {
  const input = document.getElementById("userSearchInput");
  const results = document.getElementById("searchResults");
  if (!input || !results || !state.user) return;

  const query = input.value.trim().toLowerCase();
  if (!query) {
    results.innerHTML = "";
    return;
  }

  const me = state.user.username;
  const myData = getSocialData(me);
  const allUsers = getAllUsernames().filter(
    (u) => u !== me && u.includes(query),
  );

  if (allUsers.length === 0) {
    results.innerHTML = `<div class="search-empty">No users found for "${query}"</div>`;
    return;
  }

  results.innerHTML = allUsers
    .map((u) => {
      const profile = getPublicProfile(u);
      if (!profile) return "";
      const isFriend = myData.friends.includes(u);
      const isPending = myData.outgoing.includes(u);
      const hasRequested = myData.incoming.includes(u);
      let btn = "";
      if (isFriend)
        btn = `<button class="social-btn friend-btn" disabled>✓ Friends</button>`;
      else if (isPending)
        btn = `<button class="social-btn pending-btn" disabled>⏳ Pending</button>`;
      else if (hasRequested)
        btn = `<button class="social-btn accept-btn" onclick="acceptFriendRequest('${u}');searchUsers()">Accept</button>`;
      else
        btn = `<button class="social-btn add-btn" onclick="sendFriendRequest('${u}');searchUsers()">+ Add</button>`;

      return `<div class="search-result-card">
      <div class="sr-avatar">${profile.name[0].toUpperCase()}</div>
      <div class="sr-info">
        <div class="sr-name">${profile.name}</div>
        <div class="sr-username">@${u}</div>
        <div class="sr-stats">${profile.rank.icon} ${profile.rank.name} · 🔥 ${profile.streak} · ⭐ ${profile.stars}</div>
      </div>
      ${btn}
    </div>`;
    })
    .join("");
}

// Render friends list
function renderFriendsList() {
  const container = document.getElementById("friendsList");
  if (!container || !state.user) return;

  const myData = getSocialData(state.user.username);
  if (myData.friends.length === 0) {
    container.innerHTML = `<div class="social-empty">No friends yet. Search for users above to get started! 👆</div>`;
    return;
  }

  const friends = myData.friends
    .map((u) => getPublicProfile(u))
    .filter(Boolean)
    .sort((a, b) => b.xp - a.xp);

  container.innerHTML = friends
    .map(
      (f, i) => `
    <div class="friend-card">
      <div class="friend-rank-num">#${i + 1}</div>
      <div class="friend-avatar">${f.name[0].toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${f.name} <span class="friend-username">@${f.username}</span></div>
        <div class="friend-stats">
          ${f.rank.icon} ${f.rank.name} &nbsp;·&nbsp; 🔥 ${f.streak} day streak &nbsp;·&nbsp; ✅ ${f.completedQuests} quests
        </div>
        <div class="friend-xp-bar-wrap">
          <div class="friend-xp-bar" style="width:${Math.min(100, (f.xp / 2000) * 100)}%"></div>
        </div>
      </div>
      <div class="friend-stars">⭐ ${f.stars}</div>
      <button class="social-btn remove-btn" onclick="removeFriend('${f.username}')">✕</button>
    </div>
  `,
    )
    .join("");
}

// Render pending requests
function renderPendingRequests() {
  const container = document.getElementById("pendingRequests");
  if (!container || !state.user) return;

  const myData = getSocialData(state.user.username);
  if (myData.incoming.length === 0) {
    container.innerHTML = `<div class="social-empty">No pending requests.</div>`;
    return;
  }

  container.innerHTML = myData.incoming
    .map((u) => {
      const profile = getPublicProfile(u);
      if (!profile) return "";
      return `<div class="request-card">
      <div class="friend-avatar">${profile.name[0].toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${profile.name} <span class="friend-username">@${u}</span></div>
        <div class="friend-stats">${profile.rank.icon} ${profile.rank.name} · ⭐ ${profile.stars}</div>
      </div>
      <button class="social-btn accept-btn" onclick="acceptFriendRequest('${u}')">✓ Accept</button>
      <button class="social-btn decline-btn" onclick="declineFriendRequest('${u}')">✕</button>
    </div>`;
    })
    .join("");
}

// Render leaderboard
function renderLeaderboard(filterFriends = false) {
  const container = document.getElementById("leaderboardList");
  if (!container) return;

  const all = getAllUsernames();
  let users = all.map((u) => getPublicProfile(u)).filter(Boolean);

  if (filterFriends && state.user) {
    const myData = getSocialData(state.user.username);
    const friendSet = new Set([...myData.friends, state.user.username]);
    users = users.filter((u) => friendSet.has(u.username));
  }

  users.sort((a, b) => b.xp - a.xp);

  if (users.length === 0) {
    container.innerHTML = `<div class="social-empty">No users to show yet.</div>`;
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  container.innerHTML = users
    .map((u, i) => {
      const isMe = state.user && u.username === state.user.username;
      return `<div class="lb-card ${isMe ? "lb-me" : ""}">
      <div class="lb-pos">${medals[i] || `#${i + 1}`}</div>
      <div class="friend-avatar">${u.name[0].toUpperCase()}</div>
      <div class="friend-info">
        <div class="friend-name">${u.name} ${isMe ? "<span class='lb-you'>you</span>" : ""}</div>
        <div class="friend-stats">${u.rank.icon} ${u.rank.name} · 🔥 ${u.streak} · ✅ ${u.completedQuests} quests</div>
      </div>
      <div class="friend-stars">⭐ ${u.stars}<br><span style="font-size:0.72rem;color:var(--text-muted)">${u.xp} XP</span></div>
    </div>`;
    })
    .join("");
}

function switchLeaderboard(type, btn) {
  document
    .querySelectorAll(".lb-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderLeaderboard(type === "friends");
}

// ══════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("visible");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("visible");
}

// Close modal when clicking the overlay background
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("visible");
  }
});

function toggleSignMode() {
  const signIn = document.getElementById("signInView");
  const signUp = document.getElementById("signUpView");
  if (!signIn || !signUp) return;
  const showingSignIn = signIn.style.display !== "none";
  signIn.style.display = showingSignIn ? "none" : "block";
  signUp.style.display = showingSignIn ? "block" : "none";
}

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
let toastTimer = null;

function showToast(icon, msg) {
  const toast = document.getElementById("toast");
  const toastIcon = document.getElementById("toastIcon");
  const toastMsg = document.getElementById("toastMsg");
  if (!toast) return;
  if (toastIcon) toastIcon.textContent = icon;
  if (toastMsg) toastMsg.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ══════════════════════════════════════════
// THEME
// ══════════════════════════════════════════
function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("hq_theme", theme);

  const lightBtn = document.getElementById("themeLight");
  const darkBtn = document.getElementById("themeDark");
  if (lightBtn) lightBtn.classList.toggle("active", theme === "light");
  if (darkBtn) darkBtn.classList.toggle("active", theme === "dark");
}

// ══════════════════════════════════════════
// CANVAS BACKGROUND
// ══════════════════════════════════════════
function initCanvas() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, particles;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeParticles() {
    particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 1.5 + Math.random() * 3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: 0.12 + Math.random() * 0.2,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark";
    const color = isDark ? "106,191,123" : "61,122,79";
    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize();
  makeParticles();
  draw();
  window.addEventListener("resize", () => {
    resize();
    makeParticles();
  });
}

// ══════════════════════════════════════════
// INIT — runs on every page load
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  // Inject shared styles for body profile modal step + quest spinner
  if (!document.getElementById("hqSharedStyles")) {
    const s = document.createElement("style");
    s.id = "hqSharedStyles";
    s.textContent = `
      /* Body profile step inside modal */
      #bodyProfileView { display: none; }
      .bp-section-label {
        font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
        text-transform: uppercase; color: var(--text-muted); margin: 1.2rem 0 0.6rem;
      }
      .bp-options {
        display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.4rem;
      }
      .bp-option-btn, .sp-option-btn {
        background: var(--surface2); border: 2px solid var(--card-border);
        border-radius: 10px; padding: 0.5rem 0.9rem;
        font-family: "DM Sans", sans-serif; font-size: 0.82rem; font-weight: 600;
        color: var(--text-muted); cursor: pointer; transition: all 0.2s;
      }
      .bp-option-btn:hover, .sp-option-btn:hover { border-color: var(--green); color: var(--green); }
      .bp-option-btn.active, .sp-option-btn.active {
        background: var(--green-glow); border-color: var(--green); color: var(--green);
      }
      .bp-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
      .bp-row .form-group { flex: 1; margin-bottom: 0; }
      .bp-row select, .sp-row select {
        width: 100%; padding: 0.65rem 0.75rem; border-radius: 12px;
        border: 1.5px solid var(--card-border); background: var(--input-bg);
        font-family: "DM Sans", sans-serif; font-size: 0.88rem; color: var(--text);
        outline: none; transition: border-color 0.2s;
      }
      .bp-row select:focus, .sp-row select:focus { border-color: var(--green); }
      .bp-scroll { max-height: 65vh; overflow-y: auto; padding-right: 4px; }
      .bp-scroll::-webkit-scrollbar { width: 4px; }
      .bp-scroll::-webkit-scrollbar-thumb { background: var(--card-border); border-radius: 4px; }

      /* Quest generating state */
      .quest-generating {
        grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;
        display: flex; flex-direction: column; align-items: center; gap: 1rem;
        color: var(--text-muted); font-size: 0.9rem;
      }
      .quest-gen-spinner {
        width: 44px; height: 44px; border-radius: 50%;
        border: 3px solid var(--card-border);
        border-top-color: var(--green);
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }

      /* Settings profile section */
      .sp-row { display: flex; gap: 0.75rem; margin-bottom: 1rem; align-items: flex-end; }
      .sp-row .form-group { flex: 1; margin-bottom: 0; }
      #profileSaveMsg { font-size: 0.82rem; margin-top: 0.75rem; min-height: 1.2em; }

      /* Social system */
      .social-empty { color:var(--text-muted); font-size:0.88rem; padding:2rem; text-align:center; }
      .search-result-card, .friend-card, .request-card, .lb-card {
        display:flex; align-items:center; gap:1rem; padding:1rem 1.2rem;
        background:var(--card); border:1px solid var(--card-border); border-radius:16px;
        margin-bottom:0.75rem; transition:transform 0.2s,box-shadow 0.2s;
      }
      .friend-card:hover,.lb-card:hover { transform:translateY(-2px); box-shadow:var(--shadow); }
      .lb-me { border-color:var(--green); background:var(--green-glow); }
      .friend-avatar,.sr-avatar {
        width:44px; height:44px; min-width:44px; border-radius:50%;
        background:linear-gradient(135deg,var(--green),var(--green-light));
        display:flex; align-items:center; justify-content:center;
        font-weight:700; font-size:1.1rem; color:white;
      }
      .friend-info { flex:1; min-width:0; }
      .friend-name { font-weight:700; font-size:0.92rem; color:var(--text); }
      .friend-username { font-weight:400; font-size:0.78rem; color:var(--text-muted); }
      .friend-stats { font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem; }
      .friend-stars { font-size:0.88rem; font-weight:700; color:var(--text); text-align:right; white-space:nowrap; }
      .friend-xp-bar-wrap { height:4px; background:var(--card-border); border-radius:99px; margin-top:0.5rem; }
      .friend-xp-bar { height:100%; background:var(--green); border-radius:99px; transition:width 0.6s ease; }
      .friend-rank-num { font-size:0.8rem; font-weight:700; color:var(--text-muted); min-width:24px; }
      .lb-pos { font-size:1.4rem; min-width:32px; text-align:center; }
      .lb-you { background:var(--green); color:white; font-size:0.65rem; font-weight:700; padding:0.1rem 0.4rem; border-radius:99px; margin-left:0.4rem; vertical-align:middle; }
      .sr-info { flex:1; }
      .sr-name { font-weight:700; font-size:0.9rem; color:var(--text); }
      .sr-username { font-size:0.78rem; color:var(--text-muted); }
      .sr-stats { font-size:0.78rem; color:var(--text-muted); margin-top:0.2rem; }
      .search-empty { color:var(--text-muted); font-size:0.85rem; padding:1rem; text-align:center; }
      .social-btn { border:none; border-radius:99px; padding:0.45rem 1rem; font-family:"DM Sans",sans-serif; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all 0.2s; white-space:nowrap; }
      .add-btn { background:var(--green); color:white; }
      .add-btn:hover { background:var(--green-light); }
      .accept-btn { background:var(--green); color:white; }
      .decline-btn,.remove-btn { background:var(--surface2); color:var(--text-muted); }
      .decline-btn:hover,.remove-btn:hover { background:#fee2e2; color:#dc2626; }
      .friend-btn,.pending-btn { background:var(--surface2); color:var(--text-muted); cursor:default; }
      .friend-badge { display:none; align-items:center; justify-content:center; background:#ef4444; color:white; font-size:0.65rem; font-weight:800; width:16px; height:16px; border-radius:50%; margin-left:4px; vertical-align:middle; }
      .lb-tab-btn { background:var(--surface2); border:1px solid var(--card-border); border-radius:99px; padding:0.45rem 1.2rem; font-family:"DM Sans",sans-serif; font-size:0.85rem; font-weight:600; cursor:pointer; color:var(--text-muted); transition:all 0.2s; }
      .lb-tab-btn.active { background:var(--green); color:white; border-color:var(--green); }
    `;
    document.head.appendChild(s);
  }

  // Restore theme
  const savedTheme = localStorage.getItem("hq_theme") || "light";
  setTheme(savedTheme);

  // Restore session
  const lastUser = localStorage.getItem("hq_active_user");
  if (lastUser) {
    const acc = getAccount(lastUser);
    if (acc) {
      state.user = loadUserState(lastUser) || acc.data;
      state.user.completedQuests =
        state.user.completedQuests instanceof Set
          ? state.user.completedQuests
          : new Set(state.user.completedQuests || []);

      awardedAch.clear();
      if (state.user.earnedAchievements) {
        state.user.earnedAchievements.forEach((id) => awardedAch.add(id));
      }

      afterSignIn();
    }
  }

  // Always render these so pages show content even when not signed in
  renderQuestsGrid();
  renderAchievements();

  // Start canvas
  initCanvas();
}); 