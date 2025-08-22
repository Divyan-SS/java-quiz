import React from 'react';
import { QuizAnswer, User } from '../types/quiz';
import { javaQuestions } from '../data/questions';
import { Trophy, RotateCcw, LogOut, CheckCircle, XCircle } from 'lucide-react';

interface ResultsProps {
  user: User;
  answers: QuizAnswer[];
  onRestart: () => void;
  onLogout: () => void;
}

export const Results: React.FC<ResultsProps> = ({ user, answers, onRestart, onLogout }) => {
  const totalQuestions = javaQuestions.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return 'Excellent work!';
    if (score >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h1>
          <p className="text-gray-600">Well done, {user.username}!</p>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
              {score}%
            </div>
            <p className="text-xl text-gray-700 mb-4">{getScoreMessage(score)}</p>
            <div className="flex justify-center items-center space-x-8 text-lg">
              <div className="flex items-center text-green-600">
                <CheckCircle className="w-6 h-6 mr-2" />
                <span>{correctAnswers} Correct</span>
              </div>
              <div className="flex items-center text-red-600">
                <XCircle className="w-6 h-6 mr-2" />
                <span>{totalQuestions - correctAnswers} Incorrect</span>
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
                <div key={question.id} className="border-l-4 border-gray-200 pl-6">
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
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(97 + optionIndex)})
                                </span>
                                <span>{option}</span>
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                                )}
                                {isUserSelection && !isCorrect && (
                                  <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                                )}
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
              Restart Quiz
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