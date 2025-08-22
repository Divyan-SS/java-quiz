import React, { useState, useEffect } from 'react';
import {  QuizAnswer, User } from '../types/quiz';
import { javaQuestions } from '../data/questions';
import { QuestionSidebar } from './QuestionSidebar';
import { ChevronLeft, ChevronRight, Check, LogOut } from 'lucide-react';

interface QuizProps {
  user: User;
  onQuizComplete: (answers: QuizAnswer[]) => void;
  onLogout: () => void; // Logout prop added
}

export const Quiz: React.FC<QuizProps> = ({ user, onQuizComplete, onLogout }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const currentQuestion = javaQuestions[currentQuestionIndex];
  const totalQuestions = javaQuestions.length;
  const currentQuestionNumber = currentQuestionIndex + 1;

  useEffect(() => {
    const existingAnswer = answers.find(a => a.questionId === currentQuestion.id);
    setSelectedOption(existingAnswer?.selectedOption || null);
  }, [currentQuestionIndex, answers, currentQuestion.id]);

  const saveAnswer = (questionId: number, selectedOption: number) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { questionId, selectedOption }];
    });
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
    if (selectedOption !== null) {
      saveAnswer(currentQuestion.id, selectedOption);
    }

    const finalAnswers = answers.map(answer => ({
      ...answer,
      isCorrect: javaQuestions.find(q => q.id === answer.questionId)?.correctAnswer === answer.selectedOption
    }));

    onQuizComplete(finalAnswers);
  };

  const allQuestionsAnswered = answers.length === totalQuestions &&
    answers.every(answer => answer.selectedOption !== null);

  const canSubmitFinal = allQuestionsAnswered ||
    (answers.length === totalQuestions - 1 && selectedOption !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Java Knowledge Quiz</h1>
            <p className="text-gray-600">Welcome, <span className="font-medium">{user.username}</span></p>
            <p className="text-sm text-gray-500">Question {currentQuestionNumber} of {totalQuestions}</p>
          </div>
          <button
            onClick={onLogout} // ✅ Logout button integrated
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>

        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((answers.length) / totalQuestions) * 100}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-1">
            <QuestionSidebar
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestionNumber}
              answers={answers}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                    Question {currentQuestionNumber}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                      selectedOption === index ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedOption === index && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <span className="text-gray-700 font-medium">
                      {String.fromCharCode(97 + index)}) {option}
                    </span>
                  </label>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={goToPreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </button>

                <div className="flex space-x-4">
                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <>
                      <button
                        onClick={handleNextSkip}
                        className="flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Next/Skip
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </button>
                      <button
                        onClick={handleConfirmAndNext}
                        disabled={selectedOption === null}
                        className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Confirm & Next
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleFinalSubmit}
                      disabled={!canSubmitFinal}
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Final Complete
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
