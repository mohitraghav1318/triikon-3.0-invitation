import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import JuryPage from './pages/JuryPage';
import MentorPage from './pages/MentorPage';

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
        {/* Admin Route */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Jury Invitation Route */}
        <Route path="/jury" element={<JuryPage />} />

        {/* Mentor Invitation Route */}
        <Route path="/mentor" element={<MentorPage />} />

        {/* Default Route - Redirect to Admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Catch-all Route - Redirect to Admin */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
