/**
 * Parses and validates AI responses.
 * Ensures responses conform to expected structure.
 */

const ALIGNMENT_SUFFIX = 'Are we aligned, or should we challenge this before moving on?';

export const responseParser = {
  /**
   * Parses the decision response from OpenAI
   */
  parseDecisionResponse(rawResponse) {
    let parsed;
    
    try {
      parsed = JSON.parse(rawResponse);
    } catch (error) {
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    const validated = this.validateDecisionStructure(parsed);
    
    // Ensure alignment question is present in reasoning
    validated.reasoning = this.ensureAlignmentQuestion(validated.reasoning);
    
    return validated;
  },

  /**
   * Validates the decision structure
   */
  validateDecisionStructure(data) {
    const errors = [];

    if (!data.decision || typeof data.decision !== 'string') {
      errors.push('Missing or invalid "decision" field');
    }

    if (!data.reasoning || typeof data.reasoning !== 'string') {
      errors.push('Missing or invalid "reasoning" field');
    }

    if (!Array.isArray(data.tasks) || data.tasks.length === 0) {
      errors.push('Missing or empty "tasks" array');
    }

    if (data.tasks && data.tasks.length > 5) {
      errors.push('Maximum 5 tasks allowed');
    }

    // Validate each task
    if (Array.isArray(data.tasks)) {
      data.tasks.forEach((task, index) => {
        if (!task.title || typeof task.title !== 'string') {
          errors.push(`Task ${index + 1}: missing or invalid "title"`);
        }
        if (typeof task.priority !== 'number' || task.priority < 1) {
          errors.push(`Task ${index + 1}: missing or invalid "priority"`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(`Invalid AI response: ${errors.join('; ')}`);
    }

    // Normalize and return
    return {
      decision: data.decision.trim(),
      reasoning: data.reasoning.trim(),
      tasks: this.normalizeTasks(data.tasks),
    };
  },

  /**
   * Normalizes task list - ensures proper priority ordering
   */
  normalizeTasks(tasks) {
    return tasks
      .map((task) => ({
        title: task.title.trim(),
        priority: parseInt(task.priority, 10),
      }))
      .sort((a, b) => a.priority - b.priority)
      .map((task, index) => ({
        ...task,
        priority: index + 1, // Ensure sequential priorities
      }));
  },

  /**
   * Ensures the alignment question is at the end of reasoning
   */
  ensureAlignmentQuestion(reasoning) {
    if (reasoning.includes(ALIGNMENT_SUFFIX)) {
      return reasoning;
    }
    
    // Remove any trailing punctuation and add the alignment question
    const trimmed = reasoning.replace(/[.!?]$/, '').trim();
    return `${trimmed}. ${ALIGNMENT_SUFFIX}`;
  },

  /**
   * Extracts confidence indicators from reasoning
   */
  extractConfidenceIndicators(reasoning) {
    const highConfidenceWords = ['clearly', 'definitely', 'certainly', 'obviously', 'must'];
    const lowConfidenceWords = ['maybe', 'perhaps', 'possibly', 'might', 'could'];
    
    const lowerReasoning = reasoning.toLowerCase();
    
    let score = 0.7; // Base confidence
    
    highConfidenceWords.forEach((word) => {
      if (lowerReasoning.includes(word)) score += 0.05;
    });
    
    lowConfidenceWords.forEach((word) => {
      if (lowerReasoning.includes(word)) score -= 0.1;
    });
    
    return Math.max(0.1, Math.min(1.0, score));
  },
};

