import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskFull:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         decision_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *           example: Identify which project has the biggest impact
 *         priority:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, skipped]
 *           example: pending
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /task/{id}:
 *   get:
 *     summary: Get a specific task by ID
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskFull'
 *       404:
 *         description: Task not found
 */
router.get('/:id', taskController.getById);

/**
 * @swagger
 * /task/decision/{decisionId}:
 *   get:
 *     summary: Get all tasks for a decision
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: decisionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The decision ID
 *     responses:
 *       200:
 *         description: List of tasks
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
 *                     $ref: '#/components/schemas/TaskFull'
 */
router.get('/decision/:decisionId', taskController.getByDecisionId);

/**
 * @swagger
 * /task/user/{userId}/pending:
 *   get:
 *     summary: Get pending tasks for a user
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The user ID
 *     responses:
 *       200:
 *         description: List of pending tasks
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
 *                     $ref: '#/components/schemas/TaskFull'
 */
router.get('/user/:userId/pending', taskController.getPendingForUser);

/**
 * @swagger
 * /task/{id}/status:
 *   patch:
 *     summary: Update task status
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, skipped]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskFull'
 *       404:
 *         description: Task not found
 *       422:
 *         description: Invalid status
 */
router.patch('/:id/status', taskController.updateStatus);

/**
 * @swagger
 * /task/{id}/priority:
 *   patch:
 *     summary: Update task priority
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - priority
 *             properties:
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       200:
 *         description: Task priority updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TaskFull'
 *                 reorderedTasks:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskFull'
 *       404:
 *         description: Task not found
 */
router.patch('/:id/priority', taskController.updatePriority);

/**
 * @swagger
 * /task/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Task]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The task ID
 *     responses:
 *       200:
 *         description: Task deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: Task deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', taskController.delete);

/**
 * @swagger
 * /task/bulk-status:
 *   post:
 *     summary: Bulk update task statuses
 *     tags: [Task]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *               - status
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 example: ["uuid-1", "uuid-2"]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, skipped]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Tasks updated
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
 *                     updated:
 *                       type: integer
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TaskFull'
 */
router.post('/bulk-status', taskController.bulkUpdateStatus);

export default router;
