// ══════════════════════════════════════════
// STATE
// ══════════════════════════════════════════
const state = {
  user: null, // { name, username, stars, xp, streak, completedQuests: Set }
  currentExercise: null,
  reps: 0,
  tracking: false,
  webcamStream: null,
  sessionLog: [],
  currentQuestFilter: "daily",
};

// Simulated user DB (in-memory)
const userDB = {};

// ══════════════════════════════════════════
// DATA
// ══════════════════════════════════════════
const QUESTS = {
  daily: [
    {
      id: "d1",
      name: "10 Push-Ups",
      icon: "💪",
      desc: "Complete 10 push-ups with good form.",
      reward: 15,
      difficulty: "Easy",
      xp: 20,
    },
    {
      id: "d2",
      name: "Walk 5k Steps",
      icon: "🚶",
      desc: "Hit 5,000 steps today. Every step counts!",
      reward: 10,
      difficulty: "Easy",
      xp: 15,
    },
    {
      id: "d3",
      name: "20 Squats",
      icon: "🦵",
      desc: "Drop low! Complete 20 bodyweight squats.",
      reward: 15,
      difficulty: "Medium",
      xp: 20,
    },
    {
      id: "d4",
      name: "5-min Stretch",
      icon: "🧘",
      desc: "Spend 5 minutes stretching your body.",
      reward: 8,
      difficulty: "Easy",
      xp: 10,
    },
  ],
  weekly: [
    {
      id: "w1",
      name: "3-Day Workout Streak",
      icon: "🔥",
      desc: "Complete any workout 3 days in a row this week.",
      reward: 50,
      difficulty: "Medium",
      xp: 60,
    },
    {
      id: "w2",
      name: "100 Push-Ups Total",
      icon: "💪",
      desc: "Accumulate 100 push-ups across the week.",
      reward: 60,
      difficulty: "Hard",
      xp: 80,
    },
    {
      id: "w3",
      name: "Hydration Week",
      icon: "💧",
      desc: "Drink 8 glasses of water every day this week.",
      reward: 40,
      difficulty: "Medium",
      xp: 50,
    },
  ],
  monthly: [
    {
      id: "m1",
      name: "30-Day Streak",
      icon: "🏆",
      desc: "Complete at least one quest every single day for 30 days.",
      reward: 200,
      difficulty: "Legendary",
      xp: 250,
    },
    {
      id: "m2",
      name: "Master Trainer",
      icon: "🥋",
      desc: "Complete 50 training sessions this month.",
      reward: 150,
      difficulty: "Hard",
      xp: 180,
    },
  ],
};

const ACHIEVEMENTS = [
  {
    id: "a1",
    name: "First Step",
    icon: "👟",
    desc: "Complete your very first quest.",
    reward: 10,
    xpReq: 0,
    questReq: 1,
  },
  {
    id: "a2",
    name: "On Fire",
    icon: "🔥",
    desc: "Maintain a 3-day streak.",
    reward: 25,
    xpReq: 30,
    questReq: 3,
  },
  {
    id: "a3",
    name: "Iron Will",
    icon: "⚙️",
    desc: "Complete 10 quests total.",
    reward: 50,
    xpReq: 100,
    questReq: 10,
  },
  {
    id: "a4",
    name: "Centurion",
    icon: "🛡️",
    desc: "Earn 100 XP.",
    reward: 30,
    xpReq: 100,
    questReq: 0,
  },
  {
    id: "a5",
    name: "Rep Beast",
    icon: "💪",
    desc: "Do 50 reps in a single training session.",
    reward: 40,
    xpReq: 0,
    questReq: 0,
    repReq: 50,
  },
  {
    id: "a6",
    name: "Legend",
    icon: "⭐",
    desc: "Earn 500 XP total.",
    reward: 100,
    xpReq: 500,
    questReq: 0,
  },
];

const RANKS = [
  { name: "Seedling", icon: "🌱", minXp: 0, maxXp: 100 },
  { name: "Sprout", icon: "🌿", minXp: 100, maxXp: 250 },
  { name: "Warrior", icon: "⚔️", minXp: 250, maxXp: 500 },
  { name: "Champion", icon: "🏅", minXp: 500, maxXp: 1000 },
  { name: "Legend", icon: "👑", minXp: 1000, maxXp: 99999 },
];

// ══════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════
function signIn() {
  const username = document.getElementById("siUsername").value.trim();
  const password = document.getElementById("siPassword").value;
  const err = document.getElementById("siError");
  if (!username || !password) {
    err.textContent = "Please fill in all fields.";
    return;
  }
  if (!userDB[username] || userDB[username].password !== password) {
    err.textContent = "Invalid username or password.";
    return;
  }
  err.textContent = "";
  state.user = userDB[username].data;
  afterSignIn();
  closeModal("signModal");
  showToast("👋", `Welcome back, ${state.user.name}!`);
}

function signUp() {
  const name = document.getElementById("suName").value.trim();
  const username = document
    .getElementById("suUsername")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("suPassword").value;
  const err = document.getElementById("suError");
  if (!name || !username || !password) {
    err.textContent = "Please fill in all fields.";
    return;
  }
  if (userDB[username]) {
    err.textContent = "Username already taken.";
    return;
  }
  if (password.length < 4) {
    err.textContent = "Password too short (min 4 chars).";
    return;
  }
  err.textContent = "";
  const userData = {
    name,
    username,
    stars: 0,
    xp: 0,
    streak: 1,
    completedQuests: new Set(),
  };
  userDB[username] = { password, data: userData };
  state.user = userData;
  afterSignIn();
  closeModal("signModal");
  showToast("🎉", `Welcome to HealthQuest, ${name}!`);
}

function afterSignIn() {
  const u = state.user;
  document.getElementById("signinBtn").style.display = "none";
  document.getElementById("userStats").classList.add("visible");
  document.getElementById("avatarBtn").classList.add("visible");
  document.getElementById("avatarBtn").textContent = u.name[0].toUpperCase();
  document.getElementById("signoutBtn").style.display = "inline-block";
  document.getElementById("settingsSignBtn").textContent = "Signed In ✓";
  document.getElementById("settingsSignBtn").disabled = true;
  document.getElementById("settingsAccountDesc").textContent =
    `Signed in as ${u.username}`;
  updateHeaderStats();
  renderQuestsGrid();
  renderAchievements();
}

function signOut() {
  state.user = null;
  document.getElementById("signinBtn").style.display = "inline-block";
  document.getElementById("userStats").classList.remove("visible");
  document.getElementById("avatarBtn").classList.remove("visible");
  document.getElementById("signoutBtn").style.display = "none";
  document.getElementById("settingsSignBtn").textContent = "Sign In";
  document.getElementById("settingsSignBtn").disabled = false;
  document.getElementById("settingsAccountDesc").textContent = "Not signed in";
  document.getElementById("siUsername").value = "";
  document.getElementById("siPassword").value = "";
  renderQuestsGrid();
  showToast("👋", "Signed out. See you soon!");
}

function updateHeaderStats() {
  if (!state.user) return;
  const rank = getRank(state.user.xp);
  document.getElementById("headerStreak").textContent = state.user.streak;
  document.getElementById("headerStars").textContent = state.user.stars;
  document.getElementById("headerRank").textContent = rank.name;
}

// ══════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════
function showPage(id, btn) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-tab")
    .forEach((t) => t.classList.remove("active"));
  document.getElementById("page-" + id).classList.add("active");
  if (btn) btn.classList.add("active");
  else {
    document.querySelectorAll(".nav-tab").forEach((t) => {
      if (t.textContent.toLowerCase().startsWith(id.toLowerCase()))
        t.classList.add("active");
    });
  }
  if (id === "quests") renderQuestsGrid();
  if (id === "achievements") renderAchievements();
}

// ══════════════════════════════════════════
// QUESTS
// ══════════════════════════════════════════
function filterQuests(type, btn) {
  state.currentQuestFilter = type;
  document
    .querySelectorAll(".quest-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderQuestsGrid();
}

function renderQuestsGrid() {
  const grid = document.getElementById("questsGrid");
  const quests = QUESTS[state.currentQuestFilter];
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
      </div>
    `;
    })
    .join("");
}

function completeQuest(qid) {
  if (!state.user || state.user.completedQuests.has(qid)) return;
  const allQ = [...QUESTS.daily, ...QUESTS.weekly, ...QUESTS.monthly];
  const q = allQ.find((x) => x.id === qid);
  if (!q) return;
  state.user.completedQuests.add(qid);
  state.user.stars += q.reward;
  state.user.xp += q.xp;
  state.user.streak = Math.max(state.user.streak, 1);
  updateHeaderStats();
  renderQuestsGrid();
  checkAchievements();
  document.getElementById("questCompleteMsg").textContent =
    `+${q.reward} ⭐ stars and +${q.xp} XP earned!`;
  openModal("questCompleteModal");
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
  document.getElementById("repLabel").textContent =
    name === "Plank Hold" ? "seconds" : "reps";
  document.getElementById("btnStart").disabled = false;
}

async function startTracking() {
  if (!state.currentExercise) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    state.webcamStream = stream;
    const video = document.getElementById("webcam");
    video.srcObject = stream;
    document.getElementById("cameraOverlay").classList.add("hidden");
  } catch (e) {
    showToast("📷", "Camera not available — using simulated mode!");
  }

  state.reps = 0;
  state.tracking = true;
  document.getElementById("repCounter").textContent = "0";
  document.getElementById("btnStart").style.display = "none";
  document.getElementById("btnStop").classList.add("visible");
  document.getElementById("exerciseStatus").textContent =
    "👁️ Tracking... Keep going!";
  document.getElementById("exerciseStatus").className = "exercise-status";

  // QuickPose API simulation — in production, replace with real QuickPose SDK calls
  // QuickPose detects pose landmarks and counts reps based on joint angle thresholds
  simulateQuickPose();
}

function simulateQuickPose() {
  if (!state.tracking) return;
  const delay = 1800 + Math.random() * 1200;
  setTimeout(() => {
    if (!state.tracking) return;
    state.reps++;
    const isGoodForm = Math.random() > 0.25;
    document.getElementById("repCounter").textContent = state.reps;
    const statusEl = document.getElementById("exerciseStatus");
    if (isGoodForm) {
      statusEl.textContent = "✅ Good form!";
      statusEl.className = "exercise-status";
    } else {
      statusEl.textContent = "⚠️ Fix your form!";
      statusEl.className = "exercise-status bad";
    }
    simulateQuickPose();
  }, delay);
}

function stopTracking() {
  state.tracking = false;
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach((t) => t.stop());
    state.webcamStream = null;
  }
  document.getElementById("cameraOverlay").classList.remove("hidden");
  document.getElementById("btnStart").style.display = "inline-block";
  document.getElementById("btnStart").disabled = !state.currentExercise;
  document.getElementById("btnStop").classList.remove("visible");
  document.getElementById("exerciseStatus").textContent = "";

  const reps = state.reps;
  const exercise = state.currentExercise;
  if (reps > 0 && exercise) {
    const entry = { exercise: exercise.name, icon: exercise.icon, reps };
    state.sessionLog.push(entry);
    renderSessionLog();

    if (state.user) {
      const earned = Math.floor(reps * 2);
      state.user.stars += earned;
      state.user.xp += Math.floor(reps * 1.5);
      updateHeaderStats();
      showToast(
        "🏋️",
        `Session done! +${earned} ⭐ for ${reps} ${exercise.name}`,
      );
      if (reps >= 50) checkAchievements(true);
    } else {
      showToast(
        "🏋️",
        `${reps} ${exercise.name} done! Sign in to save progress.`,
      );
    }
  }
  state.reps = 0;
  document.getElementById("repCounter").textContent = "0";
}

function renderSessionLog() {
  const log = document.getElementById("sessionLog");
  const items = document.getElementById("sessionLogItems");
  log.style.display = "block";
  items.innerHTML = state.sessionLog
    .slice()
    .reverse()
    .map(
      (e) =>
        `<div class="log-item"><span>${e.icon} ${e.exercise}</span><span class="log-reps">${e.reps} ${e.exercise === "Plank Hold" ? "sec" : "reps"}</span></div>`,
    )
    .join("");
}

// ══════════════════════════════════════════
// ACHIEVEMENTS & RANKS
// ══════════════════════════════════════════
function getRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) return RANKS[i];
  }
  return RANKS[0];
}

function renderAchievements() {
  const u = state.user;
  const rank = u ? getRank(u.xp) : RANKS[0];
  const rankIdx = RANKS.indexOf(rank);
  const nextRank = RANKS[rankIdx + 1];
  const xpInRank = u ? u.xp - rank.minXp : 0;
  const xpForNext = nextRank ? nextRank.minXp - rank.minXp : 999;
  const pct = nextRank ? Math.min((xpInRank / xpForNext) * 100, 100) : 100;

  document.getElementById("currentRankIcon").textContent = rank.icon;
  document.getElementById("currentRankName").textContent = rank.name;
  document.getElementById("currentRankDesc").textContent =
    rank.name === "Legend"
      ? "You are at the pinnacle. A true champion."
      : `Keep earning XP to reach ${nextRank ? nextRank.name : "max"}`;
  document.getElementById("xpCurrent").textContent = u ? xpInRank : 0;
  document.getElementById("xpNext").textContent = xpForNext;
  document.getElementById("xpBar").style.width = pct + "%";

  const ranksList = document.getElementById("ranksList");
  ranksList.innerHTML = RANKS.map((r, i) => {
    const achieved = u && u.xp >= r.minXp;
    const isCurrent = achieved && (!RANKS[i + 1] || u.xp < RANKS[i + 1].minXp);
    return `<div class="rank-item ${isCurrent ? "current" : achieved ? "achieved" : "locked-rank"}">
        <div class="rank-item-icon">${r.icon}</div>
        <div class="rank-item-name">${r.name}</div>
      </div>`;
  }).join("");

  const completedCount = u ? u.completedQuests.size : 0;
  const xp = u ? u.xp : 0;
  const maxReps = state.sessionLog.reduce((max, s) => Math.max(max, s.reps), 0);
  const grid = document.getElementById("achievementsGrid");
  grid.innerHTML = ACHIEVEMENTS.map((a) => {
    const unlocked =
      u &&
      completedCount >= (a.questReq || 0) &&
      xp >= (a.xpReq || 0) &&
      maxReps >= (a.repReq || 0);
    return `<div class="ach-card ${unlocked ? "" : "locked"}">
        <div class="${unlocked ? "ach-badge" : "ach-badge locked-badge"}">${unlocked ? "✓ Unlocked" : "🔒 Locked"}</div>
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="ach-reward">⭐ +${a.reward} stars</div>
      </div>`;
  }).join("");
}

function checkAchievements(repSession) {
  if (!state.user) return;
  const u = state.user;
  ACHIEVEMENTS.forEach((a) => {
    if (a.id === "a1" && u.completedQuests.size >= 1) awardAch(a);
    if (a.id === "a3" && u.completedQuests.size >= 10) awardAch(a);
    if (a.id === "a4" && u.xp >= 100) awardAch(a);
    if (a.id === "a6" && u.xp >= 500) awardAch(a);
    if (a.id === "a5" && repSession) awardAch(a);
  });
}

const awardedAch = new Set();
function awardAch(a) {
  if (awardedAch.has(a.id)) return;
  awardedAch.add(a.id);
  state.user.stars += a.reward;
  updateHeaderStats();
  showToast("🏆", `Achievement unlocked: ${a.name}! +${a.reward} ⭐`);
}

// ══════════════════════════════════════════
// THEME
// ══════════════════════════════════════════
function setTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  document
    .getElementById("themeLight")
    .classList.toggle("active", t === "light");
  document.getElementById("themeDark").classList.toggle("active", t === "dark");
}

// ══════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════
function openModal(id) {
  document.getElementById(id).classList.add("visible");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("visible");
  document.getElementById("siError") &&
    (document.getElementById("siError").textContent = "");
  document.getElementById("suError") &&
    (document.getElementById("suError").textContent = "");
}
function toggleSignMode() {
  const si = document.getElementById("signInView");
  const su = document.getElementById("signUpView");
  const siVisible = si.style.display !== "none";
  si.style.display = siVisible ? "none" : "block";
  su.style.display = siVisible ? "block" : "none";
}
document.querySelectorAll(".modal-overlay").forEach((o) => {
  o.addEventListener("click", (e) => {
    if (e.target === o) closeModal(o.id);
  });
});

// ══════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════
let toastTimer;
function showToast(icon, msg) {
  clearTimeout(toastTimer);
  document.getElementById("toastIcon").textContent = icon;
  document.getElementById("toastMsg").textContent = msg;
  const t = document.getElementById("toast");
  t.classList.add("show");
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

// ══════════════════════════════════════════
// CANVAS BACKGROUND
// ══════════════════════════════════════════
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let W, H;
const stagesLight = [
  { base: [245, 240, 232], o1: [180, 220, 190], o2: [255, 235, 160] },
  { base: [236, 245, 238], o1: [120, 200, 140], o2: [200, 235, 210] },
  { base: [232, 240, 250], o1: [160, 195, 240], o2: [190, 230, 200] },
  { base: [245, 235, 248], o1: [210, 175, 230], o2: [150, 210, 170] },
];
const stagesDark = [
  { base: [13, 20, 14], o1: [20, 50, 28], o2: [30, 45, 20] },
  { base: [10, 22, 12], o1: [15, 45, 25], o2: [25, 40, 18] },
  { base: [12, 18, 22], o1: [18, 35, 48], o2: [20, 45, 30] },
  { base: [18, 12, 22], o1: [35, 20, 45], o2: [20, 42, 28] },
];
let o1x = 0.2,
  o1y = 0.25,
  v1x = 0.00014,
  v1y = 0.00009;
let o2x = 0.78,
  o2y = 0.7,
  v2x = -0.00011,
  v2y = 0.00014;
function resize() {
  W = canvas.width = innerWidth;
  H = canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpRGB = (a, b, t) => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
function progress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  return max > 0 ? Math.min(scrollY / max, 1) : 0;
}
function blend(t, stages) {
  const n = stages.length - 1,
    s = t * n,
    i = Math.min(Math.floor(s), n - 1),
    f = s - i;
  const a = stages[i],
    b = stages[Math.min(i + 1, n)];
  return {
    base: lerpRGB(a.base, b.base, f),
    o1: lerpRGB(a.o1, b.o1, f),
    o2: lerpRGB(a.o2, b.o2, f),
  };
}
function draw() {
  o1x += v1x;
  o1y += v1y;
  o2x += v2x;
  o2y += v2y;
  if (o1x < 0.05 || o1x > 0.95) v1x *= -1;
  if (o1y < 0.05 || o1y > 0.95) v1y *= -1;
  if (o2x < 0.05 || o2x > 0.95) v2x *= -1;
  if (o2y < 0.05 || o2y > 0.95) v2y *= -1;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const stages = isDark ? stagesDark : stagesLight;
  const p = progress(),
    { base, o1, o2 } = blend(p, stages);
  ctx.fillStyle = rgba(base, 1);
  ctx.fillRect(0, 0, W, H);
  const g1 = ctx.createRadialGradient(
    o1x * W,
    o1y * H,
    0,
    o1x * W,
    o1y * H,
    Math.max(W, H) * 0.65,
  );
  g1.addColorStop(0, rgba(o1, 0.55));
  g1.addColorStop(1, rgba(o1, 0));
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);
  const g2 = ctx.createRadialGradient(
    o2x * W,
    o2y * H,
    0,
    o2x * W,
    o2y * H,
    Math.max(W, H) * 0.5,
  );
  g2.addColorStop(0, rgba(o2, 0.45));
  g2.addColorStop(1, rgba(o2, 0));
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);
  requestAnimationFrame(draw);
}
draw();

// Init
renderQuestsGrid();
renderAchievements();