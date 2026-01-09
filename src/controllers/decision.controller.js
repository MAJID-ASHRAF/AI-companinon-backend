import { decisionEngine } from '../services/ai/decisionEngine.js';
import { taskService } from '../services/task/taskService.js';
import { contextService } from '../services/memory/contextService.js';
import { DecisionModel } from '../models/decision.model.js';
import { validateInput, normalizeInput } from '../utils/normalizeInput.js';
import { calculateConfidenceScore } from '../utils/confidenceScore.js';
import { Errors, asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Decision controller.
 * Handles decision generation and management.
 */
export const decisionController = {
  /**
   * POST /decision
   * Generates a decision from user input
   */
  create: asyncHandler(async (req, res) => {
    const { userInput, userId } = req.body;

    // Validate input
    const validation = validateInput(userInput);
    if (!validation.valid) {
      throw Errors.validation(validation.errors.join(', '));
    }

    const normalizedInput = validation.normalized;

    // Get user context if available
    let context = null;
    if (userId) {
      context = await contextService.getContextForUser(userId);
    }

    // Generate decision using AI
    const aiResult = await decisionEngine.generateDecision({
      userInput: normalizedInput,
      context,
    });

    // Calculate confidence score
    const confidence = calculateConfidenceScore(aiResult, {
      userInput: normalizedInput,
      hasContext: !!context,
    });

    // Prepare response
    const response = {
      decision: aiResult.decision,
      reasoning: aiResult.reasoning,
      tasks: aiResult.tasks,
      confidence: confidence.overall,
    };

    // Persist if user is identified (optional - fails gracefully if DB unavailable)
    if (userId) {
      try {
        const savedDecision = await DecisionModel.create({
          userId,
          userInput: normalizedInput,
          decision: aiResult.decision,
          reasoning: aiResult.reasoning,
          confidenceScore: confidence.overall,
        });

        // Save tasks
        await taskService.createTasksForDecision(savedDecision.id, aiResult.tasks);

        response.id = savedDecision.id;
      } catch (dbError) {
        // Database unavailable - continue without persistence
        console.warn('[decision] Database unavailable, skipping persistence:', dbError.message);
        response.persisted = false;
      }
    }

    res.status(201).json({
      success: true,
      data: response,
    });
  }),

  /**
   * GET /decision/:id
   * Retrieves a specific decision
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const decision = await DecisionModel.findById(id);
    if (!decision) {
      throw Errors.notFound('Decision not found');
    }

    const tasks = await taskService.getTasksByDecisionId(id);

    res.json({
      success: true,
      data: {
        ...decision,
        tasks,
      },
    });
  }),

  /**
   * GET /decision/user/:userId
   * Gets decisions for a user
   */
  getByUserId: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const decisions = await DecisionModel.findByUserId(userId, parseInt(limit, 10));

    res.json({
      success: true,
      data: decisions,
    });
  }),

  /**
   * POST /decision/:id/refine
   * Refines an existing decision based on feedback
   */
  refine: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || typeof feedback !== 'string') {
      throw Errors.validation('Feedback is required');
    }

    const originalDecision = await DecisionModel.findById(id);
    if (!originalDecision) {
      throw Errors.notFound('Decision not found');
    }

    const tasks = await taskService.getTasksByDecisionId(id);

    const aiResult = await decisionEngine.refineDecision({
      originalDecision: {
        decision: originalDecision.decision,
        reasoning: originalDecision.reasoning,
        tasks,
      },
      feedback: normalizeInput(feedback),
    });

    // Calculate new confidence
    const confidence = calculateConfidenceScore(aiResult, {
      userInput: originalDecision.user_input,
      hasContext: true,
    });

    res.json({
      success: true,
      data: {
        decision: aiResult.decision,
        reasoning: aiResult.reasoning,
        tasks: aiResult.tasks,
        confidence: confidence.overall,
        refinedFrom: id,
      },
    });
  }),
};

