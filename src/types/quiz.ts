export interface User {
  email: string;
  username: string;
  password: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizAnswer {
  questionId: number;
  selectedOption: number | null;
  isCorrect?: boolean;
}

export interface QuizResults {
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
}