import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import QuizList from "./pages/QuizList";
import QuizView from "./pages/QuizView";
import QuizPlayer from "./pages/QuizPlayer";
import Leaderboard from "./pages/Leaderboard";

function App() {
  // Theme state with localStorage persistence
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Apply theme class to body
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <main className="container mx-auto px-4 pt-8 pb-16 min-h-[calc(100vh-80px)]">
        <Routes>
          <Route path="/" element={<QuizList />} />
          <Route path="/quiz/:id" element={<QuizView />} />
          <Route path="/play/:id" element={<QuizPlayer />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
