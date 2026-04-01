import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import JuryPage from './pages/JuryPage';
import MentorPage from './pages/MentorPage';

const ADMIN_ATTEMPTS_STORAGE_KEY = 'admin_login_attempts';
const ADMIN_LOCK_STORAGE_KEY = 'admin_lock_until';
const ADMIN_SESSION_STORAGE_KEY = 'admin_session_allowed';
const MAX_ADMIN_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const LOCK_TIME_MS = 15 * 60 * 1000;

// Use env password when available, and fallback to a dev default.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

const getRecentAttempts = () => {
  const now = Date.now();
  const rawAttempts = localStorage.getItem(ADMIN_ATTEMPTS_STORAGE_KEY);
  const parsedAttempts = rawAttempts ? JSON.parse(rawAttempts) : [];

  // Keep only attempts inside the rolling window so old failures expire.
  const filteredAttempts = parsedAttempts.filter(
    (time) => now - time <= ATTEMPT_WINDOW_MS,
  );

  localStorage.setItem(
    ADMIN_ATTEMPTS_STORAGE_KEY,
    JSON.stringify(filteredAttempts),
  );

  return filteredAttempts;
};

const getRemainingLockMs = () => {
  const now = Date.now();
  const lockUntil = Number(localStorage.getItem(ADMIN_LOCK_STORAGE_KEY) || 0);

  return Math.max(lockUntil - now, 0);
};

function AdminProtectedRoute() {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true',
  );
  const [remainingLockMs, setRemainingLockMs] = useState(getRemainingLockMs());

  useEffect(() => {
    if (remainingLockMs <= 0) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      setRemainingLockMs(getRemainingLockMs());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [remainingLockMs]);

  const lockMessage = useMemo(() => {
    if (remainingLockMs <= 0) {
      return '';
    }

    const totalSeconds = Math.ceil(remainingLockMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `Too many failed attempts. Try again in ${minutes}m ${seconds}s.`;
  }, [remainingLockMs]);

  const handleUnlockAdmin = (event) => {
    event.preventDefault();
    setError('');

    const activeLockMs = getRemainingLockMs();
    setRemainingLockMs(activeLockMs);

    if (activeLockMs > 0) {
      return;
    }

    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
      localStorage.removeItem(ADMIN_ATTEMPTS_STORAGE_KEY);
      localStorage.removeItem(ADMIN_LOCK_STORAGE_KEY);
      setIsAuthenticated(true);
      setPasswordInput('');
      return;
    }

    const nextAttempts = [...getRecentAttempts(), Date.now()];
    localStorage.setItem(
      ADMIN_ATTEMPTS_STORAGE_KEY,
      JSON.stringify(nextAttempts),
    );

    if (nextAttempts.length >= MAX_ADMIN_ATTEMPTS) {
      const nextLockUntil = Date.now() + LOCK_TIME_MS;
      localStorage.setItem(ADMIN_LOCK_STORAGE_KEY, String(nextLockUntil));
      setRemainingLockMs(LOCK_TIME_MS);
      setError('Rate limit reached because of repeated wrong passwords.');
      return;
    }

    const attemptsLeft = MAX_ADMIN_ATTEMPTS - nextAttempts.length;
    setError(`Wrong password. ${attemptsLeft} attempt(s) left before lock.`);
  };

  if (isAuthenticated) {
    return <AdminPage />;
  }

  return (
    <div className="page-container">
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="page-header">
          <h1>Admin Access</h1>
          <p>Password protected with login rate limiting</p>
        </div>

        <div className="glass-card">
          {lockMessage && (
            <div className="alert alert-error">
              <p className="text-center font-semibold">{lockMessage}</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <p className="text-center font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleUnlockAdmin}>
            <div className="form-group">
              <label htmlFor="admin-password">Admin Password</label>
              <input
                id="admin-password"
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                placeholder="Enter admin password"
                disabled={remainingLockMs > 0}
              />
            </div>

            <div className="text-center mt-8">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={remainingLockMs > 0}
              >
                Unlock Admin
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Main App Component
 * Sets up routing for the application
 * Routes:
 * - /admin - Admin panel for managing invitations and viewing responses
 * - /jury - Jury invitation page
 * - /mentor - Mentor invitation page
 * - / - Redirects to admin page by default
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Default Home Route */}
        <Route path="/" element={<HomePage />} />

        {/* Password protected Admin Route */}
        <Route path="/admin" element={<AdminProtectedRoute />} />

        {/* Jury Invitation Route */}
        <Route path="/jury" element={<JuryPage />} />

        {/* Mentor Invitation Route */}
        <Route path="/mentor" element={<MentorPage />} />

        {/* Catch-all Route - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
