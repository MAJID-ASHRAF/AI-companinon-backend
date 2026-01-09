import { TaskModel } from '../../models/task.model.js';

/**
 * Task management service.
 * Handles task lifecycle and status updates.
 */
export const taskService = {
  /**
   * Creates tasks from a decision
   */
  async createTasksForDecision(decisionId, tasks) {
    const tasksWithDecision = tasks.map((task) => ({
      ...task,
      decisionId,
      status: 'pending',
    }));

    return TaskModel.createMany(tasksWithDecision);
  },

  /**
   * Gets all tasks for a decision
   */
  async getTasksByDecisionId(decisionId) {
    return TaskModel.findByDecisionId(decisionId);
  },

  /**
   * Gets pending tasks for a user
   */
  async getPendingTasksForUser(userId) {
    return TaskModel.findPendingByUserId(userId);
  },

  /**
   * Marks a task as complete
   */
  async completeTask(taskId) {
    return TaskModel.updateStatus(taskId, 'completed');
  },

  /**
   * Marks a task as in progress
   */
  async startTask(taskId) {
    return TaskModel.updateStatus(taskId, 'in_progress');
  },

  /**
   * Skips a task
   */
  async skipTask(taskId) {
    return TaskModel.updateStatus(taskId, 'skipped');
  },

  /**
   * Updates task priority
   */
  async updatePriority(taskId, newPriority) {
    return TaskModel.update(taskId, { priority: newPriority });
  },

  /**
   * Gets a single task by ID
   */
  async getTaskById(taskId) {
    return TaskModel.findById(taskId);
  },

  /**
   * Deletes a task
   */
  async deleteTask(taskId) {
    return TaskModel.delete(taskId);
  },

  /**
   * Bulk updates task statuses
   */
  async bulkUpdateStatus(taskIds, status) {
    const results = [];
    for (const id of taskIds) {
      const updated = await TaskModel.updateStatus(id, status);
      results.push(updated);
    }
    return results;
  },
};

