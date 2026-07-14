import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import QuizList from "./pages/QuizList";
import QuizPlayer from "./pages/QuizPlayer";
import ResultScreen from "./pages/ResultScreen";
import "./App.css";

export default function App() {
  // Sync theme state with localStorage, default to dark mode or system preference
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("quiz_app_theme");
    if (savedTheme) return savedTheme;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return systemPrefersDark ? "dark" : "light";
  });

  useEffect(() => {
    // Update root document class for Tailwind's dark utility matching
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("quiz_app_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <BrowserRouter>
      <div className="min-height-screen flex flex-col bg-slate-50 text-slate-800 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
        {/* Navigation bar */}
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        {/* Page Content area */}
        <main className="flex-1 w-full flex flex-col">
          <Routes>
            <Route path="/" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizPlayer />} />
            <Route path="/result/:id" element={<ResultScreen />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="w-full border-t border-slate-200/60 py-6 text-center text-xs font-semibold text-slate-400 dark:border-slate-800/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Quiz Player. Crafted with React.js & Tailwind CSS.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
