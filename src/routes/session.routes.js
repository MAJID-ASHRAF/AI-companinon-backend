/**
 * Session Routes
 * 
 * API endpoints for the thinking-phase engine.
 * 
 * Current Implementation: Phase 1 (DUMP)
 * Future: Phases 2-5
 */

import { Router } from 'express';
import { sessionController } from '../controllers/session.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Session:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         phase:
 *           type: string
 *           enum: [DUMP, CLARITY, DECISION, PLANNING, EXECUTION]
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [user, assistant, system]
 *         content:
 *           type: string
 *         phase:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /session:
 *   post:
 *     summary: Create a new thinking session
 *     description: Starts a new session in DUMP phase (mental offload)
 *     tags: [Session]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional user ID
 *     responses:
 *       201:
 *         description: Session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     phase:
 *                       type: string
 *                     createdAt:
 *                       type: string
 */
router.post('/', sessionController.create);

/**
 * @swagger
 * /session/{id}:
 *   get:
 *     summary: Get session with messages
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session details
 *       404:
 *         description: Session not found
 */
router.get('/:id', sessionController.get);

/**
 * @swagger
 * /session/{id}/message:
 *   post:
 *     summary: Send a message in the session
 *     description: |
 *       Main interaction endpoint. Send your thoughts (dump/brainstorm),
 *       receive a phase-appropriate AI response.
 *       
 *       In DUMP phase, the AI will:
 *       - Reflect emotions and themes
 *       - Normalize confusion
 *       - NOT ask questions or give advice
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Your thoughts, feelings, brain dump
 *     responses:
 *       200:
 *         description: AI response
 */
router.post('/:id/message', sessionController.sendMessage);

/**
 * @swagger
 * /session/{id}/advance:
 *   post:
 *     summary: Advance to next phase
 *     description: |
 *       Move to the next thinking phase.
 *       Currently only DUMP phase is implemented.
 *       Phase 2+ coming soon.
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Phase advanced
 *       400:
 *         description: Cannot advance (not implemented or final phase)
 */
router.post('/:id/advance', sessionController.advancePhase);

/**
 * @swagger
 * /session/{id}/stop:
 *   post:
 *     summary: Save and stop session
 *     description: End the session without advancing to next phase
 *     tags: [Session]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Session saved
 */
router.post('/:id/stop', sessionController.stop);

export default router;

