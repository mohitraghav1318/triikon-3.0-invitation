import { useEffect, useState } from 'react';
import ThreeBackground from '../components/ThreeBackground';
import {
  // clearAllResponses,
  setInvitationMessages,
  subscribeToInvitationMessages,
  subscribeToResponses,
} from '../utils/storage';
import {
  firebaseBackend,
  firebaseSetupMessage,
  isFirebaseConfigured,
} from '../utils/firebase';

/**
 * Admin Page Component
 * Allows admin to:
 * - Edit invitation messages for jury and mentors
 * - View all responses from jury and mentors
 * - Manage the invitation system
 * No navigation buttons - accessed directly via URL
 */
export default function AdminPage() {
  const getFirebaseErrorMessage = (action, firebaseError) => {
    const errorCode = firebaseError?.code || '';

    if (errorCode.includes('permission-denied')) {
      return `Unable to ${action}. Your Firebase ${firebaseBackend} rules are blocking this request.`;
    }

    if (errorCode.includes('failed-precondition')) {
      return `Unable to ${action}. The selected Firebase database is not enabled for this project yet.`;
    }

    return `Unable to ${action}. Check your Firebase setup and ${firebaseBackend} rules.`;
  };

  // State for messages
  const [juryMsg, setJuryMsg] = useState('');
  const [mentorMsg, setMentorMsg] = useState('');

  // State for responses
  const [juryResponses, setJuryResponses] = useState([]);
  const [mentorResponses, setMentorResponses] = useState([]);

  // State for active tab
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'responses'

  // State for save feedback
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');
  const [isSavingMessages, setIsSavingMessages] = useState(false);
  // const [isClearingResponses, setIsClearingResponses] = useState(false);

  /**
   * Subscribe to Firestore-backed data
   */
  useEffect(() => {
    const unsubscribeMessages = subscribeToInvitationMessages(
      (messages) => {
        setJuryMsg(messages.juryMessage);
        setMentorMsg(messages.mentorMessage);
      },
      (firebaseError) => {
        setError(
          getFirebaseErrorMessage('load invitation messages', firebaseError),
        );
      },
    );

    const unsubscribeResponses = subscribeToResponses(
      ({
        juryResponses: nextJuryResponses,
        mentorResponses: nextMentorResponses,
      }) => {
        setJuryResponses(nextJuryResponses);
        setMentorResponses(nextMentorResponses);
      },
      (firebaseError) => {
        setError(getFirebaseErrorMessage('load responses', firebaseError));
      },
    );

    return () => {
      unsubscribeMessages();
      unsubscribeResponses();
    };
  }, []);

  /**
   * Save messages to storage
   */
  const handleSaveMessages = async () => {
    setError('');
    setIsSavingMessages(true);

    try {
      await setInvitationMessages({
        juryMessage: juryMsg,
        mentorMessage: mentorMsg,
      });
      setSaveStatus('Messages saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (firebaseError) {
      setError(getFirebaseErrorMessage('save messages', firebaseError));
    } finally {
      setIsSavingMessages(false);
    }
  };

  /**
   * Clear all responses (for testing/reset)
   */
  // const handleClearResponses = async () => {
  //   if (
  //     window.confirm(
  //       'Are you sure you want to clear all responses? This cannot be undone.',
  //     )
  //   ) {
  //     setError('');
  //     setIsClearingResponses(true);

  //     try {
  //       await clearAllResponses();
  //       setSaveStatus('All responses cleared!');
  //       setTimeout(() => setSaveStatus(''), 3000);
  //     } catch (firebaseError) {
  //       setError(getFirebaseErrorMessage('clear responses', firebaseError));
  //     } finally {
  //       setIsClearingResponses(false);
  //     }
  //   }
  // };

  /**
   * Format timestamp to readable date
   */
  const formatDate = (timestamp) => {
    if (!timestamp) {
      return '-';
    }

    return new Date(timestamp).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="page-container">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="page-header">
          <h1>Admin Panel</h1>
          <p>Manage invitations and view responses</p>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('messages')}
            className={activeTab === 'messages' ? 'active' : ''}
          >
            Edit Messages
          </button>
          <button
            onClick={() => setActiveTab('responses')}
            className={activeTab === 'responses' ? 'active' : ''}
          >
            View Responses
          </button>
        </div>

        {/* Save Status Message */}
        {saveStatus && (
          <div className="alert alert-success max-w-4xl mx-auto mb-6">
            <p className="text-center font-semibold">{saveStatus}</p>
          </div>
        )}

        {!isFirebaseConfigured && (
          <div className="alert alert-error max-w-4xl mx-auto mb-6">
            <p className="text-center font-semibold">
              {firebaseSetupMessage} The app is currently falling back to this
              browser&apos;s local storage only.
            </p>
          </div>
        )}

        {error && (
          <div className="alert alert-error max-w-4xl mx-auto mb-6">
            <p className="text-center font-semibold">{error}</p>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Jury Message Editor */}
            <div className="glass-card">
              <h2 className="text-3xl font-bold text-primary mb-6">
                Jury Invitation Message
              </h2>
              <div className="form-group">
                <textarea
                  value={juryMsg}
                  onChange={(e) => setJuryMsg(e.target.value)}
                  placeholder="Enter jury invitation message..."
                  rows="10"
                />
              </div>
            </div>

            {/* Mentor Message Editor */}
            <div className="glass-card">
              <h2 className="text-3xl font-bold text-primary mb-6">
                Mentor Invitation Message
              </h2>
              <div className="form-group">
                <textarea
                  value={mentorMsg}
                  onChange={(e) => setMentorMsg(e.target.value)}
                  placeholder="Enter mentor invitation message..."
                  rows="10"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="text-center">
              <button onClick={handleSaveMessages} className="btn btn-primary">
                {isSavingMessages ? 'Saving...' : 'Save Messages'}
              </button>
            </div>
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Jury Responses</h3>
                <div className="stat-number">{juryResponses.length}</div>
                <div className="stat-details">
                  Attending:{' '}
                  {juryResponses.filter((r) => r.status === 'attending').length}{' '}
                  | Not Attending:{' '}
                  {
                    juryResponses.filter((r) => r.status === 'not-attending')
                      .length
                  }{' '}
                  | Maybe:{' '}
                  {juryResponses.filter((r) => r.status === 'maybe').length}
                </div>
              </div>
              <div className="stat-card">
                <h3>Mentor Responses</h3>
                <div className="stat-number">{mentorResponses.length}</div>
                <div className="stat-details">
                  Attending:{' '}
                  {
                    mentorResponses.filter((r) => r.status === 'attending')
                      .length
                  }{' '}
                  | Not Attending:{' '}
                  {
                    mentorResponses.filter((r) => r.status === 'not-attending')
                      .length
                  }{' '}
                  | Maybe:{' '}
                  {mentorResponses.filter((r) => r.status === 'maybe').length}
                </div>
              </div>
            </div>

            {/* Jury Responses Table */}
            <div className="glass-card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-primary">
                  Jury Responses
                </h2>
                {/* <button
                  onClick={handleClearResponses}
                  className="btn btn-secondary text-sm"
                >
                  {isClearingResponses
                    ? 'Clearing...'
                    : 'Clear All Responses'}
                </button> */}
              </div>
              {juryResponses.length === 0 ? (
                <p className="text-light text-opacity-50 text-center py-12 text-lg">
                  No responses yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="response-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {juryResponses.map((response) => (
                        <tr key={response.id}>
                          <td>{response.name}</td>
                          <td>{response.email}</td>
                          <td>
                            <span className={`status-badge ${response.status}`}>
                              {response.status}
                            </span>
                          </td>
                          <td>{formatDate(response.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mentor Responses Table */}
            <div className="glass-card">
              <h2 className="text-3xl font-bold text-primary mb-6">
                Mentor Responses
              </h2>
              {mentorResponses.length === 0 ? (
                <p className="text-light text-opacity-50 text-center py-12 text-lg">
                  No responses yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="response-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mentorResponses.map((response) => (
                        <tr key={response.id}>
                          <td>{response.name}</td>
                          <td>{response.email}</td>
                          <td>
                            <span className={`status-badge ${response.status}`}>
                              {response.status}
                            </span>
                          </td>
                          <td>{formatDate(response.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
