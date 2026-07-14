import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Clock, HelpCircle, Target, Award, Play, ShieldAlert, Zap } from "lucide-react";

export default function QuizView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Bonus Features State
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);

  useEffect(() => {
    fetch("/data/quiz.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data) => {
        const found = data.quizzes.find((q) => q.id === id);
        if (found) {
          setQuiz(found);
        } else {
          setError("Quiz not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Oops! {error}</h2>
        <Link to="/" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
    );
  }

  // Calculate total possible points
  const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-6 font-medium">
        <ArrowLeft size={20} /> Back to Quizzes
      </Link>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700/50">
        {/* Header / Cover */}
        <div className="h-48 md:h-64 w-full relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-90 z-10 mix-blend-multiply"></div>
          {quiz.thumbnail ? (
            <img src={quiz.thumbnail} alt={quiz.title} className="w-full h-full object-cover absolute inset-0" />
          ) : (
            <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-indigo-500 to-fuchsia-500"></div>
          )}
          <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 text-white">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold w-max mb-3 border border-white/30">
              {quiz.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">{quiz.title}</h1>
            <p className="text-indigo-100 text-lg max-w-2xl">{quiz.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <HelpCircle className="text-indigo-500 mb-2" size={28} />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{quiz.totalQuestions}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Questions</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Clock className="text-emerald-500 mb-2" size={28} />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{quiz.timePerQuestion}s</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Per Question</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Target className="text-amber-500 mb-2" size={28} />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{quiz.difficulty}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Difficulty</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Award className="text-fuchsia-500 mb-2" size={28} />
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{totalPoints}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Max Points</span>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-6 mb-10">
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
              <ShieldAlert size={24} />
              Rules & Guidelines
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-indigo-800 dark:text-indigo-200">
                <div className="mt-1 bg-indigo-200 dark:bg-indigo-700 rounded-full p-1"><Zap size={14} /></div>
                <span>You have exactly <strong>{quiz.timePerQuestion} seconds</strong> to answer each question.</span>
              </li>
              <li className="flex items-start gap-3 text-indigo-800 dark:text-indigo-200">
                <div className="mt-1 bg-indigo-200 dark:bg-indigo-700 rounded-full p-1"><Zap size={14} /></div>
                <span>If the timer runs out, it automatically counts as an incorrect answer and moves to the next question.</span>
              </li>
              <li className="flex items-start gap-3 text-indigo-800 dark:text-indigo-200">
                <div className="mt-1 bg-indigo-200 dark:bg-indigo-700 rounded-full p-1"><Zap size={14} /></div>
                <span>Answers cannot be changed once submitted.</span>
              </li>
              <li className="flex items-start gap-3 text-indigo-800 dark:text-indigo-200">
                <div className="mt-1 bg-indigo-200 dark:bg-indigo-700 rounded-full p-1"><Zap size={14} /></div>
                <span>Your final score will be submitted to the leaderboard. Good luck!</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="flex flex-wrap justify-center gap-6 mb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={shuffleQuestions} onChange={() => setShuffleQuestions(!shuffleQuestions)} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${shuffleQuestions ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${shuffleQuestions ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Shuffle Questions</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={shuffleOptions} onChange={() => setShuffleOptions(!shuffleOptions)} />
                  <div className={`block w-14 h-8 rounded-full transition-colors ${shuffleOptions ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${shuffleOptions ? 'transform translate-x-6' : ''}`}></div>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-violet-600 transition-colors">Shuffle Options</span>
              </label>
            </div>

            <button 
              onClick={() => navigate(`/play/${quiz.id}`, { state: { shuffleQuestions, shuffleOptions } })}
              className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl hover:from-indigo-500 hover:to-violet-500 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black"></div>
              <span className="relative flex items-center gap-3 text-xl">
                Start Quiz Now
                <Play className="group-hover:translate-x-1 transition-transform" size={24} fill="currentColor" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
