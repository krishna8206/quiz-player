import React, { useState, useEffect } from "react";
import QuizCard from "../components/QuizCard";
import { Search, SlidersHorizontal, BookOpen, Target, AlertCircle } from "lucide-react";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  useEffect(() => {
    // Fetch quizzes from the public json file
    fetch("/data/quiz.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load quiz data");
        }
        return res.json();
      })
      .then((data) => {
        setQuizzes(data.quizzes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Compute available categories and difficulty levels
  const categories = ["all", ...new Set(quizzes.map((q) => q.category))];
  const difficulties = ["all", ...new Set(quizzes.map((q) => q.difficulty))];

  // Filtering logic
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || quiz.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading quizzes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 inline-flex rounded-full bg-rose-50 p-3 text-rose-500 dark:bg-rose-950/20">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Unable to load quizzes</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Welcome Header & Statistics */}
      <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between border-b border-slate-100 dark:border-slate-800 pb-8">
        <div>
          <h1 className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl dark:from-violet-400 dark:to-purple-400">
            Welcome to Quiz Arena
          </h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Test your knowledge across programming, science, sports, and general trivia!
          </p>
        </div>

        {/* Stats Summary Dashboard */}
        <div className="mt-6 md:mt-0 flex gap-4 justify-center md:justify-start">
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{quizzes.length}</div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Total Quizzes</div>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {new Set(quizzes.map((q) => q.category)).size}
              </div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search quizzes by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white/50 py-3.5 pr-4 pl-12 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:bg-white focus:ring-1 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:focus:border-violet-500 dark:focus:bg-slate-900"
          />
        </div>

        {/* Filter Sliders Indicator for Mobile */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium border capitalize whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Difficulty Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {difficulties.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium border capitalize whitespace-nowrap transition-all duration-200 ${
                  selectedDifficulty === diff
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                {diff === "all" ? "All Difficulties" : diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredQuizzes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-3xl p-16 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
            <Search className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">No quizzes match search</h3>
          <p className="mt-1 text-sm text-slate-400">
            Try adjusting your category, difficulty filters, or search keywords.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedDifficulty("all");
            }}
            className="mt-6 cursor-pointer rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
