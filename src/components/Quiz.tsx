import React, { useState, useEffect } from 'react';
import { QuizAnswer, User, QuizAttempt } from '../types/quiz';
import { excelQuestions } from '../data/questions'; // Updated to Excel questions
import { QuestionSidebar } from './QuestionSidebar';
import { ChevronLeft, ChevronRight, Check, LogOut, Clock, AlertTriangle } from 'lucide-react';
import { 
  saveQuizAttemptToStorage, 
  generateId, 
  saveSessionToStorage,
  removeSessionFromStorage,
  deactivateSession
} from '../utils/storage';

interface QuizProps {
  user: User;
  onQuizComplete: (answers: QuizAnswer[], timeTaken: number) => void;
  onLogout: () => void;
}

export const Quiz: React.FC<QuizProps> = ({ user, onQuizComplete, onLogout }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  const currentQuestion = excelQuestions[currentQuestionIndex]; // Updated
  const totalQuestions = excelQuestions.length; // Updated
  const currentQuestionNumber = currentQuestionIndex + 1;
  const QUIZ_TIME_LIMIT = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    // Initialize quiz attempt and user session
    const attemptId = generateId();
    const newAttempt: QuizAttempt = {
      id: attemptId,
      userId: user.id,
      startTime: Date.now(),
      answers: [],
      totalQuestions,
      isCompleted: false,
      timeLimit: QUIZ_TIME_LIMIT
    };

    setQuizAttempt(newAttempt);
    setTimeRemaining(QUIZ_TIME_LIMIT);
    saveQuizAttemptToStorage(newAttempt);

    // Update user session
    saveSessionToStorage({
      userId: user.id,
      loginTime: Date.now(),
      isActive: true,
      currentQuizId: attemptId
    });

    return () => {
      if (newAttempt && !newAttempt.isCompleted) {
        // Update attempt as abandoned
        const updatedAttempt = { ...newAttempt, endTime: Date.now() };
        saveQuizAttemptToStorage(updatedAttempt);
      }
    };
  }, [user.id, totalQuestions]);

  useEffect(() => {
    if (timeRemaining === null) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null;
        const newTime = prev - 1000;
        
        if (newTime <= 5 * 60 * 1000 && !showTimeWarning) { // 5 minutes warning
          setShowTimeWarning(true);
        }
        
        if (newTime <= 0) {
          handleTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showTimeWarning]);

  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    setSelectedOption(existingAnswer?.selectedOption ?? null);
  }, [currentQuestionIndex, answers, currentQuestion.id]);

  const handleTimeUp = () => {
    if (selectedOption !== null) {
      saveAnswer(currentQuestion.id, selectedOption);
    }
    submitQuiz();
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const saveAnswer = (questionId: number, selectedOption: number) => {
    const newAnswer = { 
      questionId, 
      selectedOption, 
      answeredAt: Date.now() 
    };
    
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, newAnswer];
    });
  };

  const submitQuiz = () => {
    if (!quizAttempt) return;

    const finalAnswers = [...answers];
    if (selectedOption !== null) {
      const currentAnswer = { 
        questionId: currentQuestion.id, 
        selectedOption, 
        answeredAt: Date.now() 
      };
      const filtered = finalAnswers.filter(a => a.questionId !== currentQuestion.id);
      finalAnswers.push(...filtered, currentAnswer);
    }

    const answersWithCorrection = finalAnswers.map(answer => ({
      ...answer,
      isCorrect: excelQuestions.find(q => q.id === answer.questionId)?.correctAnswer === answer.selectedOption // Updated
    }));

    const score = Math.round((answersWithCorrection.filter(a => a.isCorrect).length / totalQuestions) * 100);
    const timeTaken = Date.now() - quizAttempt.startTime;

    const completedAttempt: QuizAttempt = {
      ...quizAttempt,
      answers: answersWithCorrection,
      score,
      endTime: Date.now(),
      isCompleted: true
    };

    saveQuizAttemptToStorage(completedAttempt);
    
    // Clean up user session
    deactivateSession(user.id);

    onQuizComplete(answersWithCorrection, timeTaken);
  };

  const handleConfirmAndNext = () => {
    if (selectedOption !== null) {
      saveAnswer(currentQuestion.id, selectedOption);
      goToNextQuestion();
    }
  };

  const handleNextSkip = () => {
    goToNextQuestion();
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionSelect = (questionNumber: number) => {
    setCurrentQuestionIndex(questionNumber - 1);
  };

  const handleFinalSubmit = () => {
    submitQuiz();
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout? Your progress will be lost.')) {
      if (quizAttempt) {
        const abandonedAttempt = { ...quizAttempt, endTime: Date.now() };
        saveQuizAttemptToStorage(abandonedAttempt);
      }
      removeSessionFromStorage(user.id);
      onLogout();
    }
  };

  const allQuestionsAnswered = answers.length === totalQuestions &&
    answers.every(answer => answer.selectedOption !== null);

  const canSubmitFinal = allQuestionsAnswered ||
    (answers.length === totalQuestions - 1 && selectedOption !== null);

  if (!quizAttempt) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 md:p-4">
  <div className="max-w-7xl mx-auto">
    {/* Quiz Header */}
    <div className="bg-white rounded-2xl shadow-xl px-4 py-4 md:px-6 md:py-6 mb-2 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
      
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <img
            src="/logo.png"
            alt="Quiz Logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div>
          <h1 className="text-lg md:text-2xl font-bold text-gray-800">Excel & Power BI Quiz</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Welcome, <span className="font-medium">{user.username}</span>
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            Question {currentQuestionNumber} of {totalQuestions}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Timer */}
        {timeRemaining !== null && (
          <div className={`flex items-center px-3 py-2 rounded-lg ${
            showTimeWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-mono text-sm font-medium">
              {formatTime(timeRemaining)}
            </span>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="flex items-center px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm md:text-base"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
        {/* Time Warning */}
        {showTimeWarning && timeRemaining && timeRemaining > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Time Warning</h4>
                <p className="text-sm text-yellow-700">
                  Less than 5 minutes remaining! Complete your quiz soon.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-2 md:mt-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((answers.length) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-6 mt-4 md:mt-6">
          {/* Sidebar */}
          <div className="md:col-span-2 lg:col-span-1 flex justify-center">
            <QuestionSidebar
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestionNumber}
              answers={answers}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>

          {/* Main Question Area */}
          <div className="md:col-span-3 lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-xl p-3 md:p-8 w-full">
              {/* Question Number Badge */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-blue-800 text-xs md:text-sm font-medium px-3 py-1 rounded-full">
                    Question {currentQuestionNumber}
                  </span>
                </div>
                <h2 className="text-md md:text-xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 md:space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={
                      `flex items-center p-3 md:p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                      hover:bg-blue-50 text-xs md:text-base
                      ${selectedOption === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'}`
                    }
                  >
                    <input
                      type="radio"
                      name="option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 mr-3 md:mr-4 flex items-center justify-center ${
                      selectedOption === index ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedOption === index && (
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">
                      {String.fromCharCode(97 + index)}) {option}
                    </span>
                  </label>
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-5 md:px-6 py-2 md:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base mb-2 md:mb-0"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <div className="flex flex-row gap-2">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      <button
                        onClick={handleNextSkip}
                        className="flex items-center px-5 md:px-6 py-2 md:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base"
                      >
                        Next/Skip
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </button>
                      <button
                        onClick={handleConfirmAndNext}
                        disabled={selectedOption === null}
                        className="flex items-center px-5 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Confirm & Next
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleFinalSubmit}
                      disabled={!canSubmitFinal}
                      className="flex items-center px-7 md:px-8 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm md:text-base"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Complete Quiz
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
