/**
 * Priority calculation service.
 * Handles task priority logic and reordering.
 */
export const priorityService = {
  /**
   * Priority levels with weights
   */
  PRIORITY_WEIGHTS: {
    URGENT: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
  },

  /**
   * Assigns priorities to tasks based on keywords and context
   */
  assignPriorities(tasks) {
    const scored = tasks.map((task) => ({
      ...task,
      score: this.calculatePriorityScore(task.title),
    }));

    // Sort by score (lower is higher priority)
    scored.sort((a, b) => a.score - b.score);

    // Assign sequential priorities
    return scored.map((task, index) => ({
      title: task.title,
      priority: index + 1,
    }));
  },

  /**
   * Calculates a priority score based on task title
   */
  calculatePriorityScore(title) {
    const lowerTitle = title.toLowerCase();
    let score = 50; // Base score

    // Urgent indicators
    const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'blocker'];
    urgentKeywords.forEach((keyword) => {
      if (lowerTitle.includes(keyword)) score -= 30;
    });

    // High priority indicators
    const highKeywords = ['important', 'first', 'before', 'must', 'required'];
    highKeywords.forEach((keyword) => {
      if (lowerTitle.includes(keyword)) score -= 15;
    });

    // Low priority indicators
    const lowKeywords = ['later', 'eventually', 'nice to have', 'optional', 'when possible'];
    lowKeywords.forEach((keyword) => {
      if (lowerTitle.includes(keyword)) score += 20;
    });

    // Action verb priority boost
    const actionVerbs = ['create', 'build', 'fix', 'implement', 'setup'];
    actionVerbs.forEach((verb) => {
      if (lowerTitle.startsWith(verb)) score -= 5;
    });

    return score;
  },

  /**
   * Reorders tasks when a priority is manually changed
   */
  reorderTasks(tasks, taskId, newPriority) {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return tasks;

    const task = tasks[taskIndex];
    const otherTasks = tasks.filter((t) => t.id !== taskId);

    // Insert task at new priority position
    const reordered = [];
    let priorityCounter = 1;

    for (let i = 0; i < otherTasks.length + 1; i++) {
      if (priorityCounter === newPriority) {
        reordered.push({ ...task, priority: priorityCounter });
        priorityCounter++;
      }
      if (otherTasks[i]) {
        reordered.push({ ...otherTasks[i], priority: priorityCounter });
        priorityCounter++;
      }
    }

    return reordered;
  },

  /**
   * Normalizes priorities to be sequential
   */
  normalizePriorities(tasks) {
    return tasks
      .sort((a, b) => a.priority - b.priority)
      .map((task, index) => ({
        ...task,
        priority: index + 1,
      }));
  },
};

