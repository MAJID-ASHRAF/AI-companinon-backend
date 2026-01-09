/**
 * Input normalization utilities.
 * Cleans and prepares user input for AI processing.
 */

/**
 * Normalizes user input for processing
 */
export function normalizeInput(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let normalized = input;

  // Trim whitespace
  normalized = normalized.trim();

  // Collapse multiple spaces/newlines
  normalized = normalized.replace(/\s+/g, ' ');

  // Remove potentially problematic characters
  normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Normalize quotes
  normalized = normalized.replace(/[""]/g, '"');
  normalized = normalized.replace(/['']/g, "'");

  // Normalize dashes
  normalized = normalized.replace(/[–—]/g, '-');

  return normalized;
}

/**
 * Validates that input meets minimum requirements
 */
export function validateInput(input) {
  const errors = [];

  if (!input) {
    errors.push('Input is required');
    return { valid: false, errors };
  }

  if (typeof input !== 'string') {
    errors.push('Input must be a string');
    return { valid: false, errors };
  }

  const normalized = normalizeInput(input);

  if (normalized.length < 3) {
    errors.push('Input is too short (minimum 3 characters)');
  }

  if (normalized.length > 10000) {
    errors.push('Input is too long (maximum 10000 characters)');
  }

  // Check for meaningful content (not just punctuation or numbers)
  const hasLetters = /[a-zA-Z]/.test(normalized);
  if (!hasLetters) {
    errors.push('Input must contain text');
  }

  return {
    valid: errors.length === 0,
    errors,
    normalized: errors.length === 0 ? normalized : null,
  };
}

/**
 * Extracts key phrases from input (simple extraction)
 */
export function extractKeyPhrases(input) {
  const normalized = normalizeInput(input);
  
  // Remove common words
  const stopWords = new Set([
    'i', 'me', 'my', 'we', 'our', 'you', 'your', 'the', 'a', 'an',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on',
    'with', 'at', 'by', 'from', 'about', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
    'very', 'just', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
    'while', 'this', 'that', 'these', 'those', 'am', 'what', 'which',
  ]);

  const words = normalized.toLowerCase().split(/\W+/);
  const meaningfulWords = words.filter(
    (word) => word.length > 2 && !stopWords.has(word)
  );

  // Count word frequency
  const wordCounts = {};
  meaningfulWords.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  // Return top keywords
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Detects the likely intent type from input
 */
export function detectIntentType(input) {
  const normalized = normalizeInput(input).toLowerCase();

  const intentPatterns = {
    question: /\?|^(what|how|why|when|where|who|which|can|should|would|is|are|do|does)/,
    planning: /(plan|schedule|organize|prepare|strategy|goal|objective)/,
    problem: /(problem|issue|trouble|stuck|help|confused|unsure|challenge)/,
    decision: /(decide|choose|pick|select|option|alternative|versus|or)/,
    task: /(need to|want to|have to|must|should|todo|task|action)/,
  };

  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(normalized)) {
      return intent;
    }
  }

  return 'general';
}

