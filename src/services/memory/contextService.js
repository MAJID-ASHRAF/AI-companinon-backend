import { DecisionModel } from '../../models/decision.model.js';

/**
 * Context service for managing conversational memory.
 * Provides relevant context for AI decision-making.
 */
export const contextService = {
  /**
   * Maximum context entries to include
   */
  MAX_CONTEXT_ENTRIES: 5,

  /**
   * Gets relevant context for a user
   * Returns null gracefully if database is unavailable
   */
  async getContextForUser(userId) {
    if (!userId) return null;

    try {
      const recentDecisions = await DecisionModel.findRecent(
        userId,
        this.MAX_CONTEXT_ENTRIES
      );

      if (recentDecisions.length === 0) return null;

      return this.formatContext(recentDecisions);
    } catch (error) {
      // Database not available - continue without context
      console.warn('[contextService] Database unavailable, skipping context:', error.message);
      return null;
    }
  },

  /**
   * Formats decisions into a context string
   */
  formatContext(decisions) {
    if (!decisions || decisions.length === 0) return null;

    const contextParts = decisions.map((decision, index) => {
      const taskSummary = this.summarizeTasks(decision.tasks);
      return `[${index + 1}] Decision: ${decision.decision}
   Tasks: ${taskSummary}
   When: ${this.formatTimeAgo(decision.created_at)}`;
    });

    return `Recent decisions:\n${contextParts.join('\n\n')}`;
  },

  /**
   * Summarizes tasks into a brief string
   */
  summarizeTasks(tasks) {
    if (!tasks || tasks.length === 0) return 'None';
    
    // Filter out null tasks from LEFT JOIN
    const validTasks = tasks.filter((t) => t && t.title);
    
    if (validTasks.length === 0) return 'None';
    if (validTasks.length <= 2) {
      return validTasks.map((t) => t.title).join(', ');
    }
    
    return `${validTasks[0].title} + ${validTasks.length - 1} more`;
  },

  /**
   * Formats a date as relative time
   */
  formatTimeAgo(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return then.toLocaleDateString();
  },

  /**
   * Checks if context is relevant (not too old)
   */
  isContextRelevant(decisions) {
    if (!decisions || decisions.length === 0) return false;
    
    const mostRecent = new Date(decisions[0].created_at);
    const now = new Date();
    const diffDays = (now - mostRecent) / 86400000;
    
    // Context older than 7 days is considered less relevant
    return diffDays < 7;
  },
};

