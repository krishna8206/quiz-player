import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Clock, CheckCircle2, XCircle, Trophy, ArrowRight, Home, RotateCcw } from "lucide-react";
import confetti from "canvas-confetti";
import { saveLeaderboardEntry } from "../services/leaderboardService";
import { soundService } from "../services/soundService";

// Helper to shuffle an array (Fisher-Yates)
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { shuffleQuestions = false, shuffleOptions = false } = location.state || {};
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Gameplay State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Interaction State
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    fetch("/data/quiz.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((data) => {
        const found = data.quizzes.find((q) => q.id === id);
        if (found) {
          // Deep copy to allow mutation for shuffling
          let parsedQuiz = JSON.parse(JSON.stringify(found));
          
          // Apply shuffling features
          if (shuffleQuestions) {
            parsedQuiz.questions = shuffleArray(parsedQuiz.questions);
          }
          if (shuffleOptions) {
            parsedQuiz.questions.forEach((q) => {
              q.options = shuffleArray(q.options);
            });
          }
          
          setQuiz(parsedQuiz);
          setTimeLeft(parsedQuiz.timePerQuestion);
        } else {
          setError("Quiz not found");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, shuffleQuestions, shuffleOptions]);

  // Timer Effect
  useEffect(() => {
    if (loading || error || isFinished || isAnswered || !quiz) return;

    if (timeLeft === 0) {
      handleTimeOut();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 5 && newTime > 0) {
          soundService.playTick();
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [timeLeft, loading, error, isFinished, isAnswered, quiz]);

  const handleTimeOut = () => {
    setIsAnswered(true);
    setSelectedOption(null); // Indicates they ran out of time
    soundService.playWrong();
  };

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    clearInterval(timerRef.current);
    
    const currentQuestion = quiz.questions[currentIndex];
    if (option === currentQuestion.correctAnswer) {
      setScore((prev) => prev + (currentQuestion.points || 10));
      soundService.playCorrect();
    } else {
      soundService.playWrong();
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(quiz.timePerQuestion);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    
    // Trigger confetti based on score
    const totalPossible = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const percentage = score / totalPossible;
    
    if (percentage >= 0.7) {
      // Good score!
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    } else if (percentage >= 0.4) {
      // Okay score
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    setSubmittingScore(true);
    try {
      await saveLeaderboardEntry({ quizId: quiz.id, playerName: playerName.trim(), score });
      setScoreSubmitted(true);
    } catch (err) {
      console.error("Failed to submit score:", err);
      alert("Failed to submit score. Please try again.");
    } finally {
      setSubmittingScore(false);
    }
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't interfere if user is typing their name
      if (isFinished || loading || error || !quiz) return;

      if (!isAnswered) {
        const currentQuestion = quiz.questions[currentIndex];
        let selectedIdx = -1;
        if (e.key === '1') selectedIdx = 0;
        if (e.key === '2') selectedIdx = 1;
        if (e.key === '3') selectedIdx = 2;
        if (e.key === '4') selectedIdx = 3;
        
        if (selectedIdx >= 0 && selectedIdx < currentQuestion.options.length) {
          handleOptionSelect(currentQuestion.options[selectedIdx]);
        }
      } else {
        // If answered, pressing Enter advances to the next question
        if (e.key === 'Enter') {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, isFinished, loading, error, quiz, currentIndex]);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  if (error || !quiz) return <div className="text-center py-20">Error Loading Quiz.</div>;

  if (isFinished) {
    const totalPossible = quiz.questions.reduce((sum, q) => sum + (q.points || 10), 0);
    const percentage = Math.round((score / totalPossible) * 100);
    
    return (
      <div className="max-w-2xl mx-auto animate-fade-up">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 text-center">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-12 text-white relative">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <Trophy size={80} className="mx-auto mb-6 text-yellow-300 drop-shadow-lg animate-bounce" />
            <h2 className="text-4xl font-extrabold mb-2">Quiz Completed!</h2>
            <p className="text-indigo-100 text-lg">{quiz.title}</p>
          </div>
          
          <div className="p-8 md:p-12">
            <div className="mb-10">
              <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Your Final Score</div>
              <div className="flex items-end justify-center gap-2">
                <span className="text-6xl font-black text-slate-800 dark:text-white leading-none">{score}</span>
                <span className="text-2xl font-bold text-slate-400 mb-1">/ {totalPossible}</span>
              </div>
              <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-4 py-2 rounded-full font-bold">
                {percentage}% Accuracy
              </div>
            </div>

            {!scoreSubmitted ? (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 mb-8">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Save Your Score</h3>
                <form onSubmit={handleScoreSubmit} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter your name..."
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    maxLength={20}
                    required
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  />
                  <button 
                    type="submit" 
                    disabled={submittingScore || !playerName.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    {submittingScore ? "Saving..." : "Submit"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 mb-8 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={24} />
                Score successfully submitted to Leaderboard!
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/")} className="btn-secondary flex items-center justify-center gap-2">
                <Home size={20} /> Back to Home
              </button>
              <button onClick={() => window.location.reload()} className="btn-primary flex items-center justify-center gap-2">
                <RotateCcw size={20} /> Play Again
              </button>
              <button onClick={() => navigate("/leaderboard")} className="btn-secondary flex items-center justify-center gap-2 bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50">
                <Trophy size={20} /> View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex) / quiz.questions.length) * 100;
  
  // Determine time color
  let timeColor = "text-indigo-600 dark:text-indigo-400";
  if (timeLeft <= 5 && !isAnswered) timeColor = "text-red-500 animate-pulse";
  else if (timeLeft <= 10 && !isAnswered) timeColor = "text-amber-500";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-6">
        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          Question <span className="text-indigo-600 dark:text-indigo-400">{currentIndex + 1}</span> of {quiz.totalQuestions}
        </div>
        
        <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/50 font-bold flex items-center gap-2">
          Score: <span className="text-violet-600 dark:text-violet-400">{score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden shadow-inner">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 relative">
        
        {/* Timer Bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-700">
          <div 
            className="h-full bg-indigo-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / quiz.timePerQuestion) * 100}%`, backgroundColor: timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#6366f1' }}
          ></div>
        </div>

        <div className="p-8 md:p-10 pt-12">
          <div className="flex justify-between items-start mb-8 gap-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight">
              {currentQuestion.question}
            </h2>
            <div className={`flex-shrink-0 flex items-center gap-2 font-bold text-2xl ${timeColor} bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800`}>
              <Clock size={24} />
              {timeLeft}s
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentQuestion.options.map((option, idx) => {
              // Determine styles based on state
              let optionStyle = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:shadow-md";
              let icon = null;
              
              if (isAnswered) {
                if (option === currentQuestion.correctAnswer) {
                  optionStyle = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20";
                  icon = <CheckCircle2 className="text-emerald-500" size={24} />;
                } else if (option === selectedOption) {
                  optionStyle = "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300 ring-2 ring-red-500/20";
                  icon = <XCircle className="text-red-500" size={24} />;
                } else {
                  optionStyle = "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 text-slate-500";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 font-semibold text-lg flex justify-between items-center ${optionStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">
                      {idx + 1}
                    </span>
                    {option}
                  </span>
                  {icon && <span className="animate-scale-in">{icon}</span>}
                </button>
              );
            })}
          </div>

          {/* Explanation Section (Only shown after answering) */}
          {isAnswered && (
            <div className="animate-fade-up">
              {currentQuestion.explanation && (
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50 mb-8">
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                    <span className="bg-indigo-200 dark:bg-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-sm">i</span>
                    Explanation
                  </h4>
                  <p className="text-indigo-800 dark:text-indigo-200">{currentQuestion.explanation}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={handleNext}
                  className="btn-primary flex items-center gap-2 px-8 group"
                >
                  {currentIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  <span className="text-xs bg-indigo-500 px-2 py-1 rounded ml-2 hidden md:inline-block">Enter ↵</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
