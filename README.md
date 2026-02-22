# 🌿 StayFit FV

> **A gamified fitness web app by FuturiVictores** — AI-generated quests, live camera rep counting, calorie tracking, social features, and a rank-up progression system. No backend, no installation — just open in a browser.

---

## ✨ Features

### ⚔️ AI-Powered Quests
- On sign-up, your body profile (age, weight, height, body type, goal, activity level) is sent to the **Groq AI API**, which generates a personalised set of **13 quests** — 6 daily, 4 weekly, 3 monthly
- Quests are tailored to your fitness goal (lose weight / build strength / stay active) and activity level
- Groq also calculates your **personalised daily calorie goal** using the Mifflin-St Jeor formula

### 📷 Live Camera Rep Counting (MediaPipe)
- Uses **Google MediaPipe Pose Landmarker** (runs entirely in-browser, no server needed) to track your body in real time
- Supports 5 tracked exercises with automatic rep detection:
  - **Push-Ups** — elbow angle detection
  - **Squats** — knee angle detection
  - **Jumping Jacks** — wrist-above-shoulder + jump detection via hip baseline tracking
  - **Sit-Ups** — torso angle detection
  - **Lunges** — knee angle detection
- A **5-second countdown** gives you time to get into position before tracking starts
- On-screen cues tell you exactly what to do in real time

### 🏋️ Training Page
- Free-form rep counter separate from quests
- Choose any exercise and start a live session with session logging

### 🍎 Food & Calorie Tracker
- Log meals from quick-select foods or add custom foods
- Tracks calories against your AI-calculated daily goal
- Progress bar updates in real time

### 🏆 Achievements & Ranks
- XP-based rank progression: Seedling → Iron → Bronze → Silver → Gold → Platinum → Diamond → Legend
- Unlock badges for milestones (first quest, streaks, rep totals, etc.)
- Visual rank showcase with XP progress bar

### 👥 Social
- Send and accept friend requests by username
- View friends' stats (rank, stars, streak)
- Friend activity feed

### ⚙️ Settings
- Light / Dark theme toggle
- Edit body profile and regenerate quests
- Change username or password
- Delete account

---

## 📁 File Structure

```
StayFit/
├── index.html          # Landing / home page
├── quests.html         # AI quests + camera quest tracker
├── training.html       # Free-form rep counter
├── food.html           # Calorie tracker
├── achievements.html   # Ranks & badges
├── social.html         # Friends & social feed
├── about.html          # About the project
├── settings.html       # User settings
├── script.js           # All app logic (auth, AI, MediaPipe, quests, etc.)
├── styles.css          # All styling (light + dark themes)
├── config.js           # 🔑 API keys — gitignored, create this yourself
├── logo.png            # StayFit FV logo
└── .gitignore
```

---

## 🔑 Setup (API Keys)

The app needs a `config.js` file in the root directory. **This file is gitignored** — never commit your keys.

Create `config.js` with the following:

```js
// config.js — gitignored, do not commit
const GROQ_API_KEY = "your_groq_api_key_here";
```

Get a free Groq API key at [console.groq.com](https://console.groq.com).

> Without a valid Groq key, the app still works — it just won't generate AI quests and will show placeholder quests instead.

---

## 🚀 Running the App

No build step, no server, no dependencies to install.

**Option 1 — Just open it:**
```
Open index.html in any modern browser
```

**Option 2 — Local server (recommended, avoids camera permission issues on some browsers):**
```bash
# Python
python -m http.server 8000

# Node
npx serve .
```
Then visit `http://localhost:8000`.

> Camera access requires either `localhost` or `https`. Opening via `file://` may block the webcam on some browsers.

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript (no frameworks) |
| AI Quests | [Groq API](https://console.groq.com) (LLM via OpenAI-compatible endpoint) |
| Pose Detection | [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe) (WASM, runs in-browser) |
| Storage | Browser `localStorage` (all data stays on your device) |
| Fonts | Google Fonts — Fredoka One + Nunito |

---

## 🔒 Privacy

StayFit is **fully client-side** — no backend, no database, no analytics. Your data never leaves your device except for the AI quest generation call to Groq (which sends only your body profile stats, not any personal identifiers).

Camera feed is processed locally by MediaPipe and is never uploaded or stored anywhere.

---

## 👥 Team

Built by **FuturiVictores** · *Good Health & Well-Being*