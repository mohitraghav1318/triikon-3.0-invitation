import {
  get as getRealtimeValue,
  onValue,
  push,
  ref as realtimeRef,
  remove,
  set as setRealtimeValue,
} from 'firebase/database';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  db,
  firebaseBackend,
  isFirebaseConfigured,
  realtimeDb,
} from './firebase';

const STORAGE_KEYS = {
  JURY_MESSAGE: 'invitation_jury_message',
  MENTOR_MESSAGE: 'invitation_mentor_message',
  JURY_RESPONSES: 'invitation_jury_responses',
  MENTOR_RESPONSES: 'invitation_mentor_responses',
  TEAM_RESPONSES: 'invitation_team_responses',
};

const DEFAULT_MESSAGES = {
  juryMessage:
    'Dear Jury Member,\n\nYou are cordially invited to join us as a jury member for our upcoming event.\n\nPlease confirm your attendance.',
  mentorMessage:
    'Dear Mentor,\n\nYou are cordially invited to join us as a mentor for our upcoming event.\n\nPlease confirm your attendance.',
};

const COLLECTIONS = {
  RESPONSES: 'responses',
};

const DOCS = {
  MESSAGES: ['settings', 'messages'],
};

const PATHS = {
  MESSAGES: 'settings/messages',
  RESPONSES: 'responses',
};

const getLocalMessage = (key, fallbackValue) => {
  return localStorage.getItem(key) || fallbackValue;
};

const setLocalMessage = (key, value) => {
  localStorage.setItem(key, value);
};

const getLocalResponses = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setLocalResponses = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const getLocalMessageState = () => {
  return {
    juryMessage: getLocalMessage(
      STORAGE_KEYS.JURY_MESSAGE,
      DEFAULT_MESSAGES.juryMessage,
    ),
    mentorMessage: getLocalMessage(
      STORAGE_KEYS.MENTOR_MESSAGE,
      DEFAULT_MESSAGES.mentorMessage,
    ),
  };
};

const cacheMessagesLocally = ({ juryMessage, mentorMessage }) => {
  setLocalMessage(STORAGE_KEYS.JURY_MESSAGE, juryMessage);
  setLocalMessage(STORAGE_KEYS.MENTOR_MESSAGE, mentorMessage);
};

const getLocalResponseState = () => {
  return {
    juryResponses: sortResponses(
      getLocalResponses(STORAGE_KEYS.JURY_RESPONSES),
    ),
    mentorResponses: sortResponses(
      getLocalResponses(STORAGE_KEYS.MENTOR_RESPONSES),
    ),
    teamResponses: sortResponses(
      getLocalResponses(STORAGE_KEYS.TEAM_RESPONSES),
    ),
  };
};

const normalizeMessageData = (data = {}) => {
  return {
    juryMessage: data.juryMessage ?? DEFAULT_MESSAGES.juryMessage,
    mentorMessage: data.mentorMessage ?? DEFAULT_MESSAGES.mentorMessage,
  };
};

const normalizeTimestamp = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }

  return null;
};

const normalizeResponse = (response, fallbackId) => {
  return {
    id: response.id ?? fallbackId,
    teamId: response.teamId ?? '',
    teamIdNormalized: response.teamIdNormalized ?? '',
    teamName: response.teamName ?? '',
    memberName: response.memberName ?? '',
    name: response.name ?? '',
    email: response.email ?? '',
    status: response.status ?? '',
    attendance: response.attendance ?? '',
    audience: response.audience ?? '',
    timestamp:
      normalizeTimestamp(response.timestamp) ||
      normalizeTimestamp(response.createdAt) ||
      new Date().toISOString(),
  };
};

const normalizeTeamId = (teamId) => {
  return String(teamId || '')
    .trim()
    .toLowerCase();
};

const sortResponses = (responses) => {
  return [...responses].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
};

const splitResponsesByAudience = (responses) => {
  return {
    juryResponses: responses.filter((response) => response.audience === 'jury'),
    mentorResponses: responses.filter(
      (response) => response.audience === 'mentor',
    ),
    teamResponses: responses.filter((response) => response.audience === 'team'),
  };
};

const readResponsesFromRealtimeDatabase = async () => {
  const snapshot = await getRealtimeValue(
    realtimeRef(realtimeDb, PATHS.RESPONSES),
  );
  const responseMap = snapshot.val() || {};

  return sortResponses(
    Object.entries(responseMap).map(([id, value]) =>
      normalizeResponse(
        {
          id,
          ...value,
        },
        id,
      ),
    ),
  );
};

const readResponsesFromFirestore = async () => {
  const responsesQuery = query(
    collection(db, COLLECTIONS.RESPONSES),
    orderBy('timestamp', 'desc'),
  );
  const snapshot = await getDocs(responsesQuery);

  return snapshot.docs.map((responseDoc) =>
    normalizeResponse(
      {
        id: responseDoc.id,
        ...responseDoc.data(),
      },
      responseDoc.id,
    ),
  );
};

export const subscribeToInvitationMessages = (callback, onError) => {
  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    const messageRef = realtimeRef(realtimeDb, PATHS.MESSAGES);

    return onValue(
      messageRef,
      (snapshot) => {
        // Missing data should not be treated as an error.
        // We fall back to the default invitation text until the admin saves.
        const messages = normalizeMessageData(snapshot.val() || {});
        cacheMessagesLocally(messages);
        callback(messages);
      },
      (error) => {
        callback(getLocalMessageState());
        onError?.(error);
      },
    );
  }

  if (!isFirebaseConfigured || !db) {
    callback(getLocalMessageState());
    return () => {};
  }

  const messageRef = doc(db, ...DOCS.MESSAGES);

  return onSnapshot(
    messageRef,
    (snapshot) => {
      const messages = normalizeMessageData(snapshot.data());
      cacheMessagesLocally(messages);
      callback(messages);
    },
    (error) => {
      callback(getLocalMessageState());
      onError?.(error);
    },
  );
};

export const subscribeToResponses = (callback, onError) => {
  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    const responsesRef = realtimeRef(realtimeDb, PATHS.RESPONSES);

    return onValue(
      responsesRef,
      (snapshot) => {
        const responseMap = snapshot.val() || {};
        const responses = sortResponses(
          Object.entries(responseMap).map(([id, value]) =>
            normalizeResponse(
              {
                id,
                ...value,
              },
              id,
            ),
          ),
        );

        callback(splitResponsesByAudience(responses));
      },
      (error) => {
        callback(getLocalResponseState());
        onError?.(error);
      },
    );
  }

  if (!isFirebaseConfigured || !db) {
    callback(getLocalResponseState());
    return () => {};
  }

  const responsesQuery = query(
    collection(db, COLLECTIONS.RESPONSES),
    orderBy('timestamp', 'desc'),
  );

  return onSnapshot(
    responsesQuery,
    (snapshot) => {
      const responses = snapshot.docs.map((responseDoc) =>
        normalizeResponse(
          {
            id: responseDoc.id,
            ...responseDoc.data(),
          },
          responseDoc.id,
        ),
      );

      callback(splitResponsesByAudience(responses));
    },
    (error) => {
      callback(getLocalResponseState());
      onError?.(error);
    },
  );
};

export const getInvitationMessages = async () => {
  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    const snapshot = await getRealtimeValue(
      realtimeRef(realtimeDb, PATHS.MESSAGES),
    );
    const messages = normalizeMessageData(snapshot.val() || {});
    cacheMessagesLocally(messages);
    return messages;
  }

  if (!isFirebaseConfigured || !db) {
    return getLocalMessageState();
  }

  const snapshot = await getDoc(doc(db, ...DOCS.MESSAGES));
  const messages = normalizeMessageData(snapshot.data());
  cacheMessagesLocally(messages);
  return messages;
};

export const getJuryMessage = async () => {
  const messages = await getInvitationMessages();
  return messages.juryMessage;
};

export const getMentorMessage = async () => {
  const messages = await getInvitationMessages();
  return messages.mentorMessage;
};

export const setInvitationMessages = async ({ juryMessage, mentorMessage }) => {
  const nextMessages = normalizeMessageData({
    juryMessage,
    mentorMessage,
  });

  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    // Keep the data shape simple in RTDB so the admin panel and invite pages
    // can read the same object without extra transforms.
    await setRealtimeValue(realtimeRef(realtimeDb, PATHS.MESSAGES), {
      ...nextMessages,
      updatedAt: new Date().toISOString(),
    });
    cacheMessagesLocally(nextMessages);
    return nextMessages;
  }

  if (!isFirebaseConfigured || !db) {
    cacheMessagesLocally(nextMessages);
    return nextMessages;
  }

  await setDoc(
    doc(db, ...DOCS.MESSAGES),
    {
      ...nextMessages,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  cacheMessagesLocally(nextMessages);

  return nextMessages;
};

export const setJuryMessage = async (message) => {
  const current = await getInvitationMessages();
  return setInvitationMessages({
    ...current,
    juryMessage: message,
  });
};

export const setMentorMessage = async (message) => {
  const current = await getInvitationMessages();
  return setInvitationMessages({
    ...current,
    mentorMessage: message,
  });
};

export const getJuryResponses = async () => {
  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    const responses = await readResponsesFromRealtimeDatabase();
    return responses.filter((response) => response.audience === 'jury');
  }

  if (!isFirebaseConfigured || !db) {
    return sortResponses(getLocalResponses(STORAGE_KEYS.JURY_RESPONSES));
  }

  const responses = await readResponsesFromFirestore();
  return responses.filter((response) => response.audience === 'jury');
};

export const getMentorResponses = async () => {
  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    const responses = await readResponsesFromRealtimeDatabase();
    return responses.filter((response) => response.audience === 'mentor');
  }

  if (!isFirebaseConfigured || !db) {
    return sortResponses(getLocalResponses(STORAGE_KEYS.MENTOR_RESPONSES));
  }

  const responses = await readResponsesFromFirestore();
  return responses.filter((response) => response.audience === 'mentor');
};

const addResponse = async (audience, response) => {
  const nextResponse = normalizeResponse(
    {
      ...response,
      audience,
      timestamp: new Date().toISOString(),
    },
    `${Date.now()}`,
  );

  if (audience === 'jury') {
    const responses = sortResponses([
      ...getLocalResponses(STORAGE_KEYS.JURY_RESPONSES),
      nextResponse,
    ]);
    setLocalResponses(STORAGE_KEYS.JURY_RESPONSES, responses);
  }

  if (audience === 'mentor') {
    const responses = sortResponses([
      ...getLocalResponses(STORAGE_KEYS.MENTOR_RESPONSES),
      nextResponse,
    ]);
    setLocalResponses(STORAGE_KEYS.MENTOR_RESPONSES, responses);
  }

  if (audience === 'team') {
    const responses = sortResponses([
      ...getLocalResponses(STORAGE_KEYS.TEAM_RESPONSES),
      nextResponse,
    ]);
    setLocalResponses(STORAGE_KEYS.TEAM_RESPONSES, responses);
  }

  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    const responseRef = push(realtimeRef(realtimeDb, PATHS.RESPONSES));
    const responseWithId = {
      ...nextResponse,
      id: responseRef.key ?? nextResponse.id,
    };

    await setRealtimeValue(responseRef, responseWithId);
    return responseWithId;
  }

  if (!isFirebaseConfigured || !db) {
    return nextResponse;
  }

  const docRef = await addDoc(collection(db, COLLECTIONS.RESPONSES), {
    ...nextResponse,
    createdAt: serverTimestamp(),
  });

  return {
    ...nextResponse,
    id: docRef.id,
  };
};

export const addJuryResponse = async (response) => {
  return addResponse('jury', response);
};

export const addMentorResponse = async (response) => {
  return addResponse('mentor', response);
};

export const addTeamResponse = async (response) => {
  return addResponse('team', response);
};

export const submitTeamResponse = async (response) => {
  const teamIdNormalized = normalizeTeamId(response?.teamId);

  if (!teamIdNormalized) {
    throw new Error('Please enter a valid team ID.');
  }

  // Team IDs and team names are intentionally not treated as unique here.
  // Multiple members from the same team are allowed to submit separately.
  const savedResponse = await addTeamResponse({
    ...response,
    teamIdNormalized,
  });

  return savedResponse;
};

export const clearAllResponses = async () => {
  localStorage.removeItem(STORAGE_KEYS.JURY_RESPONSES);
  localStorage.removeItem(STORAGE_KEYS.MENTOR_RESPONSES);
  localStorage.removeItem(STORAGE_KEYS.TEAM_RESPONSES);

  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    await remove(realtimeRef(realtimeDb, PATHS.RESPONSES));
    return;
  }

  if (!isFirebaseConfigured || !db) {
    return;
  }

  const snapshot = await getDocs(collection(db, COLLECTIONS.RESPONSES));

  if (snapshot.empty) {
    return;
  }

  const batch = writeBatch(db);

  snapshot.docs.forEach((responseDoc) => {
    batch.delete(responseDoc.ref);
  });

  await batch.commit();
};

export const clearAllData = async () => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });

  if (firebaseBackend === 'realtime-database' && realtimeDb) {
    await remove(realtimeRef(realtimeDb, PATHS.RESPONSES));
    await setRealtimeValue(realtimeRef(realtimeDb, PATHS.MESSAGES), {
      ...DEFAULT_MESSAGES,
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  if (!isFirebaseConfigured || !db) {
    return;
  }

  await clearAllResponses();
  await setDoc(doc(db, ...DOCS.MESSAGES), DEFAULT_MESSAGES, { merge: true });
};
