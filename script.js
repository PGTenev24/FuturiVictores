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

  const userData = {
    name,
    username,
    stars: 0,
    xp: 0,
    streak: 1,
    completedQuests: new Set(),
    earnedAchievements: [],
  };

  saveAccount(username, password, userData);
  state.user = userData;
  awardedAch.clear();
  localStorage.setItem("hq_active_user", username);
  saveUserState();

  afterSignIn();
  closeModal("signModal");
  showToast("🎉", `Welcome to HealthQuest, ${name}!`);
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

  updateHeaderStats();
  renderQuestsGrid();
  renderAchievements();
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
// COMPLETE QUEST
// ══════════════════════════════════════════
function completeQuest(qid) {
  if (!state.user) return;
  if (state.user.completedQuests.has(qid)) return;

  const allQuests = [...QUESTS.daily, ...QUESTS.weekly, ...QUESTS.monthly];
  const q = allQuests.find((x) => x.id === qid);
  if (!q) return;

  state.user.completedQuests.add(qid);
  state.user.stars += q.reward;
  state.user.xp += q.xp;
  state.user.streak = Math.max(state.user.streak, 1);

  updateHeaderStats();
  renderQuestsGrid();
  checkAchievements();
  saveUserState();

  const msgEl = document.getElementById("questCompleteMsg");
  if (msgEl)
    msgEl.textContent = `+${q.reward} ⭐ stars and +${q.xp} XP earned!`;
  openModal("questCompleteModal");
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
      state.user.stars += earned;
      state.user.xp += Math.floor(reps * 1.5);
      updateHeaderStats();
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
