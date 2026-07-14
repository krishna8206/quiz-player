import React, { useState, useEffect } from "react";
import QuizCard from "../components/QuizCard";
import { Search, SlidersHorizontal, BookOpen, Star, Clock } from "lucide-react";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  useEffect(() => {
    fetch("/data/quiz.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load quiz data");
        return res.json();
      })
      .then((data) => {
        setQuizzes(data.quizzes);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Compute Categories and Difficulties dynamically
  const categories = ["All", ...new Set(quizzes.map((q) => q.category))];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  // Filter Logic
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || quiz.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || quiz.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 dark:text-slate-400 animate-pulse font-medium">Loading amazing quizzes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6">
          <BookOpen size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Failed to Load Data</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-md">{error}</p>
        <p className="mt-4 text-sm text-slate-500">Please make sure `public/data/quiz.json` exists.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-800 text-white p-8 md:p-12 shadow-2xl">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-3xl mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
            Challenge Your Mind,<br />
            <span className="text-indigo-200">Elevate Your Knowledge.</span>
          </h1>
          <p className="text-lg text-indigo-100 mb-8 max-w-lg leading-relaxed">
            Dive into our curated collection of quizzes spanning multiple categories. Test yourself, track your scores, and climb the leaderboard!
          </p>
          
          {/* Search Bar in Hero */}
          <div className="relative flex items-center w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-1.5 shadow-inner border border-white/20 transition-all focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white/50">
            <div className="pl-4 pr-3 text-indigo-200">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search for a quiz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-white placeholder:text-indigo-200 py-3 pr-4 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700/50 sticky top-24">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-6">
              <SlidersHorizontal size={20} className="text-indigo-500" />
              <h2 className="text-lg">Filters</h2>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Category</h3>
              <div className="flex flex-col gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                      selectedCategory === cat 
                        ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 shadow-sm" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Difficulty</h3>
              <div className="flex flex-col gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`text-left px-4 py-2.5 rounded-xl transition-all duration-200 font-medium ${
                      selectedDifficulty === diff 
                        ? "bg-violet-50 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 shadow-sm" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Quiz Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
              {searchQuery || selectedCategory !== "All" || selectedDifficulty !== "All" ? "Search Results" : "Available Quizzes"}
            </h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-bold">
              {filteredQuizzes.length} Quizzes
            </span>
          </div>

          {filteredQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <div key={quiz.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <QuizCard quiz={quiz} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-sm border border-slate-200 dark:border-slate-700/50 flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                <Search size={32} className="text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No quizzes found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                We couldn't find any quizzes matching your current filters. Try adjusting your search criteria.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedDifficulty("All");
                }}
                className="btn-primary"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
