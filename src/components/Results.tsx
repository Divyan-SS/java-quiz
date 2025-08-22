import React, { useEffect } from 'react';
import { QuizAnswer, User, QuizAttempt } from '../types/quiz';
import { javaQuestions } from '../data/questions';
import { 
  Trophy, 
  RotateCcw, 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target 
} from 'lucide-react';
import { saveQuizAttemptToStorage } from '../utils/storage';

interface ResultsProps {
  user: User;
  answers: QuizAnswer[];
  timeTaken: number;
  onRestart: () => void;
  onLogout: () => void;
}

export const Results: React.FC<ResultsProps> = ({ user, answers, timeTaken, onRestart, onLogout }) => {
  const totalQuestions = javaQuestions.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const rawScore = (correctAnswers / totalQuestions) * 100;
  const score = Math.min(100, Math.round(rawScore)); // Ensure score never exceeds 100%

  // Persist results immediately so Admin Panel updates in real-time
  useEffect(() => {
    const attempt: QuizAttempt = {
      id: `${user.id}-${Date.now()}`,
      userId: user.id,
      startTime: Date.now() - timeTaken,
      endTime: Date.now(),
      answers,
      score,
      totalQuestions: javaQuestions.length,
      isCompleted: true
    };
    saveQuizAttemptToStorage(attempt);
  }, [user, answers, score, timeTaken]);

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Outstanding! Excellent Java knowledge!';
    if (score >= 80) return 'Great job! Strong Java understanding!';
    if (score >= 70) return 'Good work! Solid Java foundation!';
    if (score >= 60) return 'Nice effort! Keep practicing!';
    return 'Keep studying! You\'ll improve!';
  };

  const getGradeLevel = (score: number) => {
    if (score >= 90) return { grade: 'A+', color: 'bg-green-500' };
    if (score >= 80) return { grade: 'A', color: 'bg-green-400' };
    if (score >= 70) return { grade: 'B', color: 'bg-blue-400' };
    if (score >= 60) return { grade: 'C', color: 'bg-yellow-400' };
    return { grade: 'D', color: 'bg-red-400' };
  };

  const gradeInfo = getGradeLevel(score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600">
            Well done, <span className="font-semibold">{user.username}</span>!
          </p>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center mb-4">
              <div className={`${gradeInfo.color} text-white text-4xl font-bold px-6 py-3 rounded-lg mr-4`}>
                {gradeInfo.grade}
              </div>
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
            </div>
            <p className="text-xl text-gray-700 mb-4">{getScoreMessage(score)}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                  <span className="text-lg font-bold text-green-600">{correctAnswers}</span>
                </div>
                <p className="text-sm text-green-700 font-medium">Correct</p>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <XCircle className="w-6 h-6 text-red-600 mr-2" />
                  <span className="text-lg font-bold text-red-600">{incorrectAnswers}</span>
                </div>
                <p className="text-sm text-red-700 font-medium">Incorrect</p>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-blue-600 mr-2" />
                  <span className="text-lg font-bold text-blue-600">{formatTime(timeTaken)}</span>
                </div>
                <p className="text-sm text-blue-700 font-medium">Time Taken</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Target className="w-6 h-6 text-purple-600 mr-2" />
                  <span className="text-lg font-bold text-purple-600">{totalQuestions}</span>
                </div>
                <p className="text-sm text-purple-700 font-medium">Total Questions</p>
              </div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Accuracy Rate</span>
                <span className="text-sm font-medium text-gray-900">{score}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Results</h2>
          <div className="space-y-6">
            {javaQuestions.map((question, index) => {
              const userAnswer = answers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              const userSelectedOption = userAnswer?.selectedOption;
              const correctOption = question.correctAnswer;

              return (
                <div key={question.id} className={`border-l-4 pl-6 ${isCorrect ? 'border-green-400' : 'border-red-400'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded-full mr-3">
                          Q{index + 1}
                        </span>
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600" />
                        )}
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        {question.question}
                      </h3>
                      
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isUserSelection = userSelectedOption === optionIndex;
                          const isCorrectAnswer = correctOption === optionIndex;
                          
                          let optionClass = 'p-3 rounded-lg border ';
                          if (isCorrectAnswer) {
                            optionClass += 'bg-green-50 border-green-300 text-green-800';
                          } else if (isUserSelection && !isCorrect) {
                            optionClass += 'bg-red-50 border-red-300 text-red-800';
                          } else {
                            optionClass += 'bg-gray-50 border-gray-200 text-gray-700';
                          }

                          return (
                            <div key={optionIndex} className={optionClass}>
                              <div className="flex items-center">
                                <span className="font-medium mr-2">{String.fromCharCode(97 + optionIndex)})</span>
                                <span className="flex-1">{option}</span>
                                <div className="flex items-center space-x-2">
                                  {isCorrectAnswer && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                      Correct
                                    </span>
                                  )}
                                  {isUserSelection && (
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                      Your Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center space-x-4">
            <button
              onClick={onRestart}
              className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Take Quiz Again
            </button>
            <button
              onClick={onLogout}
              className="flex items-center px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
