// ══════════════════════════════════════════
// QUICKPOSE API KEY
// ══════════════════════════════════════════
const QUICKPOSE_API_KEY = "yhTBfUMuop8mMMQhronmx8vgbDgsCNfq4Mic44oK";
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
  activeQuest: null,
  questTracking: false,
  questStream: null,
  questReps: 0,
  questGoal: 0,
  quickposeSession: null,
};

// ══════════════════════════════════════════
// QUEST DATA
// ══════════════════════════════════════════
const QUESTS = {
  daily: [
    { id: "d1", name: "Morning Walk", desc: "Walk for 15 minutes outside.", icon: "🚶", reward: 10, xp: 20, difficulty: "Easy", trackType: "timed", goal: 15 },
    { id: "d2", name: "Drink Water", desc: "Log 8 glasses of water today.", icon: "💧", reward: 8, xp: 15, difficulty: "Easy", trackType: "manual" },
    { id: "d3", name: "10 Push-Ups", desc: "Complete 10 push-ups in one session.", icon: "💪", reward: 12, xp: 25, difficulty: "Medium", trackType: "reps", exercise: "push_up", goal: 10 },
    { id: "d4", name: "15 Squats", desc: "Do 15 squats to power your legs.", icon: "🦵", reward: 10, xp: 20, difficulty: "Easy", trackType: "reps", exercise: "squat", goal: 15 },
    { id: "d5", name: "Stretch Break", desc: "Do a 5-minute full-body stretch.", icon: "🧘", reward: 8, xp: 15, difficulty: "Easy", trackType: "manual" },
    { id: "d6", name: "20 Jumping Jacks", desc: "Get your heart pumping with 20 jumping jacks.", icon: "⚡", reward: 12, xp: 22, difficulty: "Easy", trackType: "reps", exercise: "jumping_jack", goal: 20 },
  ],
  weekly: [
    { id: "w1", name: "5K Steps Daily", desc: "Hit 5,000 steps every day this week.", icon: "👟", reward: 50, xp: 100, difficulty: "Medium", trackType: "manual" },
    { id: "w2", name: "50 Push-Ups Challenge", desc: "Complete 50 push-ups across the week.", icon: "🏋️", reward: 60, xp: 120, difficulty: "Hard", trackType: "reps", exercise: "push_up", goal: 50 },
    { id: "w3", name: "Sleep 7hrs", desc: "Get at least 7 hours of sleep 5 nights.", icon: "😴", reward: 40, xp: 80, difficulty: "Medium", trackType: "manual" },
    { id: "w4", name: "100 Squats Week", desc: "Squat 100 times this week.", icon: "🔥", reward: 70, xp: 140, difficulty: "Hard", trackType: "reps", exercise: "squat", goal: 100 },
  ],
  monthly: [
    { id: "m1", name: "30-Day Streak", desc: "Complete at least one quest every day for 30 days.", icon: "🔥", reward: 200, xp: 400, difficulty: "Legendary", trackType: "manual" },
    { id: "m2", name: "500 Rep Master", desc: "Log 500 total reps across all sessions.", icon: "🏆", reward: 150, xp: 300, difficulty: "Hard", trackType: "manual" },
    { id: "m3", name: "Mindful Month", desc: "Complete a mindfulness activity every week.", icon: "🌿", reward: 120, xp: 250, difficulty: "Medium", trackType: "manual" },
  ],
};

const RANKS = [
  { name: "Seedling", icon: "🌱", minXp: 0, desc: "Just getting started — every champion was once here." },
  { name: "Sprout", icon: "🌿", minXp: 100, desc: "You're growing. Keep it up!" },
  { name: "Runner", icon: "🏃", minXp: 300, desc: "Building momentum and healthy habits." },
  { name: "Warrior", icon: "⚔️", minXp: 600, desc: "Discipline is your superpower." },
  { name: "Champion", icon: "🏆", minXp: 1000, desc: "You inspire others just by showing up." },
  { name: "Legend", icon: "🌟", minXp: 2000, desc: "Elite. You've redefined what's possible." },
];

const ACHIEVEMENTS = [
  { id: "a1", name: "First Step", icon: "👣", desc: "Complete your first quest.", reward: 5 },
  { id: "a2", name: "On a Roll", icon: "🔥", desc: "Complete 3 quests.", reward: 10 },
  { id: "a3", name: "Quest Master", icon: "🗺️", desc: "Complete 10 quests.", reward: 25 },
  { id: "a4", name: "XP Hunter", icon: "⚡", desc: "Earn 100 XP.", reward: 15 },
  { id: "a5", name: "Iron Will", icon: "🦾", desc: "Log a 50-rep training session.", reward: 20 },
  { id: "a6", name: "Century Club", icon: "💯", desc: "Earn 500 XP.", reward: 50 },
];

// ══════════════════════════════════════════
// LOCALSTORAGE
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
  accounts[username] = { password, data: { ...data, completedQuests: [] } };
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
  if (!username || !password) { if (err) err.textContent = "Please fill in all fields."; return; }
  const account = getAccount(username);
  if (!account || account.password !== password) { if (err) err.textContent = "Invalid username or password."; return; }
  if (err) err.textContent = "";
  try {
    state.user = loadUserState(username) || account.data;
    state.user.completedQuests = state.user.completedQuests instanceof Set
      ? state.user.completedQuests
      : new Set(Array.isArray(state.user.completedQuests) ? state.user.completedQuests : []);
    awardedAch.clear();
    if (Array.isArray(state.user.earnedAchievements)) state.user.earnedAchievements.forEach(id => awardedAch.add(id));
    localStorage.setItem("hq_active_user", username);
    afterSignIn();
    closeModal("signModal");
    showToast("👋", `Welcome back, ${state.user.name || username}!`);
  } catch (e) { if (err) err.textContent = "Something went wrong. Please try again."; }
}

let _pendingSignUp = null;
function signUp() {
  const nameEl = document.getElementById("suName");
  const usernameEl = document.getElementById("suUsername");
  const passwordEl = document.getElementById("suPassword");
  const err = document.getElementById("suError");
  if (!usernameEl || !passwordEl) return;
  const name = nameEl ? nameEl.value.trim() : usernameEl.value.trim();
  const username = usernameEl.value.trim().toLowerCase();
  const password = passwordEl.value;
  if (!username || !password) { if (err) err.textContent = "Please fill in all fields."; return; }
  if (getAccount(username)) { if (err) err.textContent = "Username already taken."; return; }
  if (password.length < 4) { if (err) err.textContent = "Password too short (min 4 chars)."; return; }
  if (err) err.textContent = "";
  _pendingSignUp = { name: name || username, username, password };
  const signUpView = document.getElementById("signUpView");
  const bodyProfileView = document.getElementById("bodyProfileView");
  if (signUpView) signUpView.style.display = "none";
  if (bodyProfileView) bodyProfileView.style.display = "block";
}

function finishSignUp() {
  if (!_pendingSignUp) return;
  const age = document.getElementById("bpAge")?.value?.trim();
  const weight = document.getElementById("bpWeight")?.value?.trim();
  const weightUnit = document.getElementById("bpWeightUnit")?.value || "kg";
  const height = document.getElementById("bpHeight")?.value?.trim();
  const heightUnit = document.getElementById("bpHeightUnit")?.value || "cm";
  const bodyType = document.querySelector(".bp-option-btn.active[data-group='bodyType']")?.dataset.value;
  const goal = document.querySelector(".bp-option-btn.active[data-group='goal']")?.dataset.value;
  const activity = document.querySelector(".bp-option-btn.active[data-group='activity']")?.dataset.value;
  const bpErr = document.getElementById("bpError");
  if (!age || !weight || !height || !bodyType || !goal || !activity) {
    if (bpErr) bpErr.textContent = "Please complete all fields and selections."; return;
  }
  if (bpErr) bpErr.textContent = "";
  const { name, username, password } = _pendingSignUp;
  _pendingSignUp = null;
  const profile = { age: +age, weight: +weight, weightUnit, height: +height, heightUnit, bodyType, goal, activity };
  const userData = { name, username, stars: 0, xp: 0, streak: 1, completedQuests: new Set(), earnedAchievements: [], profile };
  saveAccount(username, password, userData);
  state.user = userData;
  awardedAch.clear();
  localStorage.setItem("hq_active_user", username);
  saveUserState();
  afterSignIn();
  closeModal("signModal");
  showToast("🎉", `Welcome to StayFit, ${name}! Generating your quests...`);
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
    avatarBtn.textContent = u.name ? u.name[0].toUpperCase() : u.username ? u.username[0].toUpperCase() : "?";
    avatarBtn.onclick = () => window.location.href = "settings.html";
  }
  const signoutBtn = document.getElementById("signoutBtn");
  if (signoutBtn) signoutBtn.style.display = "inline-block";
  const settingsSignBtn = document.getElementById("settingsSignBtn");
  if (settingsSignBtn) { settingsSignBtn.textContent = "Signed In ✓"; settingsSignBtn.disabled = true; }
  const settingsAccountDesc = document.getElementById("settingsAccountDesc");
  if (settingsAccountDesc) settingsAccountDesc.textContent = `Signed in as ${u.username}`;
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
  if (avatarBtn) { avatarBtn.classList.remove("visible"); avatarBtn.textContent = ""; }
  const signoutBtn = document.getElementById("signoutBtn");
  if (signoutBtn) signoutBtn.style.display = "none";
  renderQuestsGrid();
  renderAchievements();
  showToast("👋", "Signed out. See you soon!");
}

// ══════════════════════════════════════════
// HEADER STATS
// ══════════════════════════════════════════
function updateHeaderStats() {
  const u = state.user;
  if (!u) return;
  const rank = getRank(u.xp);
  const headerStreak = document.getElementById("headerStreak");
  const headerStars = document.getElementById("headerStars");
  const headerRank = document.getElementById("headerRank");
  if (headerStreak) headerStreak.textContent = u.streak || 0;
  if (headerStars) headerStars.textContent = u.stars || 0;
  if (headerRank) headerRank.textContent = rank.name;
}

// ══════════════════════════════════════════
// AI QUEST GENERATION (Gemini)
// ══════════════════════════════════════════
async function generateAIQuests() {
  if (!state.user?.profile) return;
  const p = state.user.profile;
  const grid = document.getElementById("questsGrid");
  if (grid) grid.innerHTML = `<div class="quest-generating"><div class="quest-gen-spinner"></div><p>🤖 Generating personalised quests...</p></div>`;
  const prompt = `You are a fitness AI for StayFit app. Generate personalised quests for:
Age: ${p.age}, Weight: ${p.weight}${p.weightUnit}, Height: ${p.height}${p.heightUnit}, Body: ${p.bodyType}, Goal: ${p.goal}, Activity: ${p.activity}.
Generate exactly 13 quests total: 6 daily, 4 weekly, 3 monthly.
For quests that involve physical exercises (push-ups, squats, jumping jacks, sit-ups, lunges), include trackType "reps" and the exercise name.
Available exercise values: push_up, squat, jumping_jack, sit_up, lunge
Respond ONLY with valid JSON, no markdown:
{"daily":[{"id":"d1","name":"...","desc":"...","icon":"<emoji>","reward":<5-20>,"xp":<10-40>,"difficulty":"Easy|Medium|Hard","trackType":"reps|manual","exercise":"push_up|squat|jumping_jack|sit_up|lunge|null","goal":<number or null>},...6 total],"weekly":[...4 total],"monthly":[...3 total]}`;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "YOUR_GEMINI_KEY_HERE") {
    renderQuestsGrid(); return;
  }
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1400 } }) }
    );
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const generated = JSON.parse(clean);
    if (generated.daily && generated.weekly && generated.monthly) {
      state.user.aiQuests = generated;
      saveUserState();
      QUESTS.daily = generated.daily;
      QUESTS.weekly = generated.weekly;
      QUESTS.monthly = generated.monthly;
      renderQuestsGrid();
      showToast("🤖", "Your personalised quests are ready!");
    } else throw new Error("Invalid format");
  } catch (e) {
    console.error("AI quest generation failed:", e.message);
    renderQuestsGrid();
    showToast("⚠️", `Quest generation failed: ${e.message}`);
  }
}

function loadAIQuestsIfSaved() {
  if (state.user?.aiQuests) {
    const q = state.user.aiQuests;
    if (q.daily?.length) QUESTS.daily = q.daily;
    if (q.weekly?.length) QUESTS.weekly = q.weekly;
    if (q.monthly?.length) QUESTS.monthly = q.monthly;
  }
}

// ══════════════════════════════════════════
// BODY PROFILE OPTION BUTTONS
// ══════════════════════════════════════════
function selectBpOption(btn, group) {
  document.querySelectorAll(`.bp-option-btn[data-group="${group}"]`).forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}
function selectSpOption(btn, group) {
  document.querySelectorAll(`.sp-option-btn[data-group="${group}"]`).forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

async function saveProfile() {
  if (!state.user) return;
  const age = document.getElementById("spAge")?.value?.trim();
  const weight = document.getElementById("spWeight")?.value?.trim();
  const weightUnit = document.getElementById("spWeightUnit")?.value || "kg";
  const height = document.getElementById("spHeight")?.value?.trim();
  const heightUnit = document.getElementById("spHeightUnit")?.value || "cm";
  const bodyType = document.querySelector(".sp-option-btn.active[data-group='bodyType']")?.dataset.value;
  const goal = document.querySelector(".sp-option-btn.active[data-group='goal']")?.dataset.value;
  const activity = document.querySelector(".sp-option-btn.active[data-group='activity']")?.dataset.value;
  const msg = document.getElementById("profileSaveMsg");
  if (!age || !weight || !height || !bodyType || !goal || !activity) {
    if (msg) { msg.textContent = "Please fill in all fields."; msg.style.color = "#e07a5f"; } return;
  }
  state.user.profile = { age: +age, weight: +weight, weightUnit, height: +height, heightUnit, bodyType, goal, activity };
  state.user.aiQuests = null;
  saveUserState();
  if (msg) { msg.textContent = "Saved! Regenerating your quests..."; msg.style.color = "var(--green)"; }
  await generateAIQuests();
  if (msg) msg.textContent = "Profile saved and quests updated ✓";
}

function populateProfileSettings() {
  if (!state.user?.profile) return;
  const p = state.user.profile;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
  set("spAge", p.age); set("spWeight", p.weight); set("spWeightUnit", p.weightUnit);
  set("spHeight", p.height); set("spHeightUnit", p.heightUnit);
  ["bodyType", "goal", "activity"].forEach(group => {
    const val = p[group]; if (!val) return;
    document.querySelectorAll(`.sp-option-btn[data-group="${group}"]`).forEach(b => b.classList.toggle("active", b.dataset.value === val));
  });
}

// ══════════════════════════════════════════
// RANKS
// ══════════════════════════════════════════
function getRank(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) { if (xp >= r.minXp) rank = r; }
  return rank;
}

// ══════════════════════════════════════════
// QUESTS — RENDER
// ══════════════════════════════════════════
function filterQuests(type, btn) {
  state.currentQuestFilter = type;
  document.querySelectorAll(".quest-tab-btn").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderQuestsGrid();
}

function renderQuestsGrid() {
  const grid = document.getElementById("questsGrid");
  if (!grid) return;
  const quests = QUESTS[state.currentQuestFilter] || [];
  const completed = state.user ? state.user.completedQuests : new Set();
  grid.innerHTML = quests.map(q => {
    const done = completed.has(q.id);
    const isPhysical = q.trackType === "reps" && q.exercise;
    const btnLabel = done ? "✓ Completed" : !state.user ? "Sign in to track" :
      isPhysical ? "🎥 Start Quest" : "✓ Mark Complete";
    return `<div class="quest-card ${done ? "completed" : ""}">
      <div class="quest-icon">${q.icon}</div>
      <div class="quest-name">${q.name}</div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-meta">
        <div class="quest-reward">⭐ ${q.reward} stars · +${q.xp} XP</div>
        <div class="quest-difficulty">${q.difficulty}</div>
      </div>
      ${isPhysical && q.goal ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.75rem;font-weight:700;">🎯 Goal: ${q.goal} ${q.exercise.replace('_',' ')}s</div>` : ''}
      <button class="btn-start-quest" ${done || !state.user ? "disabled" : ""} onclick="${isPhysical ? `openQuestTracker('${q.id}')` : `completeQuest('${q.id}')`}">
        ${btnLabel}
      </button>
    </div>`;
  }).join("");
}

// ══════════════════════════════════════════
// MEDIAPIPE REAL AI — QUEST TRACKER
// ══════════════════════════════════════════
let _mpLoaded        = false;
let _PoseLandmarker  = null;
let _DrawingUtils    = null;
let qtPoseLandmarker = null;
let qtAnimFrame      = null;
let qtLastVideoTime  = -1;
let qtMpRunning      = false;
let qtOverlayCanvas  = null;
let qtDrawingUtils   = null;
let qtLastReportedCount = 0;

// Rep state — includes hold-time debounce to prevent double-counting
let qtRepState = {
  phase: "up",       // "up" | "down"
  count: 0,
  downSince: null,   // timestamp (ms) when we entered the "down" position
  MIN_DOWN_MS: 380,  // must stay in "down" at least this long before the up-swing scores a rep
};

const QT_EXERCISE_CONFIG = {
  push_up:      { joints:[11,13,15], downAngle:75,  upAngle:150, cue:(a)=>a<90?"⬆️ Push up!":a>145?"⬇️ Go lower!":"✅ Good form!" },
  squat:        { joints:[23,25,27], downAngle:95,  upAngle:158, cue:(a)=>a<105?"⬆️ Stand up!":a>155?"⬇️ Squat lower!":"✅ Good depth!" },
  jumping_jack: { joints:[11,13,15], downAngle:40,  upAngle:120, cue:()=>"✅ Keep going!" },
  sit_up:       { joints:[11,23,25], downAngle:40,  upAngle:85,  cue:(a)=>a<50?"⬆️ Crunch up!":"⬇️ Lie back!" },
  lunge:        { joints:[23,25,27], downAngle:95,  upAngle:158, cue:(a)=>a<105?"⬆️ Stand up!":"⬇️ Lunge deeper!" },
};

function qtGetAngle(a, b, c) {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs(rad * 180 / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

async function qtLoadMediaPipe() {
  if (qtPoseLandmarker) return;
  if (!_mpLoaded) {
    const mod = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
    _PoseLandmarker = mod.PoseLandmarker;
    _DrawingUtils   = mod.DrawingUtils;
    _mpLoaded = true;
  }
  const { FilesetResolver } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs");
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  qtPoseLandmarker = await _PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
      delegate: "GPU"
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence:     0.5,
  });
}

function qtEnsureCanvas() {
  const box = document.querySelector(".qt-camera-box");
  if (!box) return;
  let c = document.getElementById("qtPoseCanvas");
  if (!c) {
    c = document.createElement("canvas");
    c.id = "qtPoseCanvas";
    c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:10;";
    box.appendChild(c);
  }
  qtOverlayCanvas = c;
}

function qtPoseLoop(exerciseKey) {
  if (!qtMpRunning || !qtPoseLandmarker) return;
  const video = document.getElementById("qtVideo");
  if (!video || video.readyState < 2) {
    qtAnimFrame = requestAnimationFrame(() => qtPoseLoop(exerciseKey));
    return;
  }

  if (video.currentTime !== qtLastVideoTime) {
    qtLastVideoTime = video.currentTime;

    let results;
    try { results = qtPoseLandmarker.detectForVideo(video, performance.now()); }
    catch(e) { qtAnimFrame = requestAnimationFrame(() => qtPoseLoop(exerciseKey)); return; }

    if (qtOverlayCanvas) {
      const w = video.videoWidth  || video.clientWidth;
      const h = video.videoHeight || video.clientHeight;
      qtOverlayCanvas.width  = w;
      qtOverlayCanvas.height = h;
      const ctx = qtOverlayCanvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);

      if (results.landmarks?.length > 0) {
        const lm = results.landmarks[0];

        // ── FIX 1: Mirror the skeleton to match the CSS-flipped video ──
        // The <video> uses CSS transform:scaleX(-1) so the user sees a mirror image.
        // MediaPipe landmarks are in raw (un-mirrored) space, so we flip the canvas
        // draw context — making every bone land exactly where it looks on screen.
        ctx.save();
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        if (!qtDrawingUtils) qtDrawingUtils = new _DrawingUtils(ctx);
        qtDrawingUtils.drawLandmarks(lm, { color:"#6abf7b", lineWidth:2, radius:3 });
        qtDrawingUtils.drawConnectors(lm, _PoseLandmarker.POSE_CONNECTIONS, { color:"#3d7a4f", lineWidth:2 });
        ctx.restore();

        // ── Rep counting with hold-time debounce ──
        const cfg = QT_EXERCISE_CONFIG[exerciseKey];
        if (cfg) {
          const [ai, bi, ci] = cfg.joints;
          const pa = lm[ai], pb = lm[bi], pc = lm[ci];
          if (pa && pb && pc) {
            const angle = qtGetAngle(pa, pb, pc);
            const now   = performance.now();

            // Transition to "down"
            if (angle < cfg.downAngle && qtRepState.phase === "up") {
              qtRepState.phase     = "down";
              qtRepState.downSince = now;
            }

            // ── FIX 2: Only complete rep after holding "down" for MIN_DOWN_MS ──
            // A genuine push-up / squat bottom takes ~380ms+.
            // A wobble or noise spike doesn't — so we ignore those.
            if (
              angle > cfg.upAngle &&
              qtRepState.phase === "down" &&
              qtRepState.downSince !== null &&
              (now - qtRepState.downSince) >= qtRepState.MIN_DOWN_MS
            ) {
              qtRepState.phase     = "up";
              qtRepState.downSince = null;
              qtRepState.count++;
            }

            // If they came back up too fast (noise), just reset phase without counting
            if (angle > cfg.upAngle && qtRepState.phase === "down" &&
                qtRepState.downSince !== null &&
                (now - qtRepState.downSince) < qtRepState.MIN_DOWN_MS) {
              qtRepState.phase     = "up";
              qtRepState.downSince = null;
              // count stays the same — rep not awarded
            }

            // Push any newly counted reps to the quest system
            const newReps = qtRepState.count - qtLastReportedCount;
            if (newReps > 0 && state.questTracking) {
              qtLastReportedCount = qtRepState.count;
              for (let i = 0; i < newReps; i++) {
                updateQuestRepUI();
                checkQuestCompletion();
                if (!state.questTracking) break;
              }
            }

            // Status message
            const statusEl = document.getElementById("qtStatus");
            if (statusEl && state.questTracking) {
              const inDown   = qtRepState.phase === "down";
              const held     = inDown && qtRepState.downSince ? Math.round(now - qtRepState.downSince) : 0;
              const needHold = qtRepState.MIN_DOWN_MS;
              const cue = inDown && held < needHold
                ? `⏬ Hold it... (${held}ms / ${needHold}ms)`
                : cfg.cue(angle);
              statusEl.textContent = `${cue}  (${Math.round(angle)}°)`;
              statusEl.className   = cue.includes("⚠️") ? "qt-status bad" : "qt-status";
            }

            // Draw angle label — mirror the x position to match the flipped video
            const jx = (1 - pb.x) * w;
            const jy = pb.y * h;
            ctx.fillStyle = "white";
            ctx.font = "bold 15px Nunito, sans-serif";
            ctx.fillText(`${Math.round(angle)}°`, jx + 10, jy);
          }
        }
      } else {
        const statusEl = document.getElementById("qtStatus");
        if (statusEl && state.questTracking) statusEl.textContent = "👁️ Step into frame...";
      }
    }
  }

  qtAnimFrame = requestAnimationFrame(() => qtPoseLoop(exerciseKey));
}

function qtStopPose() {
  qtMpRunning = false;
  if (qtAnimFrame) { cancelAnimationFrame(qtAnimFrame); qtAnimFrame = null; }
  const c = document.getElementById("qtPoseCanvas");
  if (c) c.remove();
  qtOverlayCanvas  = null;
  qtDrawingUtils   = null;
  qtLastVideoTime  = -1;
}

// ══════════════════════════════════════════
// QUEST CAMERA TRACKER
// ══════════════════════════════════════════
function openQuestTracker(qid) {
  if (!state.user) return;
  const allQ = [...QUESTS.daily, ...QUESTS.weekly, ...QUESTS.monthly];
  const q = allQ.find(x => x.id === qid);
  if (!q) return;

  state.activeQuest = q;
  state.questReps   = 0;
  state.questGoal   = q.goal || 10;

  const titleEl    = document.getElementById("qtTitle");
  const descEl     = document.getElementById("qtDesc");
  const repCountEl = document.getElementById("qtRepCount");
  const goalEl     = document.getElementById("qtGoalNum");
  const repLabelEl = document.getElementById("qtRepLabel");
  const progressFill = document.getElementById("qtProgressFill");
  const statusEl   = document.getElementById("qtStatus");
  const qtOverlay  = document.getElementById("qtOverlay");
  const qtOverlayTxt = document.getElementById("qtOverlayTxt");
  const btnStart   = document.getElementById("qtBtnStart");
  const btnStop    = document.getElementById("qtBtnStop");

  if (titleEl)      titleEl.textContent = q.name;
  if (descEl)       descEl.textContent  = q.desc;
  if (repCountEl)   repCountEl.textContent = "0";
  if (goalEl)       goalEl.textContent  = state.questGoal;
  if (repLabelEl)   repLabelEl.textContent = "reps done";
  if (progressFill) progressFill.style.width = "0%";
  if (statusEl)     { statusEl.textContent = "Ready when you are 🌿"; statusEl.className = "qt-status"; }
  if (qtOverlay)    qtOverlay.classList.remove("hidden");
  if (qtOverlayTxt) qtOverlayTxt.textContent = "Press Start to activate camera & begin tracking";
  if (btnStart)     { btnStart.style.display = "inline-block"; btnStart.disabled = false; }
  if (btnStop)      btnStop.classList.remove("visible");

  const modal = document.getElementById("questTrackerModal");
  if (modal) modal.classList.add("visible");
}

function closeQuestTracker() {
  stopQuestTracking();
  const modal = document.getElementById("questTrackerModal");
  if (modal) modal.classList.remove("visible");
  state.activeQuest = null;
}

let questPoseTimer = null;

async function startQuestTracking() {
  if (!state.activeQuest) return;
  const q       = state.activeQuest;
  const btnStart  = document.getElementById("qtBtnStart");
  const btnStop   = document.getElementById("qtBtnStop");
  const statusEl  = document.getElementById("qtStatus");

  if (btnStart) btnStart.style.display = "none";
  if (btnStop)  btnStop.classList.add("visible");
  if (statusEl) { statusEl.textContent = "🔄 Loading AI model..."; statusEl.className = "qt-status"; }

  // Reset all counters
  state.questTracking     = true;
  state.questReps         = 0;
  qtRepState              = { phase:"up", count:0, downSince:null, MIN_DOWN_MS:380 };
  qtLastReportedCount     = 0;

  // Start camera
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video:{ width:640, height:480, facingMode:"user" } });
    state.questStream = stream;
    const video = document.getElementById("qtVideo");
    if (video) {
      video.srcObject = stream;
      await new Promise(r => { video.onloadedmetadata = r; });
      await video.play();
    }
    const overlay = document.getElementById("qtOverlay");
    if (overlay) overlay.classList.add("hidden");
  } catch(e) {
    showToast("📷", "Camera access denied — please allow camera permissions.");
    if (btnStart) { btnStart.style.display = "inline-block"; }
    if (btnStop)  btnStop.classList.remove("visible");
    state.questTracking = false;
    return;
  }

  // Load MediaPipe
  try {
    await qtLoadMediaPipe();
  } catch(e) {
    console.error("MediaPipe failed to load:", e);
    showToast("⚠️", "AI model failed to load — check your connection and try again.");
    stopQuestTracking();
    return;
  }

  qtEnsureCanvas();
  qtMpRunning = true;
  if (statusEl) { statusEl.textContent = "👁️ AI is watching — do your reps!"; statusEl.className = "qt-status"; }
  qtPoseLoop(q.exercise || "squat");
}

function updateQuestRepUI() {
  state.questReps++;
  const repCountEl   = document.getElementById("qtRepCount");
  const progressFill = document.getElementById("qtProgressFill");
  const pct = Math.min(100, (state.questReps / state.questGoal) * 100);
  if (repCountEl) {
    repCountEl.textContent = state.questReps;
    repCountEl.style.transform = "scale(1.35)";
    setTimeout(() => { if (repCountEl) repCountEl.style.transform = "scale(1)"; }, 200);
  }
  if (progressFill) progressFill.style.width = pct + "%";
}

function checkQuestCompletion() {
  if (state.questReps >= state.questGoal && state.activeQuest) {
    const questId = state.activeQuest.id;
    stopQuestTracking();
    setTimeout(() => {
      const modal = document.getElementById("questTrackerModal");
      if (modal) modal.classList.remove("visible");
      completeQuest(questId);
    }, 800);
  }
}

function stopQuestTracking() {
  state.questTracking = false;
  clearTimeout(questPoseTimer);
  qtStopPose();

  if (state.questStream) {
    state.questStream.getTracks().forEach(t => t.stop());
    state.questStream = null;
    const video = document.getElementById("qtVideo");
    if (video) video.srcObject = null;
  }

  const btnStart = document.getElementById("qtBtnStart");
  const btnStop  = document.getElementById("qtBtnStop");
  if (btnStart) { btnStart.style.display = "inline-block"; btnStart.disabled = false; }
  if (btnStop)  btnStop.classList.remove("visible");

  const overlay = document.getElementById("qtOverlay");
  if (overlay) overlay.classList.remove("hidden");

  const statusEl = document.getElementById("qtStatus");
  if (statusEl && state.questReps > 0) {
    statusEl.textContent = `Session ended — ${state.questReps} reps logged`;
    statusEl.className = "qt-status";
  }
}

// ══════════════════════════════════════════
// CONFETTI
// ══════════════════════════════════════════
function launchConfetti() {
  const canvas = document.getElementById("confettiCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";
  const colors = ["#3d7a4f","#6abf7b","#f59e0b","#ef4444","#3b82f6","#a855f7","#ec4899","#ffffff","#74cc82","#fbbf24"];
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width, y: -10 - Math.random() * 200,
    w: 6 + Math.random() * 8, h: 10 + Math.random() * 8,
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
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.07; p.rotation += p.rotSpeed;
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
    if (alive) requestAnimationFrame(draw);
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = "none"; }
  }
  draw();
}

// ══════════════════════════════════════════
// LEVEL UP
// ══════════════════════════════════════════
function showLevelUp(newRank) {
  const existing = document.getElementById("levelUpOverlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "levelUpOverlay";
  overlay.innerHTML = `<div class="lu-card"><div class="lu-rays"></div><div class="lu-content">
    <div class="lu-label">RANK UP!</div>
    <div class="lu-icon">${newRank.icon}</div>
    <div class="lu-name">${newRank.name}</div>
    <div class="lu-desc">${newRank.desc}</div>
    <button class="lu-btn" onclick="document.getElementById('levelUpOverlay').remove()">Keep Going 🔥</button>
  </div></div>`;
  document.body.appendChild(overlay);
  if (!document.getElementById("levelUpStyles")) {
    const style = document.createElement("style");
    style.id = "levelUpStyles";
    style.textContent = `
    #levelUpOverlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);animation:lu-fadein 0.4s ease forwards;}
    @keyframes lu-fadein{from{opacity:0}to{opacity:1}}
    .lu-card{position:relative;background:var(--surface);border:2px solid var(--green);border-radius:32px;padding:3.5rem 3rem;text-align:center;max-width:380px;width:90%;box-shadow:0 0 80px var(--green-glow),0 24px 64px rgba(0,0,0,0.4);animation:lu-popin 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;overflow:hidden;}
    @keyframes lu-popin{from{transform:scale(0.6);opacity:0;}to{transform:scale(1);opacity:1;}}
    .lu-rays{position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 0deg,var(--green-glow) 10deg,transparent 20deg,var(--green-glow) 30deg,transparent 40deg,var(--green-glow) 50deg,transparent 60deg,var(--green-glow) 70deg,transparent 80deg,var(--green-glow) 90deg,transparent 100deg,var(--green-glow) 110deg,transparent 120deg,var(--green-glow) 130deg,transparent 140deg,var(--green-glow) 150deg,transparent 160deg,var(--green-glow) 170deg,transparent 180deg,var(--green-glow) 190deg,transparent 200deg,var(--green-glow) 210deg,transparent 220deg,var(--green-glow) 230deg,transparent 240deg,var(--green-glow) 250deg,transparent 260deg,var(--green-glow) 270deg,transparent 280deg,var(--green-glow) 290deg,transparent 300deg,var(--green-glow) 310deg,transparent 320deg,var(--green-glow) 330deg,transparent 340deg,var(--green-glow) 350deg,transparent 360deg);animation:lu-spin 8s linear infinite;opacity:0.6;pointer-events:none;}
    @keyframes lu-spin{to{transform:rotate(360deg);}}
    .lu-content{position:relative;z-index:1;}
    .lu-label{font-size:0.72rem;font-weight:800;letter-spacing:0.2em;color:var(--green);text-transform:uppercase;margin-bottom:1.2rem;}
    .lu-icon{font-size:5rem;line-height:1;margin-bottom:0.8rem;animation:lu-bounce 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both;}
    @keyframes lu-bounce{from{transform:scale(0) rotate(-20deg);}to{transform:scale(1) rotate(0deg);}}
    .lu-name{font-family:'Fredoka One',cursive;font-size:2.4rem;color:var(--text);margin-bottom:0.6rem;}
    .lu-desc{font-size:0.88rem;color:var(--text-muted);line-height:1.6;margin-bottom:2rem;font-weight:600;}
    .lu-btn{background:linear-gradient(135deg,var(--green2),var(--green));color:white;border:none;padding:0.85rem 2.2rem;border-radius:999px;font-family:'Nunito',sans-serif;font-size:1rem;font-weight:800;cursor:pointer;transition:all 0.2s;}
    .lu-btn:hover{transform:translateY(-2px);}`;
    document.head.appendChild(style);
  }
  launchConfetti();
}

// ══════════════════════════════════════════
// COMPLETE QUEST
// ══════════════════════════════════════════
function completeQuest(qid) {
  if (!state.user) return;
  if (state.user.completedQuests.has(qid)) return;
  const allQuests = [...QUESTS.daily, ...QUESTS.weekly, ...QUESTS.monthly];
  const q = allQuests.find(x => x.id === qid);
  if (!q) return;
  const rankBefore = getRank(state.user.xp);
  state.user.completedQuests.add(qid);
  state.user.stars += q.reward;
  state.user.xp += q.xp;
  state.user.streak = Math.max(state.user.streak, 1);
  const rankAfter = getRank(state.user.xp);
  const didLevelUp = rankAfter.name !== rankBefore.name;
  updateHeaderStats();
  renderQuestsGrid();
  checkAchievements();
  saveUserState();
  launchConfetti();
  if (didLevelUp) {
    setTimeout(() => showLevelUp(rankAfter), 600);
  } else {
    const msgEl = document.getElementById("questCompleteMsg");
    if (msgEl) msgEl.textContent = `+${q.reward} ⭐ stars and +${q.xp} XP earned!`;
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
  ACHIEVEMENTS.forEach(a => {
    if (a.id === "a1" && u.completedQuests.size >= 1) awardAch(a);
    if (a.id === "a2" && u.completedQuests.size >= 3) awardAch(a);
    if (a.id === "a3" && u.completedQuests.size >= 10) awardAch(a);
    if (a.id === "a4" && u.xp >= 100) awardAch(a);
    if (a.id === "a6" && u.xp >= 500) awardAch(a);
    if (a.id === "a5" && repSession) awardAch(a);
  });
}
function awardAch(a) {
  if (!state.user || awardedAch.has(a.id)) return;
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
    const pct = nextRank ? Math.min(100, ((xp - currentRank.minXp) / (nextRank.minXp - currentRank.minXp)) * 100) : 100;
    xpBar.style.width = pct + "%";
  }
  if (ranksList) {
    ranksList.innerHTML = RANKS.map(r => {
      const achieved = xp >= r.minXp;
      const isCurrent = r.name === currentRank.name;
      return `<div class="rank-item ${isCurrent ? "current" : achieved ? "achieved" : "locked-rank"}">
        <div class="rank-item-icon">${r.icon}</div>
        <div class="rank-item-name">${r.name}</div>
      </div>`;
    }).join("");
  }
  if (grid) {
    grid.innerHTML = ACHIEVEMENTS.map(a => {
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
// SOCIAL SYSTEM
// ══════════════════════════════════════════
function getPublicProfile(username) {
  const saved = localStorage.getItem(`hq_user_${username}`);
  if (!saved) return null;
  const d = JSON.parse(saved);
  return { username, name: d.name || username, xp: d.xp || 0, stars: d.stars || 0, streak: d.streak || 0, completedQuests: Array.isArray(d.completedQuests) ? d.completedQuests.length : 0, rank: getRank(d.xp || 0) };
}
function getAllUsernames() {
  const accounts = JSON.parse(localStorage.getItem("hq_accounts") || "{}");
  return Object.keys(accounts);
}
function getSocialData(username) {
  const raw = localStorage.getItem(`hq_social_${username}`);
  return raw ? JSON.parse(raw) : { friends: [], incoming: [], outgoing: [], nudges: [] };
}
function saveSocialData(username, data) { localStorage.setItem(`hq_social_${username}`, JSON.stringify(data)); }
function sendFriendRequest(toUsername) {
  if (!state.user) return;
  const me = state.user.username;
  if (toUsername === me) { showToast("😅", "You can't add yourself!"); return; }
  const myData = getSocialData(me);
  const theirData = getSocialData(toUsername);
  if (myData.friends.includes(toUsername)) { showToast("👥", "Already friends!"); return; }
  if (myData.outgoing.includes(toUsername)) { showToast("⏳", "Request already sent!"); return; }
  if (myData.incoming.includes(toUsername)) { acceptFriendRequest(toUsername); return; }
  myData.outgoing.push(toUsername); theirData.incoming.push(me);
  saveSocialData(me, myData); saveSocialData(toUsername, theirData);
  showToast("📨", `Friend request sent to ${toUsername}!`);
  renderFriendsList(); renderPendingRequests(); updateFriendBadge();
}
function acceptFriendRequest(fromUsername) {
  if (!state.user) return;
  const me = state.user.username;
  const myData = getSocialData(me); const theirData = getSocialData(fromUsername);
  myData.incoming = myData.incoming.filter(u => u !== fromUsername);
  theirData.outgoing = theirData.outgoing.filter(u => u !== me);
  if (!myData.friends.includes(fromUsername)) myData.friends.push(fromUsername);
  if (!theirData.friends.includes(me)) theirData.friends.push(me);
  saveSocialData(me, myData); saveSocialData(fromUsername, theirData);
  showToast("🎉", `You and ${fromUsername} are now friends!`);
  renderFriendsList(); renderPendingRequests(); updateFriendBadge();
}
function declineFriendRequest(fromUsername) {
  if (!state.user) return;
  const me = state.user.username;
  const myData = getSocialData(me); const theirData = getSocialData(fromUsername);
  myData.incoming = myData.incoming.filter(u => u !== fromUsername);
  theirData.outgoing = theirData.outgoing.filter(u => u !== me);
  saveSocialData(me, myData); saveSocialData(fromUsername, theirData);
  renderPendingRequests(); updateFriendBadge();
}
function removeFriend(username) {
  if (!state.user) return;
  const me = state.user.username;
  const myData = getSocialData(me); const theirData = getSocialData(username);
  myData.friends = myData.friends.filter(u => u !== username);
  theirData.friends = theirData.friends.filter(u => u !== me);
  saveSocialData(me, myData); saveSocialData(username, theirData);
  showToast("👋", `Removed ${username} from friends.`); renderFriendsList();
}
function updateFriendBadge() {
  const badge = document.getElementById("friendBadge");
  if (!badge || !state.user) return;
  const myData = getSocialData(state.user.username);
  const count = myData.incoming.length;
  badge.textContent = count;
  badge.style.visibility = count > 0 ? "visible" : "hidden";
  badge.style.display = "inline-flex";
}
function searchUsers() {
  const input = document.getElementById("userSearchInput");
  const results = document.getElementById("searchResults");
  if (!input || !results || !state.user) return;
  const query = input.value.trim().toLowerCase();
  if (!query) { results.innerHTML = ""; return; }
  const me = state.user.username;
  const myData = getSocialData(me);
  const allUsers = getAllUsernames().filter(u => u !== me && u.includes(query));
  if (allUsers.length === 0) { results.innerHTML = `<div class="search-empty">No users found for "${query}"</div>`; return; }
  results.innerHTML = allUsers.map(u => {
    const profile = getPublicProfile(u);
    if (!profile) return "";
    const isFriend = myData.friends.includes(u);
    const isPending = myData.outgoing.includes(u);
    const hasRequested = myData.incoming.includes(u);
    let btn = "";
    if (isFriend) btn = `<button class="social-btn friend-btn" disabled>✓ Friends</button>`;
    else if (isPending) btn = `<button class="social-btn pending-btn" disabled>⏳ Pending</button>`;
    else if (hasRequested) btn = `<button class="social-btn accept-btn" onclick="acceptFriendRequest('${u}')">✓ Accept</button>`;
    else btn = `<button class="social-btn add-btn" onclick="sendFriendRequest('${u}')">+ Add</button>`;
    return `<div class="search-result-card"><div class="sr-avatar">${profile.name[0].toUpperCase()}</div><div class="sr-info"><div class="sr-name">${profile.name}</div><div class="sr-username">@${u}</div><div class="sr-stats">${profile.rank.icon} ${profile.rank.name} · 🔥 ${profile.streak} · ⭐ ${profile.stars}</div></div>${btn}</div>`;
  }).join("");
}
function renderFriendsList() {
  const container = document.getElementById("friendsList");
  if (!container || !state.user) return;
  const myData = getSocialData(state.user.username);
  if (myData.friends.length === 0) { container.innerHTML = `<div class="social-empty">No friends yet. Search for users above to get started! 👆</div>`; return; }
  const friends = myData.friends.map(u => getPublicProfile(u)).filter(Boolean).sort((a, b) => b.xp - a.xp);
  container.innerHTML = friends.map((f, i) => `<div class="friend-card"><div class="friend-rank-num">#${i+1}</div><div class="friend-avatar">${f.name[0].toUpperCase()}</div><div class="friend-info"><div class="friend-name">${f.name} <span class="friend-username">@${f.username}</span></div><div class="friend-stats">${f.rank.icon} ${f.rank.name} &nbsp;·&nbsp; 🔥 ${f.streak} day streak &nbsp;·&nbsp; ✅ ${f.completedQuests} quests</div><div class="friend-xp-bar-wrap"><div class="friend-xp-bar" style="width:${Math.min(100,(f.xp/2000)*100)}%"></div></div></div><div class="friend-stars">⭐ ${f.stars}</div><button class="social-btn remove-btn" onclick="removeFriend('${f.username}')">✕</button></div>`).join("");
}
function renderPendingRequests() {
  const container = document.getElementById("pendingRequests");
  if (!container || !state.user) return;
  const myData = getSocialData(state.user.username);
  if (myData.incoming.length === 0) { container.innerHTML = `<div class="social-empty">No pending requests.</div>`; return; }
  container.innerHTML = myData.incoming.map(u => {
    const profile = getPublicProfile(u);
    if (!profile) return "";
    return `<div class="request-card"><div class="friend-avatar">${profile.name[0].toUpperCase()}</div><div class="friend-info"><div class="friend-name">${profile.name} <span class="friend-username">@${u}</span></div><div class="friend-stats">${profile.rank.icon} ${profile.rank.name} · ⭐ ${profile.stars}</div></div><button class="social-btn accept-btn" onclick="acceptFriendRequest('${u}')">✓ Accept</button><button class="social-btn decline-btn" onclick="declineFriendRequest('${u}')">✕</button></div>`;
  }).join("");
}
function renderLeaderboard(filterFriends = false) {
  const container = document.getElementById("leaderboardList");
  if (!container) return;
  let users = getAllUsernames().map(u => getPublicProfile(u)).filter(Boolean);
  if (filterFriends && state.user) {
    const myData = getSocialData(state.user.username);
    const friendSet = new Set([...myData.friends, state.user.username]);
    users = users.filter(u => friendSet.has(u.username));
  }
  users.sort((a, b) => b.xp - a.xp);
  if (users.length === 0) { container.innerHTML = `<div class="social-empty">No users to show yet.</div>`; return; }
  const medals = ["🥇","🥈","🥉"];
  container.innerHTML = users.map((u, i) => {
    const isMe = state.user && u.username === state.user.username;
    return `<div class="lb-card ${isMe ? "lb-me" : ""}"><div class="lb-pos">${medals[i] || `#${i+1}`}</div><div class="friend-avatar">${u.name[0].toUpperCase()}</div><div class="friend-info"><div class="friend-name">${u.name} ${isMe ? "<span class='lb-you'>you</span>" : ""}</div><div class="friend-stats">${u.rank.icon} ${u.rank.name} · 🔥 ${u.streak} · ✅ ${u.completedQuests} quests</div></div><div class="friend-stars">⭐ ${u.stars}<br><span style="font-size:0.72rem;color:var(--text-muted)">${u.xp} XP</span></div></div>`;
  }).join("");
}
function switchLeaderboard(type, btn) {
  document.querySelectorAll(".lb-tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderLeaderboard(type === "friends");
}

// ══════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════
function openModal(id) { const el = document.getElementById(id); if (el) el.classList.add("visible"); }
function closeModal(id) { const el = document.getElementById(id); if (el) el.classList.remove("visible"); }
document.addEventListener("click", e => { if (e.target.classList.contains("modal-overlay")) e.target.classList.remove("visible"); });
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
  // Add transition class to body for smooth switch
  document.body.style.transition = 'background-color 0.5s ease, color 0.4s ease';
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("hq_theme", theme);
  const lightBtn = document.getElementById("themeLight");
  const darkBtn = document.getElementById("themeDark");
  if (lightBtn) lightBtn.classList.toggle("active", theme === "light");
  if (darkBtn) darkBtn.classList.toggle("active", theme === "dark");
  // Canvas picks up the new theme naturally on next draw tick — no restart needed
}

// ══════════════════════════════════════════
// JUNGLE CANVAS BACKGROUND
// ══════════════════════════════════════════
function initCanvas() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w, h, animId;
  let leaves = [];
  let vines = [];
  let fireflies = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    buildScene();
  }

  function buildScene() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";

    // Floating leaves
    leaves = Array.from({ length: 22 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      size: 8 + Math.random() * 14,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -0.2 - Math.random() * 0.3,
      alpha: 0.25 + Math.random() * 0.35,
      color: isDark ? ["#3d7a3d","#2a5a2a","#4a8a4a","#5a9a5a"][Math.floor(Math.random()*4)] :
                      ["#4caf60","#81c784","#2e7d32","#66bb6a"][Math.floor(Math.random()*4)],
    }));

    // Fireflies / particles (night mode = fireflies, day = light dapples)
    fireflies = Array.from({ length: isDark ? 30 : 15 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: isDark ? 2 + Math.random() * 3 : 3 + Math.random() * 5,
      dx: (Math.random() - 0.5) * 0.5, dy: (Math.random() - 0.5) * 0.5,
      alpha: Math.random(),
      alphaDir: (Math.random() > 0.5 ? 1 : -1) * 0.02,
      color: isDark ? "#fbbf24" : "rgba(200,255,180,0.6)",
    }));
  }

  function drawLeaf(ctx, x, y, size, angle, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    // Cartoon leaf shape
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.8, -size * 0.2, 0, size * 0.5);
    ctx.quadraticCurveTo(-size * 0.8, -size * 0.2, 0, -size);
    ctx.fill();
    // Midrib
    ctx.globalAlpha = alpha * 0.5;
    ctx.strokeStyle = "#2a5a2a";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.9);
    ctx.lineTo(0, size * 0.4);
    ctx.stroke();
    ctx.restore();
  }

  function drawBackground(isDark) {
    if (isDark) {
      // Night jungle gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#050d07");
      grad.addColorStop(0.4, "#081510");
      grad.addColorStop(1, "#0a1a0d");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Moon glow
      const moonGrad = ctx.createRadialGradient(w * 0.8, h * 0.15, 0, w * 0.8, h * 0.15, 180);
      moonGrad.addColorStop(0, "rgba(255,255,200,0.08)");
      moonGrad.addColorStop(1, "transparent");
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, w, h);
    } else {
      // Day jungle gradient
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#c8f0c8");
      grad.addColorStop(0.3, "#d8f5d0");
      grad.addColorStop(1, "#e8f5e0");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Sun glow top right
      const sunGrad = ctx.createRadialGradient(w * 0.85, h * 0.1, 0, w * 0.85, h * 0.1, 280);
      sunGrad.addColorStop(0, "rgba(255,240,150,0.25)");
      sunGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  let tick = 0;
  function draw() {
    tick++;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    ctx.clearRect(0, 0, w, h);

    drawBackground(isDark);

    // Draw floating leaves
    leaves.forEach(l => {
      l.x += l.dx + Math.sin(tick * 0.01 + l.angle) * 0.15;
      l.y += l.dy;
      l.angle += l.rotSpeed;
      if (l.y < -30) { l.y = h + 20; l.x = Math.random() * w; }
      if (l.x < -30) l.x = w + 20;
      if (l.x > w + 30) l.x = -20;
      drawLeaf(ctx, l.x, l.y, l.size, l.angle, l.color, l.alpha);
    });

    // Draw fireflies / dapples
    fireflies.forEach(f => {
      f.x += f.dx + Math.sin(tick * 0.008 + f.r) * 0.2;
      f.y += f.dy + Math.cos(tick * 0.007 + f.r) * 0.2;
      f.alpha += f.alphaDir;
      if (f.alpha > 0.9 || f.alpha < 0.05) f.alphaDir *= -1;
      if (f.x < 0) f.x = w; if (f.x > w) f.x = 0;
      if (f.y < 0) f.y = h; if (f.y > h) f.y = 0;
      ctx.save();
      ctx.globalAlpha = f.alpha * (isDark ? 0.9 : 0.4);
      if (isDark) {
        // Glowing firefly
        const grd = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 3);
        grd.addColorStop(0, "#fbbf24");
        grd.addColorStop(0.5, "rgba(251,191,36,0.3)");
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Light dapple
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    animId = requestAnimationFrame(draw);
  }

  window._canvasCleanup = () => { cancelAnimationFrame(animId); };
  resize();
  draw();
  window.addEventListener("resize", resize);
}

// ══════════════════════════════════════════
// FOOD ACCORDIONS
// ══════════════════════════════════════════
function toggleAccordion(headerBtn) {
  const body = headerBtn.nextElementSibling;
  const isOpen = headerBtn.classList.contains("open");
  headerBtn.classList.toggle("open", !isOpen);
  body.classList.toggle("open", !isOpen);
}

// ══════════════════════════════════════════
// FOOD
// ══════════════════════════════════════════
const foodLog = [];
const CALORIE_GOAL = 2000;
const customQuickFoods = JSON.parse(localStorage.getItem("hq_custom_foods") || "[]");
function updateCalorieUI() {
  const total = foodLog.reduce((sum, f) => sum + f.calories, 0);
  const remaining = Math.max(0, CALORIE_GOAL - total);
  const pct = Math.min(100, (total / CALORIE_GOAL) * 100);
  const consumed = document.getElementById("calorieConsumed");
  const rem = document.getElementById("calorieRemaining");
  const bar = document.getElementById("calorieBar");
  if (consumed) consumed.textContent = total;
  if (rem) rem.textContent = remaining;
  if (bar) { bar.style.width = pct + "%"; bar.style.background = pct > 100 ? "#e07a5f" : pct > 75 ? "#f0a500" : "var(--green)"; }
  const logCard = document.getElementById("foodLogCard");
  const logItems = document.getElementById("foodLogItems");
  const logTotal = document.getElementById("foodLogTotal");
  if (foodLog.length > 0) {
    if (logCard) logCard.style.display = "block";
    if (logItems) logItems.innerHTML = foodLog.slice().reverse().map((f, i) =>
      `<div class="log-item"><span>${f.name}</span><span class="log-reps">${f.calories} kcal<button onclick="removeFood(${foodLog.length-1-i})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);margin-left:0.5rem;font-size:0.9rem;">✕</button></span></div>`
    ).join("");
    if (logTotal) logTotal.textContent = total;
  } else { if (logCard) logCard.style.display = "none"; }
}
function addFood() {
  const nameEl = document.getElementById("foodName");
  const calEl = document.getElementById("foodCalories");
  const name = nameEl.value.trim();
  const calories = parseInt(calEl.value);
  if (!name || isNaN(calories) || calories <= 0) { showToast("⚠️", "Please enter a valid food name and calories."); return; }
  foodLog.push({ name, calories });
  nameEl.value = ""; calEl.value = "";
  updateCalorieUI(); showToast("🍽️", `Added ${name} — ${calories} kcal`);
}
function quickAdd(name, calories) { foodLog.push({ name, calories }); updateCalorieUI(); showToast("🍽️", `Added ${name} — ${calories} kcal`); }
function removeFood(index) { foodLog.splice(index, 1); updateCalorieUI(); }
function clearFoodLog() { foodLog.length = 0; updateCalorieUI(); showToast("🗑️", "Food log cleared."); }
function renderCustomQuickFoods() {
  const container = document.getElementById("quickFoodsContainer");
  const accordion = document.getElementById("customAccordion");
  if (!container) return;
  container.querySelectorAll(".custom-quick-btn").forEach(e => e.remove());
  customQuickFoods.forEach((f, i) => {
    const btn = document.createElement("button");
    btn.className = "quick-food-btn custom-quick-btn";
    btn.innerHTML = `🍴 ${f.name} <span>${f.calories}</span> <span onclick="removeCustomQuickFood(${i})" style="color:var(--text-muted);margin-left:0.3rem;font-size:0.9rem;">✕</span>`;
    btn.onclick = () => quickAdd(f.name, f.calories);
    container.appendChild(btn);
  });
  // Show/hide the custom accordion
  if (accordion) accordion.style.display = customQuickFoods.length > 0 ? "block" : "none";
}
function addCustomQuickFood() {
  const name = document.getElementById("customFoodName").value.trim();
  const calories = parseInt(document.getElementById("customFoodCalories").value);
  if (!name || isNaN(calories) || calories <= 0) { showToast("⚠️", "Please enter a valid name and calories."); return; }
  customQuickFoods.push({ name, calories });
  localStorage.setItem("hq_custom_foods", JSON.stringify(customQuickFoods));
  document.getElementById("customFoodName").value = "";
  document.getElementById("customFoodCalories").value = "";
  renderCustomQuickFoods(); showToast("✅", `${name} added to Quick Add!`);
}
function removeCustomQuickFood(index) {
  customQuickFoods.splice(index, 1);
  localStorage.setItem("hq_custom_foods", JSON.stringify(customQuickFoods));
  renderCustomQuickFoods();
}

// ══════════════════════════════════════════
// INIT
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("hq_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  const lastUser = localStorage.getItem("hq_active_user");
  if (lastUser) {
    const acc = getAccount(lastUser);
    if (acc) {
      state.user = loadUserState(lastUser) || acc.data;
      state.user.completedQuests = state.user.completedQuests instanceof Set
        ? state.user.completedQuests
        : new Set(state.user.completedQuests || []);
      awardedAch.clear();
      if (state.user.earnedAchievements) state.user.earnedAchievements.forEach(id => awardedAch.add(id));
      afterSignIn();
    }
  }

  renderQuestsGrid();
  renderAchievements();
  renderCustomQuickFoods();
  initCanvas();

  // ── HAMBURGER MENU ──
  const hamburger = document.getElementById("hamburger");
  const headerNav = document.querySelector(".header-nav");
  if (hamburger && headerNav) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      hamburger.classList.toggle("open");
      headerNav.classList.toggle("open");
    });
    // Close on nav link click
    headerNav.querySelectorAll(".nav-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        hamburger.classList.remove("open");
        headerNav.classList.remove("open");
      });
    });
    // Close on outside click
    document.addEventListener("click", (e) => {
      if (!headerNav.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove("open");
        headerNav.classList.remove("open");
      }
    });
  }

  // Set theme buttons
  const lightBtn = document.getElementById("themeLight");
  const darkBtn = document.getElementById("themeDark");
  if (lightBtn) lightBtn.classList.toggle("active", savedTheme === "light");
  if (darkBtn) darkBtn.classList.toggle("active", savedTheme === "dark");
});