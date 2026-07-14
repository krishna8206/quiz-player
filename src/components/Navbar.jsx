import React from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Database, Sparkles } from "lucide-react";
import { isFirebaseConfigured } from "../firebase";

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-md shadow-indigo-200 dark:shadow-none group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:to-indigo-400">
              Quiz Player
            </span>
            <span className="hidden sm:inline-block ml-1 text-xs font-semibold text-slate-400">
              v1.0
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Storage Badge */}
          <div
            title={
              isFirebaseConfigured
                ? "Connected to Firebase Firestore database."
                : "Firebase keys not set. Scores are saved in LocalStorage."
            }
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
              isFirebaseConfigured
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800/40 dark:text-emerald-400"
                : "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-800/40 dark:text-amber-400"
            }`}
          >
            <Database className="h-3 w-3" />
            <span className="relative flex h-1.5 w-1.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isFirebaseConfigured ? "bg-emerald-400" : "bg-amber-400"
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isFirebaseConfigured ? "bg-emerald-500" : "bg-amber-500"
                }`}
              ></span>
            </span>
            <span>{isFirebaseConfigured ? "Firestore DB" : "Local DB"}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 hover:scale-105 hover:rotate-6 active:scale-95 transition-all duration-200"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="h-5 w-5 text-violet-600" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
