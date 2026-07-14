import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, HelpCircle, ArrowRight, BookOpen, Star } from "lucide-react";

export default function QuizCard({ quiz }) {
  const { id, title, description, category, difficulty, timePerQuestion, totalQuestions, thumbnail } = quiz;
  const [imageError, setImageError] = useState(false);

  // Gradient configurations corresponding to categories for a beautiful fallback
  const getCategoryGradient = (cat) => {
    const formatted = cat.toLowerCase();
    if (formatted.includes("programming")) {
      return "from-slate-900 to-indigo-950 text-indigo-200";
    }
    if (formatted.includes("science")) {
      return "from-teal-900 to-emerald-950 text-emerald-200";
    }
    if (formatted.includes("sports")) {
      return "from-blue-900 to-indigo-950 text-indigo-200";
    }
    if (formatted.includes("entertainment")) {
      return "from-rose-900 to-purple-950 text-purple-200";
    }
    return "from-violet-900 to-purple-950 text-purple-200"; // General Knowledge / default
  };

  // Difficulty badge colors
  const getDifficultyColor = (diff) => {
    const formatted = diff.toLowerCase();
    if (formatted === "easy") {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
    }
    if (formatted === "medium") {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
    }
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"; // Hard
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/40 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-violet-500/40 animate-scale-up">
      
      {/* Thumbnail or Gradient Fallback */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        {!imageError && thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full flex-col justify-between bg-gradient-to-br ${getCategoryGradient(category)} p-5`}>
            <div className="flex justify-between items-start">
              <span className="rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                {category}
              </span>
              <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${getDifficultyColor(difficulty)} bg-slate-900/40 backdrop-blur-md border-0 text-white dark:text-white`}>
                {difficulty}
              </span>
            </div>
            <div>
              <BookOpen className="h-8 w-8 opacity-40 mb-2" />
              <h3 className="text-xl font-bold tracking-tight text-white leading-tight">
                {title}
              </h3>
            </div>
          </div>
        )}

        {/* Hover overlay details when image is loaded */}
        {!imageError && thumbnail && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent p-5 flex flex-col justify-end opacity-100">
            <span className="self-start rounded-lg bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-md mb-1.5">
              {category}
            </span>
            <h3 className="text-xl font-bold tracking-tight text-white leading-tight group-hover:text-violet-200 transition-colors">
              {title}
            </h3>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Description */}
        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
          {description}
        </p>

        {/* Stats Grid */}
        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-violet-500" />
            <span>Time: {timePerQuestion}s / q</span>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            <HelpCircle className="h-4 w-4 text-indigo-500" />
            <span>{totalQuestions} Questions</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100/60 pt-4 dark:border-slate-800/60">
          {/* Difficulty Badge when thumbnail is loaded */}
          {!imageError && thumbnail ? (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
              {difficulty}
            </span>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              <span>Perfect Practice</span>
            </div>
          )}

          <Link
            to={`/quiz/${id}`}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-200 transition-all duration-200 hover:bg-indigo-600 hover:shadow-indigo-200 group-hover:px-5 dark:shadow-none"
          >
            <span>Play Quiz</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
