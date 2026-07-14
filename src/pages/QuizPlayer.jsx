import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Clock, ArrowLeft, Play, Volume2, VolumeX, Keyboard, Settings, ChevronRight } from "lucide-react";

export default function QuizPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Quiz content states
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configuration pre-game states
  const [isPrepScreen, setIsPrepScreen] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active quiz states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [answersLog, setAnswersLog] = useState([]); // tracks: { questionId, selected, correct, isCorrect, points }
  const [quizStarted, setQuizStarted] = useState(false);

  // Timer & state references
  const timerRef = useRef(null);
  const timeLeftRef = useRef(0);
  timeLeftRef.current = timeLeft;

  // Synthesize sound effects using Web Audio API (cross-platform, zero asset files required!)
  const playSynthesizerSound = useCallback((type) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08); // C#5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16); // E5
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === "incorrect") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.22);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === "tick") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.05);
      }
    } catch (err) {
      console.warn("AudioContext failed to initialize or play sound:", err);
    }
  }, [soundEnabled]);

  // 1. Fetch Quiz Data
  useEffect(() => {
    fetch("/data/quiz.json")
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch quiz definitions");
        return res.json();
      })
      .then((data) => {
        const found = data.quizzes.find((q) => q.id === id);
        if (!found) throw new Error("Quiz not found");
        setQuiz(found);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Helper: Shuffle an array (Fisher-Yates)
  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // 2. Start Quiz Handler
  const startQuiz = () => {
    if (!quiz) return;
    
    // Process questions
    let finalQuestions = quiz.questions.map((q) => {
      // Shuffle options if enabled, otherwise keep original
      const processedOptions = shuffleOptions ? shuffleArray(q.options) : [...q.options];
      return {
        ...q,
        shuffledOptions: processedOptions
      };
    });

    // Shuffle questions if enabled
    if (shuffleQuestions) {
      finalQuestions = shuffleArray(finalQuestions);
    }

    setQuestions(finalQuestions);
    setIsPrepScreen(false);
    setQuizStarted(true);
    setCurrentIdx(0);
    setTimeLeft(quiz.timePerQuestion);
  };

  // Helper to coordinate progression
  const advanceQuiz = useCallback((currentLog, currentScore) => {
    setSelectedOption("");
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Quiz Completed!
      if (timerRef.current) clearInterval(timerRef.current);
      setQuizStarted(false);

      // Compute details for result page
      const correctCount = currentLog.filter((l) => l.isCorrect).length;
      const wrongCount = questions.length - correctCount;
      const percentage = Math.round((correctCount / questions.length) * 100);

      // Navigate to results
      navigate(`/result/${quiz.id}`, {
        state: {
          quizId: quiz.id,
          quizTitle: quiz.title,
          score: currentScore,
          totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          percentage,
          answersLog: currentLog
        }
      });
    }
  }, [currentIdx, questions, quiz, navigate]);

  // 6. Automatically Move on Time-Out
  const handleTimeOut = useCallback(() => {
    const currentQuestion = questions[currentIdx];
    const newLog = [
      ...answersLog,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selected: "(Time Out)",
        correct: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        isCorrect: false,
        points: 0
      }
    ];
    setAnswersLog(newLog);
    
    // Play negative sound on timeout
    playSynthesizerSound("incorrect");

    advanceQuiz(newLog, score);
  }, [currentIdx, questions, answersLog, playSynthesizerSound, advanceQuiz, score]);

  // 3. Question Transition Timer
  useEffect(() => {
    if (!quizStarted || isPrepScreen || questions.length === 0 || !quiz) return;

    // Reset countdown timer for current question
    setTimeLeft(quiz.timePerQuestion);

    // Clear previous timer
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (timeLeftRef.current <= 1) {
        clearInterval(timerRef.current);
        handleTimeOut();
      } else {
        setTimeLeft((prev) => {
          const nextVal = prev - 1;
          // Play warning tick on last 3 seconds
          if (nextVal <= 3) {
            playSynthesizerSound("tick");
          }
          return nextVal;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIdx, quizStarted, isPrepScreen, questions, quiz, handleTimeOut, playSynthesizerSound]);

  // 5. Next Question / Option Submission Handler
  const goToNextQuestion = useCallback(() => {
    if (!selectedOption) return;

    const currentQuestion = questions[currentIdx];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const pointsAwarded = isCorrect ? currentQuestion.points : 0;

    // Sound effect based on correctness
    if (isCorrect) {
      playSynthesizerSound("correct");
    } else {
      playSynthesizerSound("incorrect");
    }

    // Save results
    const newLog = [
      ...answersLog,
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        selected: selectedOption,
        correct: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        isCorrect,
        points: pointsAwarded
      }
    ];
    setAnswersLog(newLog);

    const nextScore = score + pointsAwarded;
    setScore(nextScore);

    advanceQuiz(newLog, nextScore);
  }, [selectedOption, currentIdx, questions, answersLog, score, playSynthesizerSound, advanceQuiz]);

  // 4. Keyboard Navigation Setup
  useEffect(() => {
    if (isPrepScreen || !quizStarted) return;

    const handleKeyDown = (e) => {
      // Keys '1' to '4'
      if (["1", "2", "3", "4"].includes(e.key)) {
        const index = parseInt(e.key) - 1;
        const currentQuestion = questions[currentIdx];
        if (currentQuestion && currentQuestion.shuffledOptions[index]) {
          setSelectedOption(currentQuestion.shuffledOptions[index]);
        }
      }
      
      // Submit / Next on 'Enter'
      if (e.key === "Enter" && selectedOption) {
        goToNextQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOption, currentIdx, questions, isPrepScreen, quizStarted, goToNextQuestion]);



  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-500">Loading quiz engine...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mb-4 inline-flex rounded-full bg-rose-50 p-3 text-rose-500">
          <ArrowLeft className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Quiz not found</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error || "Check the URL and try again."}</p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-violet-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Quizzes
        </Link>
      </div>
    );
  }

  // Pre-game Setup Screen
  if (isPrepScreen) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12 animate-fade-in-up">
        {/* Header Breadcrumb */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-violet-600 transition-colors dark:text-slate-400 dark:hover:text-violet-400 mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Back to list
        </Link>

        <div className="glass-card overflow-hidden rounded-3xl border border-slate-200/80 shadow-xl dark:border-slate-800/80">
          {/* Cover gradient banner */}
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white text-center sm:p-10">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              {quiz.category}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
              {quiz.title}
            </h1>
            <p className="mt-3 text-violet-100 font-medium max-w-md mx-auto">
              {quiz.description}
            </p>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Rules Grid */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Settings className="h-5 w-5 text-violet-500" />
                <span>Quiz Setup & Information</span>
              </h2>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Timing</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {quiz.timePerQuestion} seconds per question
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-400 dark:text-slate-500 block uppercase tracking-wider">Questions</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                    {quiz.totalQuestions} Questions total
                  </span>
                </div>
              </div>

              {/* Game Rules List */}
              <ul className="mt-5 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                  <span>Only one option can be selected per question.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                  <span>Once selected, click <b>Next</b> or press <b>Enter</b> to proceed.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                  <span>If the timer runs out, the engine advances automatically (0 points).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500"></span>
                  <span>No navigation back: you cannot revisit previous questions.</span>
                </li>
              </ul>
            </div>

            {/* Toggle Config Toggles */}
            <div className="bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Customizations & Features
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Shuffle Qs */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Shuffle Questions</span>
                    <span className="text-[10px] text-slate-400 block">Randomizes order</span>
                  </div>
                </label>

                {/* Shuffle Options */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => setShuffleOptions(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Shuffle Options</span>
                    <span className="text-[10px] text-slate-400 block">Randomizes options</span>
                  </div>
                </label>

                {/* Sound Toggle */}
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="h-4.5 w-4.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  <div className="flex items-center gap-1">
                    {soundEnabled ? <Volume2 className="h-4 w-4 text-violet-500" /> : <VolumeX className="h-4 w-4 text-slate-400" />}
                    <div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Sound FX</span>
                      <span className="text-[10px] text-slate-400 block">Synthesizer audio</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Keyboard Shortcuts Hint */}
              <div className="border-t border-slate-200/50 pt-4 dark:border-slate-800 flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                <Keyboard className="h-4 w-4" />
                <span>Tip: Press keys <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">1</kbd> - <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">4</kbd> to select options, and <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">Enter</kbd> to submit.</span>
              </div>
            </div>

            {/* Play Button */}
            <button
              onClick={startQuiz}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 font-bold text-white shadow-lg shadow-indigo-100 hover:from-indigo-600 hover:to-violet-600 active:scale-99 transition-all cursor-pointer dark:shadow-none"
            >
              <Play className="h-5 w-5 fill-white" />
              <span>Start Quiz Campaign</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Game Play Board
  const currentQuestion = questions[currentIdx];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-12 animate-fade-in-up">
      {/* Quiz Progress & Timer Header */}
      <div className="flex items-center justify-between mb-4 text-sm font-semibold text-slate-400 dark:text-slate-500">
        <div>
          <span>Question </span>
          <span className="text-slate-700 dark:text-slate-200 font-bold">{currentIdx + 1}</span>
          <span> of {questions.length}</span>
        </div>

        {/* Floating Timer Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold font-mono transition-all duration-300 ${
            timeLeft <= 3
              ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 animate-pulse scale-105"
              : timeLeft <= 6
              ? "bg-amber-50 border-amber-200 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400"
              : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
          }`}
        >
          <Clock className={`h-3.5 w-3.5 ${timeLeft <= 3 ? "animate-spin" : ""}`} />
          <span>{timeLeft}s remaining</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all duration-500"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-lg border border-slate-200/80 dark:border-slate-800/80 animate-scale-up">
        {/* Points indicator */}
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-500/10 px-3 py-1 rounded-full">
            {quiz.category}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold font-mono">
            Value: {currentQuestion.points} points
          </span>
        </div>

        {/* Question text */}
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-tight mb-8">
          {currentQuestion.question}
        </h2>

        {/* Answer Options Grid */}
        <div className="space-y-4">
          {currentQuestion.shuffledOptions.map((option, idx) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`w-full flex items-center justify-between text-left p-4.5 rounded-2xl border font-semibold text-sm transition-all duration-200 ${
                  isSelected
                    ? "bg-violet-500/10 border-violet-500 text-violet-700 dark:bg-violet-950/10 dark:border-violet-400 dark:text-violet-300 ring-2 ring-violet-500/20"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
                } group cursor-pointer hover:scale-[1.01]`}
              >
                <div className="flex items-center gap-3">
                  {/* Shortcut key indicator */}
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-violet-600 text-white"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {/* Micro animation checkdot */}
                <div
                  className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? "border-violet-500 bg-violet-600 text-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <span className="block h-1.5 w-1.5 rounded-full bg-white"></span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation & Submit footer */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Progress locks upon submitting.
          </span>

          <button
            onClick={goToNextQuestion}
            disabled={!selectedOption}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-2xl px-6 py-3.5 font-bold text-sm text-white shadow shadow-indigo-150 transition-all ${
              selectedOption
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:shadow-indigo-300 active:scale-98"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
            }`}
          >
            <span>{currentIdx === questions.length - 1 ? "Submit Campaign" : "Next Question"}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
