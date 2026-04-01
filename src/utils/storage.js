/**
 * Storage utility for managing invitation data in localStorage
 * This handles all data persistence for the application
 */

// Storage keys
const STORAGE_KEYS = {
  JURY_MESSAGE: 'invitation_jury_message',
  MENTOR_MESSAGE: 'invitation_mentor_message',
  JURY_RESPONSES: 'invitation_jury_responses',
  MENTOR_RESPONSES: 'invitation_mentor_responses',
};

/**
 * Get jury invitation message from storage
 * @returns {string} The jury invitation message
 */
export const getJuryMessage = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.JURY_MESSAGE) ||
    'Dear Jury Member,\n\nYou are cordially invited to join us as a jury member for our upcoming event.\n\nPlease confirm your attendance.'
  );
};

/**
 * Set jury invitation message in storage
 * @param {string} message - The message to store
 */
export const setJuryMessage = (message) => {
  localStorage.setItem(STORAGE_KEYS.JURY_MESSAGE, message);
};

/**
 * Get mentor invitation message from storage
 * @returns {string} The mentor invitation message
 */
export const getMentorMessage = () => {
  return (
    localStorage.getItem(STORAGE_KEYS.MENTOR_MESSAGE) ||
    'Dear Mentor,\n\nYou are cordially invited to join us as a mentor for our upcoming event.\n\nPlease confirm your attendance.'
  );
};

/**
 * Set mentor invitation message in storage
 * @param {string} message - The message to store
 */
export const setMentorMessage = (message) => {
  localStorage.setItem(STORAGE_KEYS.MENTOR_MESSAGE, message);
};

/**
 * Get all jury responses from storage
 * @returns {Array} Array of jury response objects
 */
export const getJuryResponses = () => {
  const data = localStorage.getItem(STORAGE_KEYS.JURY_RESPONSES);
  return data ? JSON.parse(data) : [];
};

/**
 * Add a new jury response
 * @param {Object} response - Response object containing name, email, status, timestamp
 */
export const addJuryResponse = (response) => {
  const responses = getJuryResponses();
  responses.push({
    ...response,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEYS.JURY_RESPONSES, JSON.stringify(responses));
};

/**
 * Get all mentor responses from storage
 * @returns {Array} Array of mentor response objects
 */
export const getMentorResponses = () => {
  const data = localStorage.getItem(STORAGE_KEYS.MENTOR_RESPONSES);
  return data ? JSON.parse(data) : [];
};

/**
 * Add a new mentor response
 * @param {Object} response - Response object containing name, email, status, timestamp
 */
export const addMentorResponse = (response) => {
  const responses = getMentorResponses();
  responses.push({
    ...response,
    id: Date.now(),
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(
    STORAGE_KEYS.MENTOR_RESPONSES,
    JSON.stringify(responses),
  );
};

/**
 * Clear all responses (useful for testing)
 */
export const clearAllResponses = () => {
  localStorage.removeItem(STORAGE_KEYS.JURY_RESPONSES);
  localStorage.removeItem(STORAGE_KEYS.MENTOR_RESPONSES);
};

/**
 * Clear all data including messages and responses
 */
export const clearAllData = () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
};
