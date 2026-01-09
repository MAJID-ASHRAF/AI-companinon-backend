/**
 * Session Service
 * 
 * Handles session-based conversations with phase-aware AI responses.
 * Enforces phase rules and validates AI responses.
 */

import { SessionModel, PHASES } from '../../models/session.model.js';
import { getPhasePrompt, getPhaseConfig, buildPhaseMessages } from '../ai/phasePrompts.js';
import { getOpenAI } from '../../config/openai.js';
import { env } from '../../config/env.js';

/**
 * Patterns that indicate forbidden responses in DUMP phase
 * If detected, the response should be regenerated
 */
const DUMP_PHASE_VIOLATIONS = {
  questions: [
    /\?$/m,                           // Ends with question mark
    /^(what|how|why|when|where|who|would|could|can|do|does|have|has|are|is)\s/im,
  ],
  advice: [
    /\b(you should|you could|try to|consider|i suggest|i recommend|maybe you|perhaps you)\b/i,
    /\b(why don't you|what if you|have you tried)\b/i,
  ],
  structure: [
    /^\s*[-•*]\s/m,                   // Bullet points
    /^\s*\d+\.\s/m,                   // Numbered lists
    /^#{1,6}\s/m,                     // Markdown headers
  ],
  nextSteps: [
    /\b(next step|first step|start by|begin with|action item)\b/i,
    /\b(to-do|todo|task|plan)\b/i,
  ],
};

/**
 * Check if a response violates DUMP phase rules
 * Returns an object with violation details
 */
function checkDumpPhaseViolations(response) {
  const violations = [];

  for (const [category, patterns] of Object.entries(DUMP_PHASE_VIOLATIONS)) {
    for (const pattern of patterns) {
      if (pattern.test(response)) {
        violations.push({ category, pattern: pattern.toString() });
        break; // One violation per category is enough
      }
    }
  }

  return {
    hasViolations: violations.length > 0,
    violations,
  };
}

/**
 * Check response length - DUMP phase should be 3-5 lines
 */
function checkResponseLength(response) {
  const lines = response.trim().split('\n').filter(l => l.trim());
  return {
    isValid: lines.length >= 1 && lines.length <= 6,
    lineCount: lines.length,
  };
}

export const sessionService = {
  /**
   * Create a new session
   */
  async createSession(userId = null) {
    return SessionModel.create(userId);
  },

  /**
   * Get session with messages
   */
  async getSession(sessionId) {
    return SessionModel.findWithMessages(sessionId);
  },

  /**
   * Process user input and generate AI response
   * Enforces phase rules and validates response
   */
  async processMessage(sessionId, userContent) {
    // Get session
    const session = await SessionModel.findWithMessages(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const currentPhase = session.current_phase;

    // Save user message
    await SessionModel.addMessage(sessionId, 'user', userContent, currentPhase);

    // Build conversation history (include new user message)
    const history = [
      ...session.messages,
      { role: 'user', content: userContent },
    ];

    // Generate AI response with phase-specific config
    const response = await this.generatePhaseResponse(currentPhase, history);

    // Save assistant message
    const savedMessage = await SessionModel.addMessage(
      sessionId,
      'assistant',
      response.content,
      currentPhase
    );

    return {
      message: savedMessage,
      phase: currentPhase,
      validationPassed: response.validationPassed,
      regenerated: response.regenerated,
    };
  },

  /**
   * Generate AI response for the current phase
   * Includes validation and regeneration if needed
   */
  async generatePhaseResponse(phase, conversationHistory, attempt = 1) {
    const MAX_ATTEMPTS = 3;
    
    const messages = buildPhaseMessages(phase, conversationHistory);
    const config = getPhaseConfig(phase);
    const aiClient = getOpenAI();

    // Call LLM
    const completion = await aiClient.chat.completions.create({
      model: env.ai.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';

    // Validate response based on phase
    if (phase === PHASES.DUMP) {
      const violations = checkDumpPhaseViolations(content);
      const lengthCheck = checkResponseLength(content);

      if (violations.hasViolations || !lengthCheck.isValid) {
        console.warn(`[PHASE VIOLATION] Attempt ${attempt}:`, {
          violations: violations.violations,
          lineCount: lengthCheck.lineCount,
        });

        // Retry if we haven't exceeded max attempts
        if (attempt < MAX_ATTEMPTS) {
          // Add a reminder to the system about violations
          const reminderHistory = [
            ...conversationHistory,
            {
              role: 'system',
              content: `REMINDER: Your previous response violated phase rules. DO NOT ask questions. DO NOT give advice. DO NOT use lists. Keep it to 3-5 lines of plain reflection.`,
            },
          ];
          return this.generatePhaseResponse(phase, reminderHistory, attempt + 1);
        }

        // If all attempts failed, still return but flag it
        return {
          content,
          validationPassed: false,
          regenerated: attempt > 1,
          violations: violations.violations,
        };
      }
    }

    return {
      content,
      validationPassed: true,
      regenerated: attempt > 1,
    };
  },

  /**
   * Advance session to next phase
   * Only called when user explicitly chooses to continue
   */
  async advancePhase(sessionId) {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    if (!SessionModel.canAdvance(session.current_phase)) {
      throw new Error('Cannot advance from current phase');
    }

    return SessionModel.advancePhase(sessionId);
  },

  /**
   * Get user's recent sessions
   */
  async getUserSessions(userId, limit = 10) {
    return SessionModel.findByUser(userId, limit);
  },
};

