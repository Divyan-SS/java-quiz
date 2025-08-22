export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  isAdmin?: boolean;
  registeredAt: number;
  lastLogin?: number;
}

export interface UserSession {
  userId: string;
  loginTime: number;
  isActive: boolean;
  currentQuizId?: string;
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
  answeredAt?: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  startTime: number;
  endTime?: number;
  answers: QuizAnswer[];
  score?: number;
  totalQuestions: number;
  isCompleted: boolean;
  timeLimit?: number;
  timeTaken?: number; // <-- Add this line
}


export interface QuizResults {
  score: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  timeTaken: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  completedQuizzes: number;
  averageScore: number;
}
