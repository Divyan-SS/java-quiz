import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { User, QuizAnswer } from './types/quiz';

type AppState = 'login' | 'quiz' | 'results';

const getUsersFromStorage = (): Record<string, User> => {
  const users = localStorage.getItem('quizUsers');
  return users ? JSON.parse(users) : {};
};

function App() {
  const [currentState, setCurrentState] = useState<AppState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [quizResults, setQuizResults] = useState<QuizAnswer[]>([]);

  useEffect(() => {
    const users = getUsersFromStorage();
    const firstUserEmail = Object.keys(users)[0];
    if (firstUserEmail) {
      setUser(users[firstUserEmail]);
      setCurrentState('quiz');
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentState('quiz');
  };

  const handleQuizComplete = (answers: QuizAnswer[]) => {
    setQuizResults(answers);
    setCurrentState('results');
  };

  const handleRestart = () => {
    setQuizResults([]);
    setCurrentState('quiz');
  };

  const handleLogout = () => {
    setUser(null);
    setQuizResults([]);
    setCurrentState('login');
  };

  switch (currentState) {
    case 'login':
      return <Login onLogin={handleLogin} />;

    case 'quiz':
      return user ? (
        <Quiz
          user={user}
          onQuizComplete={handleQuizComplete}
          onLogout={handleLogout} // ✅ pass onLogout here
        />
      ) : (
        <Login onLogin={handleLogin} />
      );

    case 'results':
      return user ? (
        <Results
          user={user}
          answers={quizResults}
          onRestart={handleRestart}
          onLogout={handleLogout} // ✅ pass onLogout here
        />
      ) : (
        <Login onLogin={handleLogin} />
      );

    default:
      return <Login onLogin={handleLogin} />;
  }
}

export default App;
