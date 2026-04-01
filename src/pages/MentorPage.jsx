import { useState, useEffect } from 'react';
import ThreeBackground from '../components/ThreeBackground';
import { getMentorMessage, addMentorResponse } from '../utils/storage';

/**
 * Mentor Invitation Page Component
 * Displays invitation message and collects RSVP response from mentors
 * No navigation buttons - accessed directly via URL
 */
export default function MentorPage() {
  // State for the invitation message
  const [message, setMessage] = useState('');

  // State for form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  // State for submission feedback
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Load invitation message on component mount
  useEffect(() => {
    setMessage(getMentorMessage());
  }, []);

  /**
   * Handle form submission
   * Validates inputs and saves response to storage
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset error state
    setError('');

    // Validate inputs
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!status) {
      setError('Please select your attendance status');
      return;
    }

    // Save response
    addMentorResponse({
      name: name.trim(),
      email: email.trim(),
      status,
    });

    // Show success message
    setSubmitted(true);

    // Reset form
    setName('');
    setEmail('');
    setStatus('');

    // Hide success message after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <div className="page-container">
      {/* Three.js Background */}
      <ThreeBackground />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="page-header">
          <h1>Mentor Invitation</h1>
          <p>We would be honored by your presence</p>
        </div>

        {/* Main Card */}
        <div className="glass-card">
          {/* Invitation Message */}
          <div className="message-box">
            <pre>{message}</pre>
          </div>

          {/* Success Message */}
          {submitted && (
            <div className="alert alert-success">
              <p className="text-center font-semibold">
                ✓ Thank you! Your response has been recorded successfully.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error">
              <p className="text-center font-semibold">{error}</p>
            </div>
          )}

          {/* RSVP Form */}
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold text-primary mb-8 text-center">
              Please Confirm Your Attendance
            </h2>

            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            {/* Status Selection */}
            <div className="form-group">
              <label>Attendance Status *</label>
              <div className="radio-group">
                {/* Attending Option */}
                <label
                  className={`radio-option ${status === 'attending' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="attending"
                    checked={status === 'attending'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>✓ Yes, I will attend</span>
                </label>

                {/* Not Attending Option */}
                <label
                  className={`radio-option ${status === 'not-attending' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="not-attending"
                    checked={status === 'not-attending'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>✗ Sorry, I cannot attend</span>
                </label>

                {/* Maybe Option */}
                <label
                  className={`radio-option ${status === 'maybe' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="maybe"
                    checked={status === 'maybe'}
                    onChange={(e) => setStatus(e.target.value)}
                  />
                  <span>? Maybe, I'm not sure yet</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center mt-8">
              <button type="submit" className="btn btn-primary">
                Submit Response
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
