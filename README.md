# 🏆 Quiz Player - Interactive Quiz Arena

A high-fidelity, responsive, and beautifully animated **Quiz Player** application built using **React.js**, **React Router**, and **Tailwind CSS v4**. It supports dynamic quiz retrieval, interactive timers, question and option shuffling, synthesized retro sound effects, keyboard shortcuts, confetti celebrations, and a **Firebase Firestore Leaderboard** (with automated fallback to **LocalStorage**).

---

## 🚀 Features

- **Dynamic Quiz Arena Lobby**: View multiple categories (General Knowledge, Programming, Science, Entertainment, Sports) with card-based descriptions, difficulty levels, and time allowances.
- **Advanced Searching & Filtering**: Search quizzes instantly by title or description, or filter using interactive pills for Category and Difficulty.
- **High-Fidelity Quiz Engine**:
  - **Countdown Timer**: Automatically marks the question incorrect and advances on timeout.
  - **Dynamic Shuffling**: Options to toggle question and answer choice shuffling via the pre-game lobby using the Fisher-Yates algorithm.
  - **Keyboard Shortcuts**: Select choices using numeric keys `1`-`4`, and press `Enter` to advance to the next question.
- **Audio Synthesizer Engine**: Cross-platform retro audio cues (correct chime, wrong buzzer, time tick warnings) generated dynamically via the **Web Audio API** (zero external assets).
- **Celebration Animations**: Triggers `canvas-confetti` fireworks dynamically depending on the user's final score percentage.
- **Campaign Leaderboard**:
  - Global leaderboard page tracking the Top 10 scores ranked by highest points and latest completion times.
  - **Cloud Firestore + LocalStorage Fallback**: Connects directly to Firestore if environment variables are set; otherwise, it seamlessly degrades to LocalStorage, rendering a status indicator badge on the navigation bar.
- **Premium Styling & Dark Mode**: Features modern glassmorphism UI, custom scrollbars, Google Outfit typography, and a globally integrated Dark Mode toggle.

---

## 🛠️ Tech Stack

- **Framework**: React.js (Vite template, React 19)
- **Styling**: Tailwind CSS v4 (using `@tailwindcss/vite` plugin)
- **Routing**: React Router DOM v6
- **Database**: Firebase Client SDK v10 (Firestore) / LocalStorage caching
- **Interactions**: Canvas-Confetti, Lucide-React Icons

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
- **Feature Implementation**: Developed the full quiz UI matching the requested design.
- **Synthesized Web Audio**: Developed the inline retro sound generator mapping frequency sequences (C5 -> E5 sine chiming, triangle sawtooth pitch drops) avoiding standard audio file pre-load delays.
- **Responsive Layout Design**: Implemented standard glassmorphism layouts (`backdrop-blur`), tailwind v4 dark mode configuration, and grid systems matching standard mobile/tablet screen sizes.
- **Database Fallback Architecture**: Coded the abstraction database layer (`leaderboardService.js`) to handle both Firestore collections and local storage equivalents interchangeably, resolving bugs related to global fetching.
- **Keyframe CSS Animations**: Configured keyframe scripts (`fadeInUp`, `wiggle`, `scaleUp`) for active transitions.

### 3. What You Implemented Myself
- **Feature Implementation**: Shuffling logic and integrated keyboard navigation constraints.
- **Router Configuration & Contexts**: Setup the page components, URL route parameters (`/quiz/:id`), and browser path redirects.
- **Filtering State Hooks**: Developed state triggers monitoring search input string changes and chip button activations.
- **Score Calculation Logic**: Coded correct points evaluation and accuracy scoring.
