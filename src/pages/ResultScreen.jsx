import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link, useParams } from "react-router-dom";
import { Trophy, CheckCircle2, XCircle, RotateCcw, Home, Sparkles, ChevronDown, ChevronUp, User, Award } from "lucide-react";
import confetti from "canvas-confetti";
import { saveLeaderboardEntry, getLeaderboard } from "../services/leaderboardService";

export default function ResultScreen() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve performance state from navigation context
  const stats = location.state || null;

  // Leaderboard states
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [submissionFeedback, setSubmissionFeedback] = useState("");

  // Review section collapse toggle
  const [showReview, setShowReview] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const data = await getLeaderboard(id);
      setLeaderboardData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [id]);

  // 1. Confetti & Initial Load
  useEffect(() => {
    if (stats) {
      // Fire confetti if the user scored >= 70%
      if (stats.percentage >= 70) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Load leaderboard data
      fetchLeaderboard();
    } else {
      // Redirect to home if no quiz stats exist in location state
      navigate("/");
    }
  }, [stats, fetchLeaderboard, navigate]);

  if (!stats) return null;

  const { quizTitle, score, totalPoints, correctAnswers, wrongAnswers, percentage, answersLog } = stats;

  // Custom feedback messages based on score
  const getFeedback = (pct) => {
    if (pct === 100) return { message: "Legendary Performance! Perfect Score!", color: "text-emerald-500", bg: "bg-emerald-500/10" };
    if (pct >= 80) return { message: "Excellent Work! You're a Master!", color: "text-violet-500", bg: "bg-violet-500/10" };
    if (pct >= 50) return { message: "Good Effort! Keep Practicing!", color: "text-indigo-500", bg: "bg-indigo-500/10" };
    return { message: "Don't give up! Try again to boost your score!", color: "text-rose-500", bg: "bg-rose-500/10" };
  };

  const feedback = getFeedback(percentage);

  // Handle Leaderboard Form Submission
  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setIsSubmitting(true);
    setSubmissionFeedback("");

    try {
      const entry = {
        name: userName.trim(),
        quizId: id,
        quizTitle: quizTitle,
        score: score,
        percentage: percentage,
        completedAt: new Date().toISOString()
      };

      const result = await saveLeaderboardEntry(entry);
      setScoreSubmitted(true);
      
      if (result.mode === "firestore") {
        setSubmissionFeedback("Successfully saved to Firestore leaderboards!");
      } else if (result.mode === "local_fallback") {
        setSubmissionFeedback("Saved locally (Firestore write failed).");
      } else {
        setSubmissionFeedback("Saved locally to your browser.");
      }

      // Re-fetch leaderboard to show newly added score
      await fetchLeaderboard();
    } catch (err) {
      console.error(err);
      setSubmissionFeedback("Failed to save score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12 animate-fade-in-up">
      {/* Title Header */}
      <div className="text-center mb-10">
        <h1 className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl dark:from-violet-400 dark:to-purple-400">
          Campaign Result
        </h1>
        <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">
          Quiz: {quizTitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Score & Statistics Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-xl text-center border border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden">
            {/* Visual Trophy Icon */}
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-150 mb-6 dark:shadow-none animate-scale-up">
              <Trophy className="h-10 w-10 animate-bounce" />
            </div>

            {/* Performance Badge */}
            <div className={`inline-block rounded-full px-4 py-1.5 text-xs font-bold ${feedback.color} ${feedback.bg} uppercase tracking-wider mb-3`}>
              {feedback.message}
            </div>

            {/* Score Big Display */}
            <div className="mt-2">
              <span className="text-5xl sm:text-6xl font-extrabold text-slate-800 dark:text-slate-50 font-mono tracking-tight">
                {score}
              </span>
              <span className="text-xl text-slate-400 font-semibold font-mono"> / {totalPoints} pts</span>
            </div>

            {/* Percentage Indicator */}
            <p className="mt-1 text-sm font-semibold text-slate-400">
              Accuracy: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{percentage}%</span>
            </p>

            {/* Micro Stats Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-left border border-slate-100/60 dark:border-slate-800/60">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Correct</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{correctAnswers} answers</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 text-left border border-slate-100/60 dark:border-slate-800/60">
                <XCircle className="h-8 w-8 text-rose-500 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Incorrect</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{wrongAnswers} answers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Form & Rank Submissions */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-md">
            {!scoreSubmitted ? (
              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-violet-500" />
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Register Score on Leaderboard
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your name to submit your score of <b>{score} points</b> ({percentage}%) to this quiz's leaderboard ranking.
                </p>

                <div className="flex gap-2.5">
                  <div className="relative flex-1">
                    <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={15}
                      placeholder="Your Nickname"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 py-2.5 pr-4 pl-10 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !userName.trim()}
                    className={`rounded-xl px-5 font-bold text-sm text-white transition-all cursor-pointer ${
                      isSubmitting || !userName.trim()
                        ? "bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-violet-600 hover:bg-violet-700 active:scale-97"
                    }`}
                  >
                    {isSubmitting ? "Submitting..." : "Save Rank"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-2">
                <div className="inline-flex rounded-full bg-emerald-50 p-2 text-emerald-500 dark:bg-emerald-950/20 mb-2">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Score Submitted</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{submissionFeedback}</p>
              </div>
            )}
          </div>

          {/* Navigation Action controls */}
          <div className="flex gap-4">
            <Link
              to={`/quiz/${id}`}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 transition-all hover:scale-101 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Play Again</span>
            </Link>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow shadow-indigo-100 hover:from-indigo-600 hover:to-violet-600 transition-all hover:scale-101 cursor-pointer dark:shadow-none"
            >
              <Home className="h-4 w-4" />
              <span>Quiz Arena Home</span>
            </Link>
          </div>
        </div>

        {/* Leaderboard Rankings Column */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-md min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span>Top 10 Rankings</span>
              </h3>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
                {id.replace("quiz_", "Campaign ")}
              </span>
            </div>

            {leaderboardLoading ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
                <span className="text-xs text-slate-400 font-semibold">Updating ranks...</span>
              </div>
            ) : leaderboardData.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
                {leaderboardData.map((item, idx) => {
                  const isCurrentUser =
                    scoreSubmitted &&
                    item.name === userName.trim() &&
                    item.score === score &&
                    item.percentage === percentage;
                  
                  return (
                    <div
                      key={item.id || idx}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold ${
                        isCurrentUser
                          ? "bg-violet-500/10 border-violet-500 text-violet-700 dark:bg-violet-950/15 dark:border-violet-400 dark:text-violet-300 ring-1 ring-violet-500/10"
                          : "bg-slate-50/50 border-slate-100 dark:bg-slate-900/30 dark:border-slate-800 text-slate-700 dark:text-slate-350"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Circle */}
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                            idx === 0
                              ? "bg-amber-500 text-white"
                              : idx === 1
                              ? "bg-slate-300 text-slate-700"
                              : idx === 2
                              ? "bg-amber-600 text-white"
                              : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[120px] font-bold text-slate-800 dark:text-slate-200">
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-slate-800 dark:text-slate-200 font-extrabold block">
                            {item.score} pts
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block">
                            {item.percentage}% accuracy
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block mb-1">
                  No records yet
                </span>
                <span className="text-[10px] text-slate-400 leading-normal block max-w-[160px] mx-auto">
                  Be the first to secure a spot on the board by saving your rank.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Section Accordion */}
      <div className="mt-10 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden glass-card">
        <button
          onClick={() => setShowReview(!showReview)}
          className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-slate-700 dark:text-slate-200 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <span>Detailed Answer Campaign Review</span>
          </div>
          {showReview ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {showReview && (
          <div className="border-t border-slate-100 dark:border-slate-800 p-6 space-y-6 max-h-[500px] overflow-y-auto bg-slate-50/20 dark:bg-slate-900/10">
            {answersLog.map((log, index) => (
              <div
                key={index}
                className={`p-5 rounded-2xl border text-sm ${
                  log.isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-950/10"
                    : "bg-rose-500/5 border-rose-500/20 dark:bg-rose-950/10"
                }`}
              >
                {/* Question Info Header */}
                <div className="flex justify-between items-start gap-4 mb-3">
                  <span className="text-xs font-bold font-mono text-slate-400">
                    Question {index + 1}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      log.isCorrect
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                    }`}
                  >
                    {log.isCorrect ? `+${log.points} points` : "0 points"}
                  </span>
                </div>

                {/* Question Text */}
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-4 leading-snug">
                  {log.questionText}
                </p>

                {/* Choices review grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold mb-3">
                  <div className="p-3 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Your Choice</span>
                    <span className={`flex items-center gap-1.5 font-bold ${log.isCorrect ? "text-emerald-600 dark:text-emerald-450" : "text-rose-600 dark:text-rose-450"}`}>
                      {log.isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 text-rose-500" />
                      )}
                      <span>{log.selected}</span>
                    </span>
                  </div>

                  {!log.isCorrect && (
                    <div className="p-3 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Correct Answer</span>
                      <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{log.correct}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Explanation text */}
                {log.explanation && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-100/50 dark:border-slate-800/50 italic leading-relaxed">
                    💡 <b>Explanation:</b> {log.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
