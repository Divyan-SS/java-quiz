import React, { useEffect, useMemo, useState } from 'react';
import { User, UserSession, QuizAttempt, AdminStats } from '../types/quiz';
import {
  Shield,
  Users,
  Trophy,
  BarChart,
  Download,
  Search,
  LogOut,
  UserX,
  RefreshCw,
  Filter,
  Eye,
  Trash2,
  Activity,
  X
} from 'lucide-react';
import {
  getUsersFromStorage,
  getActiveSessionsFromStorage,
  getQuizAttemptsFromStorage,
  removeSessionFromStorage,
  deactivateSession,
} from '../utils/storage';

interface AdminPanelProps {
  admin: User;
  onLogout: () => void;
}

type TabId = 'dashboard' | 'users' | 'leaderboard';

export const AdminPanel: React.FC<AdminPanelProps> = ({ admin, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [users, setUsers] = useState<Record<string, User>>({});
  const [activeSessions, setActiveSessions] = useState<Record<string, UserSession>>({});
  const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'completed' | 'in-progress'>('all');

  const [resultsUserId, setResultsUserId] = useState<string | null>(null);

  const loadData = () => {
    try {
      setUsers(getUsersFromStorage());
    } catch {}
    try {
      setActiveSessions(getActiveSessionsFromStorage());
    } catch {}
    try {
      const raw = getQuizAttemptsFromStorage();
      const seen = new Set<string>();
      const unique: Record<string, QuizAttempt> = {};
      for (const a of Object.values(raw)) {
        const key = `${a.userId}-${a.endTime}-${a.score}`;
        if (seen.has(key)) continue;
        seen.add(key);
        unique[a.id] = a;
      }
      localStorage.setItem('quizAttempts', JSON.stringify(unique));
      setQuizAttempts(unique);
    } catch {}
  };

  useEffect(() => {
    loadData();
    const iv = setInterval(loadData, 2000);
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (['users', 'activeSessions', 'quizAttempts'].includes(e.key)) loadData();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(iv);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const allUsers = useMemo(() => Object.values(users).filter(u => !u.isAdmin), [users]);

  const getUserAttempts = (uid: string) =>
    Object.values(quizAttempts).filter(a => a.userId === uid);

  const summarizeUser = (u: User) => {
    const session = activeSessions[u.id];
    const attempts = getUserAttempts(u.id);
    const completed = attempts.filter(a => a.isCompleted);
    const scores = completed.map(a => a.score || 0);
    const bestScore = scores.length ? Math.max(...scores) : 0;
    const averageScore = scores.length
      ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
      : 0;

    return {
      ...u,
      isActive: !!session?.isActive,
      totalAttempts: attempts.length,
      completedAttempts: completed.length,
      bestScore,
      averageScore,
      hasInProgressQuiz: attempts.some(a => !a.isCompleted),
      lastSeen: session?.loginTime ? new Date(session.loginTime).toLocaleString() : 'Never',
    };
  };

  const usersWithStats = useMemo(
    () => allUsers.map(summarizeUser),
    [users, activeSessions, quizAttempts]
  );

  const filteredUsers = useMemo(() => {
    let list = usersWithStats;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter(u => u.username.toLowerCase().includes(t) || u.email.toLowerCase().includes(t));
    }
    if (filterType !== 'all') {
      if (filterType === 'active') list = list.filter(u => u.isActive);
      if (filterType === 'completed') list = list.filter(u => u.completedAttempts > 0);
      if (filterType === 'in-progress') list = list.filter(u => u.hasInProgressQuiz);
    }
    return list;
  }, [usersWithStats, searchTerm, filterType]);

  const getStats = (): AdminStats => {
    const completed = Object.values(quizAttempts).filter(a => a.isCompleted);
    const activeUserCount = Object.values(activeSessions).filter(s => s.isActive).length;
    const scores = completed.map(a => a.score || 0);
    const averageScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return {
      totalUsers: allUsers.length,
      activeUsers: activeUserCount,
      completedQuizzes: completed.length,
      averageScore,
    };
  };

  const stats = getStats();

  const leaderboard = useMemo(() => {
    return usersWithStats
      .filter(u => u.bestScore > 0)
      .sort((a, b) => b.bestScore - a.bestScore)
      .slice(0, 10);
  }, [usersWithStats]);

  const recentCompletions = useMemo(() => {
    const completed = Object.values(quizAttempts)
      .filter(a => a.isCompleted)
      .sort((a, b) => (b.endTime || 0) - (a.endTime || 0));
    return completed.slice(0, 10);
  }, [quizAttempts]);

  const handleForceLogout = (userId: string) => {
    if (!confirm('Force logout this user?')) return;
    try {
      deactivateSession(userId);
      removeSessionFromStorage(userId);
    } catch {}
    loadData();
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Delete this user AND all related attempts/sessions? This cannot be undone.')) return;
    try {
      const all = { ...users };
      delete all[userId];
      localStorage.setItem('users', JSON.stringify(all));
      const attempts = { ...quizAttempts };
      for (const [aid, a] of Object.entries(attempts)) {
        if (a.userId === userId) delete attempts[aid];
      }
      localStorage.setItem('quizAttempts', JSON.stringify(attempts));
      const sessions = { ...activeSessions };
      delete sessions[userId];
      localStorage.setItem('activeSessions', JSON.stringify(sessions));
    } catch {}
    loadData();
  };

  const humanDuration = (ms?: number) => {
    if (!ms || ms < 0) return '-';
    const s = Math.round(ms / 1000);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${ss.toString().padStart(2, '0')} min`;
  };

  const handleExportCSV = () => {
    const safe = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const userRows = usersWithStats.map(u =>
      [u.id,u.username,u.email,u.totalAttempts,u.completedAttempts,`${u.bestScore}`,`${u.averageScore}`,u.isActive?'Active':'Offline',u.lastSeen].map(safe).join(',')
    );
    const attemptsRows = Object.values(quizAttempts)
      .sort((a,b)=> (a.userId>b.userId?1:a.userId<b.userId?-1:(a.endTime||0)-(b.endTime||0)))
      .map(a=>{
        const u = users[a.userId];
        const start = a.startTime?new Date(a.startTime).toLocaleString():'';
        const end = a.endTime?new Date(a.endTime).toLocaleString():'';
        const dur = a.endTime&&a.startTime?a.endTime-a.startTime:undefined;
        return [a.id,a.userId,u?.username??'',u?.email??'',a.isCompleted?'Yes':'No',a.score??0,start,end,humanDuration(dur)].map(safe).join(',');
      });
    const csv=[
      'Users Summary',
      'UserID,Username,Email,TotalAttempts,CompletedAttempts,BestScore(%),AverageScore(%),Status,LastSeen',
      ...userRows,'',
      'Attempts Details',
      'AttemptID,UserID,Username,Email,Completed,Score(%),StartTime,EndTime,Duration',
      ...attemptsRows,
    ].join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const link=document.createElement('a');
    const url=URL.createObjectURL(blob);
    link.href=url;
    link.download=`quiz-report-${new Date().toISOString().slice(0,10)}.csv`;
    link.style.display='none';
    document.body.appendChild(link);
    link.click();
    requestAnimationFrame(()=>{document.body.removeChild(link);URL.revokeObjectURL(url);});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
          <div className="w-11 h-11 mr-3 rounded-full overflow-hidden">
            <img
              src="/logo.png"
              alt="Excel & Power BI Quiz Logo"
              className="w-full h-full object-contain"
            />
          </div>          
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome, {admin.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-2 sm:space-x-6">
            {([
              { id: 'dashboard', name: 'Dashboard', icon: BarChart },
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Completions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Quiz Completions</h3>
              </div>
              <div className="px-6 py-4">
                {recentCompletions.length === 0 ? (
                  <p className="text-sm text-gray-500">No quiz completions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentCompletions.map(attempt => {
                      const u = users[attempt.userId];
                      return (
                        <div
                          key={attempt.id}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {u?.username ?? 'Unknown User'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attempt.endTime
                                  ? new Date(attempt.endTime).toLocaleString()
                                  : ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                (attempt.score || 0) >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : (attempt.score || 0) >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {attempt.score ?? 0}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={filterType}
                      onChange={(e) =>
                        setFilterType(e.target.value as 'all' | 'active' | 'completed' | 'in-progress')
                      }
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Now</option>
                      <option value="completed">Has Completed Quiz</option>
                      <option value="in-progress">Quiz in Progress</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  User Management ({filteredUsers.length} users)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quiz Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Seen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{u.username}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                u.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {u.isActive ? 'Active' : 'Offline'}
                            </span>
                            {u.hasInProgressQuiz && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                Quiz in Progress
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>Completed: {u.completedAttempts}</div>
                            <div>Best: {u.bestScore}% &nbsp;|&nbsp; Avg: {u.averageScore}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {u.lastSeen}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setResultsUserId(u.id)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Results"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {u.isActive && (
                              <button
                                onClick={() => handleForceLogout(u.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Force Logout"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Top Performers</h3>
                <p className="text-sm text-gray-500">Ranked by best quiz score</p>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {leaderboard.map((u, i) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-yellow-600' : 'bg-blue-500'
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">{u.username}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{u.bestScore}%</p>
                        <p className="text-xs text-gray-500">{u.completedAttempts} attempts</p>
                      </div>
                    </div>
                  ))}
                  {leaderboard.length === 0 && (
                    <p className="text-sm text-gray-500">No scores yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Modal */}
      {resultsUserId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <div>
                <h4 className="text-lg font-semibold">Results</h4>
                <p className="text-xs text-gray-500">
                  {users[resultsUserId]?.username} &middot; {users[resultsUserId]?.email}
                </p>
              </div>
              <button
                onClick={() => setResultsUserId(null)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {getUserAttempts(resultsUserId)
                    .sort((a, b) => (b.endTime || b.startTime || 0) - (a.endTime || a.startTime || 0))
                    .map((a, idx) => {
                      const dur = a.endTime && a.startTime ? a.endTime - a.startTime : undefined;
                      return (
                        <tr key={a.id}>
                          <td className="px-5 py-3 text-sm text-gray-700">{idx + 1}</td>
                          <td className="px-5 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                a.isCompleted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {a.isCompleted ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                (a.score || 0) >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : (a.score || 0) >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {a.score ?? 0}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600">
                            {a.startTime ? new Date(a.startTime).toLocaleString() : '-'}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600">
                            {a.endTime ? new Date(a.endTime).toLocaleString() : '-'}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600">
                            {humanDuration(dur)}
                          </td>
                        </tr>
                      );
                    })}
                  {getUserAttempts(resultsUserId).length === 0 && (
                    <tr>
                      <td className="px-5 py-6 text-center text-sm text-gray-500" colSpan={6}>
                        No attempts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t text-right">
              <button
                onClick={() => setResultsUserId(null)}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
