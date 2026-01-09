import { taskService } from '../services/task/taskService.js';
import { priorityService } from '../services/task/priorityService.js';
import { Errors, asyncHandler } from '../middlewares/error.middleware.js';

/**
 * Task controller.
 * Handles task management operations.
 */
export const taskController = {
  /**
   * GET /task/:id
   * Gets a specific task
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await taskService.getTaskById(id);
    if (!task) {
      throw Errors.notFound('Task not found');
    }

    res.json({
      success: true,
      data: task,
    });
  }),

  /**
   * GET /task/decision/:decisionId
   * Gets all tasks for a decision
   */
  getByDecisionId: asyncHandler(async (req, res) => {
    const { decisionId } = req.params;

    const tasks = await taskService.getTasksByDecisionId(decisionId);

    res.json({
      success: true,
      data: tasks,
    });
  }),

  /**
   * GET /task/user/:userId/pending
   * Gets pending tasks for a user
   */
  getPendingForUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const tasks = await taskService.getPendingTasksForUser(userId);

    res.json({
      success: true,
      data: tasks,
    });
  }),

  /**
   * PATCH /task/:id/status
   * Updates task status
   */
  updateStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'in_progress', 'completed', 'skipped'];
    if (!validStatuses.includes(status)) {
      throw Errors.validation(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const task = await taskService.getTaskById(id);
    if (!task) {
      throw Errors.notFound('Task not found');
    }

    let updated;
    switch (status) {
      case 'completed':
        updated = await taskService.completeTask(id);
        break;
      case 'in_progress':
        updated = await taskService.startTask(id);
        break;
      case 'skipped':
        updated = await taskService.skipTask(id);
        break;
      default:
        updated = await taskService.getTaskById(id);
    }

    res.json({
      success: true,
      data: updated,
    });
  }),

  /**
   * PATCH /task/:id/priority
   * Updates task priority
   */
  updatePriority: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { priority } = req.body;

    if (typeof priority !== 'number' || priority < 1) {
      throw Errors.validation('Priority must be a positive number');
    }

    const task = await taskService.getTaskById(id);
    if (!task) {
      throw Errors.notFound('Task not found');
    }

    const updated = await taskService.updatePriority(id, priority);

    // Get all tasks for the same decision and reorder
    const allTasks = await taskService.getTasksByDecisionId(task.decision_id);
    const reordered = priorityService.reorderTasks(allTasks, id, priority);

    // Update all affected tasks
    for (const t of reordered) {
      if (t.id !== id) {
        await taskService.updatePriority(t.id, t.priority);
      }
    }

    res.json({
      success: true,
      data: updated,
      reorderedTasks: reordered,
    });
  }),

  /**
   * DELETE /task/:id
   * Deletes a task
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const task = await taskService.getTaskById(id);
    if (!task) {
      throw Errors.notFound('Task not found');
    }

    await taskService.deleteTask(id);

    res.json({
      success: true,
      message: 'Task deleted',
    });
  }),

  /**
   * POST /task/bulk-status
   * Bulk update task statuses
   */
  bulkUpdateStatus: asyncHandler(async (req, res) => {
    const { taskIds, status } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      throw Errors.validation('taskIds must be a non-empty array');
    }

    const validStatuses = ['pending', 'in_progress', 'completed', 'skipped'];
    if (!validStatuses.includes(status)) {
      throw Errors.validation(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updated = await taskService.bulkUpdateStatus(taskIds, status);

    res.json({
      success: true,
      data: {
        updated: updated.length,
        tasks: updated,
      },
    });
  }),
};

