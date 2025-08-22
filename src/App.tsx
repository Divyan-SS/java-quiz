import React, { useState, useEffect } from 'react';
import { AuthForm } from './components/AuthForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { Quiz } from './components/Quiz';
import { Results } from './components/Results';
import { User, QuizAnswer } from './types/quiz';
import { Shield } from 'lucide-react';
import { 
  saveSessionToStorage, 
  removeSessionFromStorage,
  getActiveSessionsFromStorage,
  initializeAdminUser 
} from './utils/storage';

type AppState = 'auth' | 'admin-login' | 'admin-panel' | 'quiz' | 'results';

function App() {
  const [currentState, setCurrentState] = useState<AppState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [quizResults, setQuizResults] = useState<QuizAnswer[]>([]);
  const [timeTaken, setTimeTaken] = useState<number>(0);

  useEffect(() => {
    // Initialize admin user on app start
    initializeAdminUser();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    // Create user session
    saveSessionToStorage({
      userId: userData.id,
      loginTime: Date.now(),
      isActive: true
    });

    if (userData.isAdmin) {
      setCurrentState('admin-panel');
    } else {
      setCurrentState('quiz');
    }
  };

  const handleAdminLogin = (userData: User) => {
    setUser(userData);
    // Create admin session
    saveSessionToStorage({
      userId: userData.id,
      loginTime: Date.now(),
      isActive: true
    });
    setCurrentState('admin-panel');
  };

  const handleQuizComplete = (answers: QuizAnswer[], timeTakenMs: number) => {
    setQuizResults(answers);
    setTimeTaken(timeTakenMs);
    setCurrentState('results');
  };

  const handleRestart = () => {
    setQuizResults([]);
    setTimeTaken(0);
    setCurrentState('quiz');
  };

  const handleLogout = () => {
    if (user) {
      removeSessionFromStorage(user.id);
    }
    setUser(null);
    setQuizResults([]);
    setTimeTaken(0);
    setCurrentState('auth');
  };

  // Forced logout watcher: if admin deactivates the session, auto-logout the user
  useEffect(() => {
    if (!user) return;
    const checkSession = () => {
      // Skip forced logout check when showing results screen
      if (currentState === 'results') return;
      try {
        const sessions = getActiveSessionsFromStorage();
        const s = sessions[user.id];
        if (!s || !s.isActive) {
          // Mark notice so login page can inform the user
          try { 
            localStorage.setItem(
              'forcedLogoutNotice', 
              JSON.stringify({ userId: user.id, at: Date.now() })
            ); 
          } catch {}
          handleLogout();
        }
      } catch {}
    };
    // Run immediately and then poll
    checkSession();
    const iv = setInterval(checkSession, 2000);
    // Also listen to storage events for snappier UX
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'activeSessions') checkSession();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(iv);
      window.removeEventListener('storage', onStorage);
    };
  }, [user, currentState]);

  const handleShowAdminLogin = () => {
    setCurrentState('admin-login');
  };

  const handleBackToUserAuth = () => {
    setCurrentState('auth');
  };

  return (
    <div className="min-h-screen">
      {/* Admin Access Button - Only show on main auth screen */}
      {currentState === 'auth' && (
        <div className="fixed top-4 right-4 z-10">
          <button
            onClick={handleShowAdminLogin}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
            title="Admin Access"
          >
            <Shield className="w-4 h-4 mr-2" />
            Admin
          </button>
        </div>
      )}

      {/* Main Content */}
      {currentState === 'auth' && (
        <AuthForm onLogin={handleLogin} />
      )}

      {currentState === 'admin-login' && (
        <AdminLogin 
          onAdminLogin={handleAdminLogin}
          onBackToUser={handleBackToUserAuth}
        />
      )}

      {currentState === 'admin-panel' && user && (
        <AdminPanel 
          admin={user} 
          onLogout={handleLogout} 
        />
      )}

      {currentState === 'quiz' && user && (
        <Quiz
          user={user}
          onQuizComplete={handleQuizComplete}
          onLogout={handleLogout}
        />
      )}

      {currentState === 'results' && user && (
        <Results
          user={user}
          answers={quizResults}
          timeTaken={timeTaken}
          onRestart={handleRestart}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
