/**
 * Session Controller
 * 
 * Handles HTTP requests for session-based conversations.
 * Phase 1 (DUMP) is currently implemented.
 */

import { sessionService } from '../services/session/sessionService.js';
import { Errors, asyncHandler } from '../middlewares/error.middleware.js';
import { PHASES } from '../models/session.model.js';

export const sessionController = {
  /**
   * Create a new session
   * POST /session
   * 
   * Always starts in DUMP phase
   */
  create: asyncHandler(async (req, res) => {
    const { userId } = req.body;

    const session = await sessionService.createSession(userId || null);

    res.status(201).json({
      success: true,
      data: {
        id: session.id,
        phase: session.current_phase,
        createdAt: session.created_at,
      },
    });
  }),

  /**
   * Get session by ID
   * GET /session/:id
   */
  get: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await sessionService.getSession(id);
    if (!session) {
      throw Errors.notFound('Session not found');
    }

    res.json({
      success: true,
      data: {
        id: session.id,
        phase: session.current_phase,
        messages: session.messages,
        createdAt: session.created_at,
        updatedAt: session.updated_at,
      },
    });
  }),

  /**
   * Send a message in the session
   * POST /session/:id/message
   * 
   * This is the main interaction endpoint.
   * User sends their dump/brainstorm, AI responds according to phase rules.
   */
  sendMessage: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== 'string' || !content.trim()) {
      throw Errors.badRequest('Content is required');
    }

    // Check session exists
    const session = await sessionService.getSession(id);
    if (!session) {
      throw Errors.notFound('Session not found');
    }

    // Process message with phase-aware AI
    const result = await sessionService.processMessage(id, content.trim());

    res.json({
      success: true,
      data: {
        message: result.message,
        phase: result.phase,
        // Include validation info for debugging (can remove in production)
        _meta: {
          validationPassed: result.validationPassed,
          regenerated: result.regenerated,
        },
      },
    });
  }),

  /**
   * Advance to next phase
   * POST /session/:id/advance
   * 
   * Only the user can trigger phase transitions.
   * The AI never decides to move phases.
   */
  advancePhase: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await sessionService.getSession(id);
    if (!session) {
      throw Errors.notFound('Session not found');
    }

    // Check if we're in DUMP phase and trying to advance
    if (session.current_phase === PHASES.DUMP) {
      // For now, Phase 2+ is not implemented
      throw Errors.badRequest(
        'Phase 2 (CLARITY) is not yet implemented. Stay in the dump phase for now.'
      );
    }

    // Future: Allow advancing to next phases
    const updated = await sessionService.advancePhase(id);
    if (!updated) {
      throw Errors.badRequest('Cannot advance from current phase');
    }

    res.json({
      success: true,
      data: {
        id: updated.id,
        previousPhase: session.current_phase,
        currentPhase: updated.current_phase,
      },
    });
  }),

  /**
   * Save and stop session (end without advancing)
   * POST /session/:id/stop
   */
  stop: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await sessionService.getSession(id);
    if (!session) {
      throw Errors.notFound('Session not found');
    }

    // For now, we just return the session as-is
    // Future: Could add a "completed" or "paused" status

    res.json({
      success: true,
      data: {
        id: session.id,
        phase: session.current_phase,
        messageCount: session.messages.length,
        message: 'Session saved. You can return to it anytime.',
      },
    });
  }),
};

