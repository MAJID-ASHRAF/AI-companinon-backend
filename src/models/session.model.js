/**
 * Session Model (In-Memory)
 * 
 * Manages conversation sessions with phase tracking.
 * Uses in-memory storage for quick testing - swap to DB later.
 * 
 * PHASES (locked order):
 * 1. DUMP - Mental offload, brainstorming (IMPLEMENTED)
 * 2. CLARITY - Name the problem (FUTURE)
 * 3. DECISION - Commit or defer (FUTURE)
 * 4. PLANNING - Light structure (FUTURE)
 * 5. EXECUTION - Support during action (FUTURE)
 */

import { randomUUID } from 'crypto';

// Valid phases - order matters, transitions only go forward
export const PHASES = {
  DUMP: 'DUMP',           // Phase 1: Mental offload
  CLARITY: 'CLARITY',     // Phase 2: Name the problem (FUTURE)
  DECISION: 'DECISION',   // Phase 3: Commit or defer (FUTURE)
  PLANNING: 'PLANNING',   // Phase 4: Light structure (FUTURE)
  EXECUTION: 'EXECUTION', // Phase 5: Execution support (FUTURE)
};

const PHASE_ORDER = ['DUMP', 'CLARITY', 'DECISION', 'PLANNING', 'EXECUTION'];

// ============================================
// IN-MEMORY STORAGE
// Replace with database calls when ready
// ============================================
const sessions = new Map();
const messages = new Map();

export const SessionModel = {
  /**
   * Create a new session
   * Always starts in DUMP phase
   */
  async create(userId = null) {
    const session = {
      id: randomUUID(),
      user_id: userId,
      current_phase: PHASES.DUMP,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    sessions.set(session.id, session);
    messages.set(session.id, []);
    
    return session;
  },

  /**
   * Get session by ID
   */
  async findById(id) {
    return sessions.get(id) || null;
  },

  /**
   * Get session with all messages
   */
  async findWithMessages(id) {
    const session = sessions.get(id);
    if (!session) return null;

    const sessionMessages = messages.get(id) || [];

    return {
      ...session,
      messages: sessionMessages,
    };
  },

  /**
   * Add a message to the session
   */
  async addMessage(sessionId, role, content, phase) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const message = {
      id: randomUUID(),
      session_id: sessionId,
      role,
      content,
      phase,
      created_at: new Date().toISOString(),
    };

    const sessionMessages = messages.get(sessionId) || [];
    sessionMessages.push(message);
    messages.set(sessionId, sessionMessages);

    // Update session timestamp
    session.updated_at = new Date().toISOString();
    sessions.set(sessionId, session);

    return message;
  },

  /**
   * Advance session to next phase
   * Only allows forward transitions, never backward
   * Returns null if transition is not allowed
   */
  async advancePhase(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return null;

    const currentIndex = PHASE_ORDER.indexOf(session.current_phase);
    const nextIndex = currentIndex + 1;

    // Cannot advance past final phase
    if (nextIndex >= PHASE_ORDER.length) {
      return null;
    }

    const nextPhase = PHASE_ORDER[nextIndex];
    session.current_phase = nextPhase;
    session.updated_at = new Date().toISOString();
    sessions.set(sessionId, session);

    return session;
  },

  /**
   * Check if a phase transition is valid
   */
  canAdvance(currentPhase) {
    const currentIndex = PHASE_ORDER.indexOf(currentPhase);
    return currentIndex < PHASE_ORDER.length - 1;
  },

  /**
   * Get recent sessions for a user
   */
  async findByUser(userId, limit = 10) {
    const userSessions = [];
    for (const session of sessions.values()) {
      if (session.user_id === userId) {
        userSessions.push(session);
      }
    }
    return userSessions
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      .slice(0, limit);
  },

  /**
   * Clear all sessions (for testing)
   */
  async clearAll() {
    sessions.clear();
    messages.clear();
  },
};
