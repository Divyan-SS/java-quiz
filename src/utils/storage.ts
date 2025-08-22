import { User, UserSession, QuizAttempt } from '../types/quiz';

// User Management
export const getUsersFromStorage = (): Record<string, User> => {
  const users = localStorage.getItem('quizUsers');
  return users ? JSON.parse(users) : {};
};

export const saveUserToStorage = (user: User) => {
  const users = getUsersFromStorage();
  users[user.id] = user;
  localStorage.setItem('quizUsers', JSON.stringify(users));
};

export const updateUserLastLogin = (userId: string) => {
  const users = getUsersFromStorage();
  if (users[userId]) {
    users[userId].lastLogin = Date.now();
    localStorage.setItem('quizUsers', JSON.stringify(users));
  }
};

// Session Management
export const getActiveSessionsFromStorage = (): Record<string, UserSession> => {
  const sessions = localStorage.getItem('activeSessions');
  return sessions ? JSON.parse(sessions) : {};
};

export const saveSessionToStorage = (session: UserSession) => {
  const sessions = getActiveSessionsFromStorage();
  sessions[session.userId] = session;
  localStorage.setItem('activeSessions', JSON.stringify(sessions));
};

export const removeSessionFromStorage = (userId: string) => {
  const sessions = getActiveSessionsFromStorage();
  delete sessions[userId];
  localStorage.setItem('activeSessions', JSON.stringify(sessions));
};

export const deactivateSession = (userId: string) => {
  const sessions = getActiveSessionsFromStorage();
  if (sessions[userId]) {
    sessions[userId].isActive = false;
    localStorage.setItem('activeSessions', JSON.stringify(sessions));
  }
  // Record a forced logout notice for UX
  try {
    const notice = { userId, at: Date.now() };
    localStorage.setItem('forcedLogoutNotice', JSON.stringify(notice));
  } catch (e) { /* ignore quota errors */ }

};

// Quiz Attempts Management
export const getQuizAttemptsFromStorage = (): Record<string, QuizAttempt> => {
  const attempts = localStorage.getItem('quizAttempts');
  return attempts ? JSON.parse(attempts) : {};
};

export const saveQuizAttemptToStorage = (attempt: QuizAttempt) => {
  const attempts = getQuizAttemptsFromStorage();
  attempts[attempt.id] = attempt;
  localStorage.setItem('quizAttempts', JSON.stringify(attempts));
};

export const getUserQuizAttempts = (userId: string): QuizAttempt[] => {
  const attempts = getQuizAttemptsFromStorage();
  return Object.values(attempts).filter(attempt => attempt.userId === userId);
};

// Authentication Helpers
export const authenticateUser = (emailOrUsername: string, password: string): User | null => {
  const users = getUsersFromStorage();
  const user = Object.values(users).find(u => 
    (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
  );
  return user || null;
};

export const isEmailTaken = (email: string): boolean => {
  const users = getUsersFromStorage();
  return Object.values(users).some(u => u.email === email);
};

export const isUsernameTaken = (username: string): boolean => {
  const users = getUsersFromStorage();
  return Object.values(users).some(u => u.username === username);
};

// Generate unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Initialize admin user if not exists
export const initializeAdminUser = () => {
  const users = getUsersFromStorage();
  const adminExists = Object.values(users).some(u => u.isAdmin);
  
  if (!adminExists) {
    const adminUser: User = {
      id: generateId(),
      email: 'admin@quiz.com',
      username: 'admin',
      password: 'admin123',
      isAdmin: true,
      registeredAt: Date.now()
    };
    saveUserToStorage(adminUser);
  }
};

// Export data as CSV
export const exportUsersToCSV = (): string => {
  const users = getUsersFromStorage();
  const attempts = getQuizAttemptsFromStorage();
  
  let csv = 'Email,Username,Registration Date,Last Login,Quiz Attempts,Best Score,Average Score\n';
  
  Object.values(users).forEach(user => {
    if (!user.isAdmin) {
      const userAttempts = Object.values(attempts).filter(a => a.userId === user.id && a.isCompleted);
      const scores = userAttempts.map(a => a.score || 0);
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
      const regDate = new Date(user.registeredAt).toLocaleDateString();
      
      csv += `${user.email},${user.username},${regDate},${lastLogin},${userAttempts.length},${bestScore}%,${avgScore}%\n`;
    }
  });
  
  return csv;
};