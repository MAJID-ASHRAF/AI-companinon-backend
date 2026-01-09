/**
 * Confidence score calculation utilities.
 * Estimates how confident we are in a decision.
 */

/**
 * Calculates overall confidence score for a decision
 */
export function calculateConfidenceScore(decision, context = {}) {
  const factors = {
    inputClarity: calculateInputClarity(context.userInput),
    decisionSpecificity: calculateDecisionSpecificity(decision.decision),
    taskActionability: calculateTaskActionability(decision.tasks),
    reasoningQuality: calculateReasoningQuality(decision.reasoning),
    contextAvailability: context.hasContext ? 0.1 : 0,
  };

  // Weighted average
  const weights = {
    inputClarity: 0.2,
    decisionSpecificity: 0.25,
    taskActionability: 0.25,
    reasoningQuality: 0.2,
    contextAvailability: 0.1,
  };

  let totalScore = 0;
  for (const [factor, score] of Object.entries(factors)) {
    totalScore += score * weights[factor];
  }

  return {
    overall: Math.round(totalScore * 100) / 100,
    factors,
    level: getConfidenceLevel(totalScore),
  };
}

/**
 * Calculates input clarity score
 */
function calculateInputClarity(input) {
  if (!input) return 0.5;

  let score = 0.5;

  // Longer, more detailed input is usually clearer
  if (input.length > 50) score += 0.1;
  if (input.length > 100) score += 0.1;
  if (input.length > 200) score += 0.1;

  // Contains specific keywords indicating clear intent
  const clarityIndicators = ['want', 'need', 'goal', 'problem', 'decision'];
  clarityIndicators.forEach((indicator) => {
    if (input.toLowerCase().includes(indicator)) score += 0.05;
  });

  // Penalize very short or vague inputs
  if (input.length < 20) score -= 0.2;

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculates how specific the decision is
 */
function calculateDecisionSpecificity(decision) {
  if (!decision) return 0;

  let score = 0.5;

  // Longer decisions tend to be more specific
  const wordCount = decision.split(/\s+/).length;
  if (wordCount > 5) score += 0.1;
  if (wordCount > 10) score += 0.1;

  // Contains action verbs
  const actionVerbs = ['create', 'build', 'implement', 'start', 'focus', 'prioritize'];
  actionVerbs.forEach((verb) => {
    if (decision.toLowerCase().includes(verb)) score += 0.05;
  });

  // Penalize vague language
  const vagueWords = ['maybe', 'perhaps', 'might', 'could', 'possibly'];
  vagueWords.forEach((word) => {
    if (decision.toLowerCase().includes(word)) score -= 0.1;
  });

  return Math.max(0, Math.min(1, score));
}

/**
 * Calculates how actionable the tasks are
 */
function calculateTaskActionability(tasks) {
  if (!tasks || tasks.length === 0) return 0;

  let totalScore = 0;

  tasks.forEach((task) => {
    let taskScore = 0.5;

    // Task starts with action verb
    const actionVerbs = ['create', 'build', 'write', 'set up', 'implement', 
                         'design', 'review', 'test', 'deploy', 'configure'];
    const lowerTitle = task.title.toLowerCase();
    if (actionVerbs.some((verb) => lowerTitle.startsWith(verb))) {
      taskScore += 0.2;
    }

    // Task is specific (has numbers or specific terms)
    if (/\d/.test(task.title)) taskScore += 0.1;
    if (task.title.length > 10) taskScore += 0.1;

    // Penalize vague tasks
    if (lowerTitle.includes('etc') || lowerTitle.includes('...')) {
      taskScore -= 0.2;
    }

    totalScore += taskScore;
  });

  return Math.max(0, Math.min(1, totalScore / tasks.length));
}

/**
 * Calculates reasoning quality
 */
function calculateReasoningQuality(reasoning) {
  if (!reasoning) return 0;

  let score = 0.5;

  // Contains causal language
  const causalWords = ['because', 'therefore', 'since', 'as a result', 'this means'];
  causalWords.forEach((word) => {
    if (reasoning.toLowerCase().includes(word)) score += 0.1;
  });

  // Reasonable length
  const wordCount = reasoning.split(/\s+/).length;
  if (wordCount >= 10 && wordCount <= 100) score += 0.1;

  // Contains the alignment question
  if (reasoning.includes('aligned')) score += 0.1;

  return Math.max(0, Math.min(1, score));
}

/**
 * Gets confidence level label
 */
function getConfidenceLevel(score) {
  if (score >= 0.8) return 'high';
  if (score >= 0.6) return 'medium';
  if (score >= 0.4) return 'low';
  return 'very_low';
}

/**
 * Formats confidence for display
 */
export function formatConfidence(confidenceScore) {
  return {
    percentage: `${Math.round(confidenceScore.overall * 100)}%`,
    level: confidenceScore.level,
    summary: getConfidenceSummary(confidenceScore),
  };
}

/**
 * Gets a human-readable summary of confidence
 */
function getConfidenceSummary(confidenceScore) {
  const { level, factors } = confidenceScore;

  if (level === 'high') {
    return 'Strong confidence in this recommendation.';
  }

  if (level === 'medium') {
    return 'Reasonable confidence. Consider validating key assumptions.';
  }

  // Find lowest factor
  const lowestFactor = Object.entries(factors)
    .sort((a, b) => a[1] - b[1])[0];

  const suggestions = {
    inputClarity: 'Try providing more specific details.',
    decisionSpecificity: 'The decision could be more concrete.',
    taskActionability: 'Tasks could be more specific.',
    reasoningQuality: 'Reasoning could use more justification.',
    contextAvailability: 'More context would help.',
  };

  return `Lower confidence. ${suggestions[lowestFactor[0]] || 'Consider adding more detail.'}`;
}

