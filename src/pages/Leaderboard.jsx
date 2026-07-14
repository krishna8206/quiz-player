import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, Clock, AlertCircle } from "lucide-react";
import { getLeaderboard } from "../services/leaderboardService";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // We'll also fetch quizzes to map quizId to quiz titles
  const [quizzes, setQuizzes] = useState({});

  useEffect(() => {
    // Fetch quizzes mapping
    fetch("/data/quiz.json")
      .then(res => res.json())
      .then(data => {
        const quizMap = {};
        data.quizzes.forEach(q => {
          quizMap[q.id] = q.title;
        });
        setQuizzes(quizMap);
      })
      .catch(err => console.error("Failed to load quiz data for mapping:", err));

    // Fetch leaderboard
    const fetchScores = async () => {
      try {
        const scores = await getLeaderboard();
        setLeaderboard(scores);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchScores();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Header Section */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-yellow-400/20 blur-3xl rounded-full z-0 pointer-events-none"></div>
        <Trophy size={64} className="mx-auto text-yellow-400 mb-4 drop-shadow-xl relative z-10" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 dark:text-white mb-4 relative z-10">Global Leaderboard</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto relative z-10">
          See who's dominating the quizzes. Will your name be at the top?
        </p>
      </div>

      {error ? (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl flex items-center justify-center gap-3 font-bold border border-red-100 dark:border-red-800/50">
          <AlertCircle size={24} />
          Failed to load leaderboard: {error}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-xl border border-slate-200 dark:border-slate-700/50 flex flex-col items-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
            <Star size={40} className="text-slate-300 dark:text-slate-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">No Scores Yet!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Be the first to complete a quiz and claim the #1 spot.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
                  <th className="p-6 font-bold w-24 text-center">Rank</th>
                  <th className="p-6 font-bold">Player</th>
                  <th className="p-6 font-bold hidden md:table-cell">Quiz</th>
                  <th className="p-6 font-bold">Date</th>
                  <th className="p-6 font-bold text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {leaderboard.map((entry, index) => {
                  let rowClass = "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors";
                  let RankIcon = null;
                  let rankTextClass = "text-slate-500 dark:text-slate-400 font-bold";
                  
                  if (index === 0) {
                    rowClass += " bg-yellow-50/50 dark:bg-yellow-900/10";
                    RankIcon = <Crown className="text-yellow-500 mx-auto" size={28} />;
                  } else if (index === 1) {
                    rowClass += " bg-slate-50/50 dark:bg-slate-800/50";
                    RankIcon = <Medal className="text-slate-400 mx-auto" size={28} />;
                  } else if (index === 2) {
                    rowClass += " bg-orange-50/50 dark:bg-orange-900/10";
                    RankIcon = <Medal className="text-orange-500 mx-auto" size={28} />;
                  } else {
                    RankIcon = <span className={rankTextClass}>#{index + 1}</span>;
                  }

                  const date = new Date(entry.createdAt).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  });

                  return (
                    <tr key={entry.id} className={rowClass}>
                      <td className="p-6 text-center align-middle">
                        {RankIcon}
                      </td>
                      <td className="p-6 font-bold text-lg text-slate-800 dark:text-white">
                        {entry.playerName}
                      </td>
                      <td className="p-6 text-slate-600 dark:text-slate-400 hidden md:table-cell font-medium">
                        {quizzes[entry.quizId] || entry.quizId}
                      </td>
                      <td className="p-6 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {date}
                        </div>
                      </td>
                      <td className="p-6 font-black text-2xl text-right text-indigo-600 dark:text-indigo-400">
                        {entry.score}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
