import { Router } from 'express';
import { decisionController } from '../controllers/decision.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: The task description
 *           example: Identify which project has the biggest impact
 *         priority:
 *           type: integer
 *           description: Priority order (1 is highest)
 *           example: 1
 *     DecisionResponse:
 *       type: object
 *       properties:
 *         decision:
 *           type: string
 *           description: The clear, single direction to take
 *           example: Focus exclusively on completing your highest-impact project this week
 *         reasoning:
 *           type: string
 *           description: Brief explanation ending with alignment question
 *           example: When everything feels urgent, nothing gets done well. Are we aligned, or should we challenge this before moving on?
 *         tasks:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Task'
 *         confidence:
 *           type: number
 *           format: float
 *           description: Confidence score between 0 and 1
 *           example: 0.82
 *         id:
 *           type: string
 *           format: uuid
 *           description: Decision ID (only if userId was provided)
 */

/**
 * @swagger
 * /decision:
 *   post:
 *     summary: Generate a decision from user input
 *     description: |
 *       Takes unstructured user thoughts and returns:
 *       - One clear decision
 *       - Brief reasoning (ending with alignment question)
 *       - Prioritized tasks (max 5)
 *       - Confidence score
 *     tags: [Decision]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userInput
 *             properties:
 *               userInput:
 *                 type: string
 *                 description: Raw thoughts from user
 *                 example: I'm feeling overwhelmed with work. I have 3 projects due, my inbox is overflowing, and I haven't exercised in weeks.
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional user ID to persist the decision
 *     responses:
 *       201:
 *         description: Decision generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DecisionResponse'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     message:
 *                       type: string
 */
router.post('/', decisionController.create);

/**
 * @swagger
 * /decision/{id}:
 *   get:
 *     summary: Get a specific decision by ID
 *     tags: [Decision]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The decision ID
 *     responses:
 *       200:
 *         description: Decision found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DecisionResponse'
 *       404:
 *         description: Decision not found
 */
router.get('/:id', decisionController.getById);

/**
 * @swagger
 * /decision/user/{userId}:
 *   get:
 *     summary: Get all decisions for a user
 *     tags: [Decision]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of decisions to return
 *     responses:
 *       200:
 *         description: List of decisions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DecisionResponse'
 */
router.get('/user/:userId', decisionController.getByUserId);

/**
 * @swagger
 * /decision/{id}/refine:
 *   post:
 *     summary: Refine an existing decision based on feedback
 *     tags: [Decision]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The decision ID to refine
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: string
 *                 description: User feedback to refine the decision
 *                 example: Actually, one of the other projects has a hard deadline tomorrow
 *     responses:
 *       200:
 *         description: Refined decision
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/DecisionResponse'
 *                     - type: object
 *                       properties:
 *                         refinedFrom:
 *                           type: string
 *                           format: uuid
 *       404:
 *         description: Original decision not found
 */
router.post('/:id/refine', decisionController.refine);

export default router;
