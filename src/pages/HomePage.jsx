import { useEffect, useMemo, useState } from 'react';
import ThreeBackground from '../components/ThreeBackground';
import { submitTeamResponse } from '../utils/storage';

// We keep the target start time in one place so it is easy to update later.
const HACKATHON_START_TIME = new Date('2026-04-04T10:00:00+05:30');
const SUBMIT_COOLDOWN_SECONDS = 10;

// This helper converts milliseconds into a readable countdown string.
const formatCountdown = (remainingMs) => {
  if (remainingMs <= 0) {
    return '00d 00h 00m 00s';
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
};

export default function HomePage() {
  // Form state: each input has its own value for easier beginner understanding.
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [attendance, setAttendance] = useState('');

  // Feedback state for the submit action.
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCooldownSeconds, setSubmitCooldownSeconds] = useState(0);

  // Countdown state starts only after successful submit.
  const [remainingMs, setRemainingMs] = useState(0);

  // This computes the user-facing date string once.
  const startTimeText = useMemo(() => {
    return HACKATHON_START_TIME.toLocaleString('en-IN', {
      dateStyle: 'long',
      timeStyle: 'short',
    });
  }, []);

  useEffect(() => {
    if (!submitted) {
      return undefined;
    }

    // Update countdown immediately after submit.
    const updateCountdown = () => {
      const nextRemaining = HACKATHON_START_TIME.getTime() - Date.now();
      setRemainingMs(Math.max(nextRemaining, 0));
    };

    updateCountdown();

    // Then keep ticking every second.
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [submitted]);

  useEffect(() => {
    if (submitCooldownSeconds <= 0) {
      return undefined;
    }

    // Keep the submit button on a short cooldown to prevent rapid repeat clicks.
    const timeoutId = window.setTimeout(() => {
      setSubmitCooldownSeconds((currentSeconds) =>
        Math.max(currentSeconds - 1, 0),
      );
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [submitCooldownSeconds]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Basic validations so users cannot submit empty data.
    if (!teamId.trim()) {
      setError('Please enter your team ID.');
      return;
    }

    if (!teamName.trim()) {
      setError('Please enter your team name.');
      return;
    }

    if (!memberName.trim()) {
      setError('Please enter member name.');
      return;
    }

    if (!attendance) {
      setError('Please choose Coming or Not Coming.');
      return;
    }

    if (submitCooldownSeconds > 0) {
      setError(
        `Please wait ${submitCooldownSeconds} second(s) before submitting again.`,
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitCooldownSeconds(SUBMIT_COOLDOWN_SECONDS);

    try {
      // Team ID and team name are allowed to repeat so every member can submit.
      // The button cooldown is only here to slow accidental rapid re-clicks.
      await submitTeamResponse({
        teamId: teamId.trim(),
        teamName: teamName.trim(),
        memberName: memberName.trim(),
        name: memberName.trim(),
        email: '',
        status: attendance === 'coming' ? 'attending' : 'not-attending',
        attendance,
      });

      // Mark submit as successful and reset form fields.
      setSubmitted(true);
      setTeamId('');
      setTeamName('');
      setMemberName('');
      setAttendance('');
    } catch (submitError) {
      setError(
        submitError?.message || 'Unable to submit right now. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <ThreeBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-5xl">
        <div className="page-header">
          <h1>Trikon 3.0 Starts-in</h1>
          <p>Share your team details and attendance status</p>
        </div>

        {!submitted && (
          <div className="glass-card home-form-card">
            <div className="home-form-intro">
              <span className="home-chip">Home Page Form</span>
              <h2>Team Confirmation Form</h2>
              <p>
                Fill your team details below. Members from the same team can
                submit with the same team ID and team name.
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <p className="text-center font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="team-id">Team ID *</label>
                <input
                  id="team-id"
                  type="text"
                  value={teamId}
                  onChange={(event) => setTeamId(event.target.value)}
                  placeholder="Example: 020, 001, 204 (from your registration email)"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="team-name">Team Name *</label>
                <input
                  id="team-name"
                  type="text"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                  placeholder="Example: Code Warriors"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="member-name">Member Name *</label>
                <input
                  id="member-name"
                  type="text"
                  value={memberName}
                  onChange={(event) => setMemberName(event.target.value)}
                  placeholder="Example: Riya Sharma (team lead)"
                  required
                />
              </div>

              <div className="form-group">
                <label>Attendance *</label>
                <p className="text-light text-opacity-70 text-sm mb-3">
                  Select one option: Coming or Not Coming.
                </p>
                <div className="attendance-actions">
                  <button
                    type="button"
                    className={`btn ${attendance === 'coming' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAttendance('coming')}
                  >
                    Coming
                  </button>
                  <button
                    type="button"
                    className={`btn ${attendance === 'not-coming' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setAttendance('not-coming')}
                  >
                    Not Coming
                  </button>
                </div>
              </div>

              <div className="text-center mt-8">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || submitCooldownSeconds > 0}
                >
                  {isSubmitting
                    ? 'Submitting...'
                    : submitCooldownSeconds > 0
                      ? `Please wait ${submitCooldownSeconds}s`
                      : 'Submit Form'}
                </button>
              </div>
            </form>
          </div>
        )}

        {submitted && (
          <div className="glass-card countdown-screen">
            <p className="countdown-screen-label">Hackathon Starts In</p>
            <h2 className="countdown-screen-value">
              {formatCountdown(remainingMs)}
            </h2>
            <p className="countdown-screen-meta">
              Hackathon starting time is 10:00 AM April 4, 2026.
            </p>
            <p className="countdown-screen-meta-small">
              Local time: {startTimeText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
