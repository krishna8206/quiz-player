# 🏆 Quiz Player - Interactive Quiz Arena

A high-fidelity, responsive, and beautifully animated **Quiz Player** application built using **React.js**, **React Router**, and **Tailwind CSS**. It supports dynamic quiz retrieval, interactive timers, option/question shuffling, synthesized retro sound effects, a keyboard shortcut configuration system, and a **Firebase Firestore Leaderboard** (with automated fallback to **LocalStorage**).

---

## 🚀 Features

- **Dynamic Quiz Arena Lobby**: View multiple categories (General Knowledge, Programming, Science, Entertainment, Sports) with card-based descriptions, difficulty levels, and time allowances.
- **Advanced Searching & Filtering**: Search quizzes instantly by title or description, or filter using interactive pills for Category and Difficulty.
- **High-Fidelity Quiz Engine**:
  - **Countdown Timer**: Automatically advances to the next question on timeout.
  - **Dynamic Shuffling**: Options to toggle question and answer choice shuffling before starting.
  - **No Backtracking**: Enforces a strict one-way quiz campaign flow.
  - **Keyboard Shortcuts**: Select choices using numeric keys `1`-`4` (or `A`-`D` equivalents), and press `Enter` to advance.
- **Audio Synthesizer Engine**: Cross-platform retro audio cues (correct chime, wrong buzzer, time tick warnings) generated dynamically via **Web Audio API** (zero assets to fetch/fail).
- **Campaign Leaderboard**:
  - Top 10 scores ranked by highest points (descending) and latest completion times.
  - **Cloud Firestore + LocalStorage Fallback**: Connects directly to Firestore if environment variables are set; otherwise, it seamlessly degrades to LocalStorage, rendering a status indicator badge on the navigation bar.
- **Interactive Review Panel**: Expand the result panel to inspect all questions, your selection, the correct answer, and an in-depth explanation block.
- **Premium Styling & Dark Mode**: Glassmorphism cards, custom scrollbars, typography, and full dark-theme integration.

---

## 🛠️ Tech Stack

- **Framework**: React.js (Vite template, React 19)
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` plugin)
- **Routing**: React Router DOM v6
- **Database**: Firebase Client SDK v10 (Firestore) / LocalStorage caching
- **Celebrations**: Canvas-Confetti

---

## 📦 Local Setup Instructions

### 1. Install Dependencies
Run the command wrapper inside the project folder:
```bash
npm install
```

### 2. Configure Firebase Environment (Optional)
If you want to use Firebase Firestore for global leaderboards, create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```
> **Note**: If left blank, the application will run in **Local Mode** automatically, storing rankings in the browser's `localStorage` and displaying a yellow "Local DB" status badge.

### 3. Run Dev Server
Launch Vite's development compilation:
```bash
npm run dev
```

---

## 🤖 AI Usage Report

In accordance with the assignment evaluation guidelines, here is a report of our AI-pair programming workflow:

### 1. AI Tools Used
- **Antigravity** (Powered by Gemini) served as the primary full-stack development agent.

### 2. Where AI Helped
- **Synthesized Web Audio**: Developed the inline retro sound generator mapping frequency sequences (C5 -> E5 sine chiming, triangle sawtooth pitch drops) avoiding standard audio file pre-load delays.
- **Responsive Layout Design**: Implemented standard glassmorphism layouts (`backdrop-filter`) and grid systems matching standard mobile/tablet screen sizes.
- **Database Fallback Architecture**: Coded the abstraction database layer (`leaderboardService.js`) to handle both Firestore collections and local storage equivalents interchangeably, preventing run-time errors if Firebase is unconfigured.
- **Keyframe CSS Animations**: Configured keyframe scripts (`fadeInUp`, `wiggle`, `scaleUp`) for active transitions.

### 3. What You Implemented Yourself
- **Router Configuration & Contexts**: Setup the page components, URL route parameters (`/quiz/:id`), and browser path redirects.
- **Filtering State Hooks**: Developed state triggers monitoring search input string changes and chip button activations.
- **Score Calculation Logic**: Coded correct points evaluation and accuracy scoring.
