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
  const getQuestionStatus = (questionNumber: number) => {
    const answer = answers.find(a => a.questionId === questionNumber);
    if (answer && answer.selectedOption !== null) return 'answered';
    if (questionNumber === currentQuestion) return 'current';
    return 'unanswered';
  };

  // Colors and icons for better UX
  const getButtonStyle = (status: string) => {
    switch (status) {
      case 'answered':
        return 'bg-green-100 border-green-400 text-green-800 font-bold ring-2 ring-green-400 shadow';
      case 'current':
        return 'bg-blue-100 border-blue-400 text-blue-800 font-bold ring-2 ring-blue-400 shadow';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-700 hover:border-blue-300';
    }
  };

  // Optional: Add icons for legend
  const legendData = [
    { color: 'bg-green-400 border-green-400', label: 'Answered' },
    { color: 'bg-blue-400 border-blue-400', label: 'Current' },
    { color: 'bg-gray-200 border-gray-300', label: 'Not answered' },
  ];

  return (
    <aside className="rounded-2xl bg-white shadow-xl p-6 max-w-xs mx-auto w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Questions</h2>
      <div className="grid grid-cols-5 gap-3 mb-8">
        {Array.from({ length: totalQuestions }, (_, idx) => {
          const num = idx + 1;
          const status = getQuestionStatus(num);
          return (
            <button
              type="button"
              aria-current={status === 'current'}
              key={num}
              onClick={() => onQuestionSelect(num)}
              title={`Go to question ${num} (${status})`}
              className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ease-in text-base focus:outline-none focus:ring-2 focus:ring-blue-300 ${getButtonStyle(
                status
              )}`}
            >
              {num}
            </button>
          );
        })}
      </div>
      {/* LEGEND */}
      <div className="space-y-2">
        {legendData.map(({ color, label }) => (
          <div className="flex items-center" key={label}>
            <span
              className={`w-4 h-4 rounded-full border-2 ${color} mr-2 inline-block`}
              aria-hidden="true"
            />
            <span className="text-gray-600 text-sm">{label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
};
