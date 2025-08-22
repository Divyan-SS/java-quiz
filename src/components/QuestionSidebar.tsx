import React from 'react';
import { QuizAnswer } from '../types/quiz';

interface QuestionSidebarProps {
  totalQuestions: number;
  currentQuestion: number;
  answers: QuizAnswer[];
  onQuestionSelect: (questionNumber: number) => void;
}

export const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  totalQuestions,
  currentQuestion,
  answers,
  onQuestionSelect,
}) => {
  // Get status for each question
  const getQuestionStatus = (questionNumber: number) => {
    const answer = answers.find(a => a.questionId === questionNumber);
    if (answer && answer.selectedOption !== null) return 'answered';
    if (questionNumber === currentQuestion) return 'current';
    return 'unanswered';
  };

  // Styles for each status
  const getCircleStyle = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 border-green-500 text-white font-bold shadow-md';
      case 'current':
        return 'border-4 border-blue-500 text-blue-700 font-bold bg-white shadow-lg ring-2 ring-blue-200';
      default:
        return 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center min-w-[260px]">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Question Navigation</h2>
      
      {/* Progress indicator */}
      <div className="w-full mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{answers.length}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(answers.length / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question buttons in responsive grid */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-5 gap-3 place-items-center w-full">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const num = i + 1;
            const status = getQuestionStatus(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => onQuestionSelect(num)}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-400 text-base transform hover:scale-105 ${getCircleStyle(status)}`}
                aria-label={`Go to question ${num}`}
                title={`Question ${num} - ${status}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col space-y-2 mt-6 items-start w-full pl-2">
        <h3 className="text-sm font-medium text-gray-700 mb-1">Legend</h3>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-green-500 mr-3"></span>
          <span className="text-sm text-gray-700">Answered</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full border-4 border-blue-500 bg-white mr-3"></span>
          <span className="text-sm text-gray-700">Current Question</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 bg-white mr-3"></span>
          <span className="text-sm text-gray-700">Not Answered</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="w-full mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Completed:</span>
            <span className="font-medium">{answers.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Remaining:</span>
            <span className="font-medium">{totalQuestions - answers.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};