/**
 * Summary service for condensing conversation history.
 * Helps manage context window efficiently.
 */
export const summaryService = {
  /**
   * Maximum length for summaries
   */
  MAX_SUMMARY_LENGTH: 500,

  /**
   * Creates a summary of a decision
   */
  summarizeDecision(decision) {
    const { decision: decisionText, reasoning, tasks } = decision;
    
    const taskCount = tasks?.length || 0;
    const topTask = tasks?.[0]?.title || 'No tasks';
    
    return {
      shortSummary: `${decisionText} (${taskCount} tasks)`,
      fullSummary: `Decision: ${decisionText}. First action: ${topTask}`,
    };
  },

  /**
   * Creates a session summary from multiple decisions
   */
  summarizeSession(decisions) {
    if (!decisions || decisions.length === 0) {
      return null;
    }

    const themes = this.extractThemes(decisions);
    const completedCount = decisions.reduce((count, d) => {
      const completedTasks = d.tasks?.filter((t) => t.status === 'completed') || [];
      return count + completedTasks.length;
    }, 0);

    const totalTasks = decisions.reduce((count, d) => {
      return count + (d.tasks?.length || 0);
    }, 0);

    return {
      decisionsCount: decisions.length,
      themes: themes.slice(0, 3),
      progress: {
        completed: completedCount,
        total: totalTasks,
        percentage: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0,
      },
      summary: this.generateNarrativeSummary(decisions, themes),
    };
  },

  /**
   * Extracts common themes from decisions
   */
  extractThemes(decisions) {
    const wordCounts = {};
    
    decisions.forEach((decision) => {
      const text = `${decision.decision} ${decision.reasoning}`.toLowerCase();
      const words = text.split(/\W+/).filter((w) => w.length > 4);
      
      words.forEach((word) => {
        if (!this.isStopWord(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });

    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  },

  /**
   * Checks if a word is a common stop word
   */
  isStopWord(word) {
    const stopWords = [
      'about', 'after', 'again', 'being', 'could', 'doing',
      'during', 'first', 'getting', 'going', 'having', 'their',
      'there', 'these', 'thing', 'think', 'those', 'through',
      'would', 'should', 'before', 'because', 'while',
    ];
    return stopWords.includes(word);
  },

  /**
   * Generates a narrative summary
   */
  generateNarrativeSummary(decisions, themes) {
    if (decisions.length === 1) {
      return `Focused on: ${decisions[0].decision}`;
    }

    const themeText = themes.length > 0 
      ? `Key themes: ${themes.join(', ')}.` 
      : '';
    
    return `Made ${decisions.length} decisions. ${themeText}`;
  },

  /**
   * Truncates text to max length
   */
  truncate(text, maxLength = this.MAX_SUMMARY_LENGTH) {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
  },
};

