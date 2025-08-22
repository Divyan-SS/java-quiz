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
        return 'bg-green-400 border-green-400 text-white font-bold';
      case 'current':
        return 'border-4 border-blue-400 text-blue-700 font-bold bg-white';
      default:
        return 'border-2 border-gray-300 bg-white text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-4 flex flex-col items-center min-w-[260px]">
      <h2 className="text-lg font-semibold mb-4">Questions</h2>
      {/* BUTTONS IN RESPONSIVE GRID */}
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-5 gap-4 place-items-center w-full">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const num = i + 1;
            const status = getQuestionStatus(num);
            return (
              <button
                key={num}
                type="button"
                onClick={() => onQuestionSelect(num)}
                className={`w-11 h-11 flex items-center justify-center rounded-full transition-all outline-none focus:ring-2 focus:ring-blue-400 text-base ${getCircleStyle(status)}`}
                aria-label={`Question ${num}`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col space-y-1 mt-4 items-start w-full pl-2">
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full bg-green-400 mr-2"></span>
          <span className="text-sm text-gray-700">Answered</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full border-4 border-blue-400 bg-white mr-2"></span>
          <span className="text-sm text-gray-700">Current</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-300 bg-white mr-2"></span>
          <span className="text-sm text-gray-700">Not answered</span>
        </div>
      </div>
    </div>
  );
};
