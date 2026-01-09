/**
 * Builds structured prompts for the AI decision engine.
 * Focus: Reduce mental confusion → produce a clear, actionable next step.
 */

const SYSTEM_PROMPT = `You are a calm, unbiased decision clarity assistant.

Your job is NOT to motivate.
Your job is NOT to explore many options.
Your job is to reduce confusion and suggest a clear next direction.

IMPORTANT BEHAVIOR RULES:
- Do not overwhelm the user
- Do not provide multiple competing paths
- Do not use hype or emotional language
- Be honest about uncertainty
- If the situation is unclear, say so

OUTPUT RULES:
- Respond ONLY in valid JSON
- Follow the exact schema provided
- No markdown
- No extra text

DECISION FRAMEWORK (follow this internally):
1. Identify the core tension or confusion
2. Decide what matters most RIGHT NOW
3. Choose ONE reasonable direction
4. Translate it into simple, concrete actions

JSON SCHEMA (must match exactly):
{
  "decision": "One clear direction stated simply",
  "reasoning": "Why this direction makes sense right now (short, calm, factual)",
  "tasks": [
    { "title": "Specific action", "priority": 1 },
    { "title": "Specific action", "priority": 2 }
  ],
  "alignment_check": "Are we aligned, or should we challenge this before moving on?"
}

FINAL CHECK BEFORE RESPONDING:
- Is this the simplest helpful answer?
- Would a thoughtful human say this?
- Does this reduce mental load?`;

const CONTEXT_TEMPLATE = `KNOWN CONTEXT (if any):
{context}

---`;

const USER_INPUT_TEMPLATE = `USER INPUT:
{userInput}`;

export const promptBuilder = {
  /**
   * Builds the complete prompt for decision generation
   */
  buildDecisionPrompt({ userInput, context = null }) {
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
    ];

    // Add context if available
    if (context) {
      messages.push({
        role: 'system',
        content: CONTEXT_TEMPLATE.replace('{context}', context),
      });
    }

    // Add user input
    messages.push({
      role: 'user',
      content: USER_INPUT_TEMPLATE.replace('{userInput}', userInput),
    });

    return messages;
  },

  /**
   * Builds a follow-up prompt for clarification
   */
  buildClarificationPrompt({ originalInput, clarification }) {
    return [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `USER INPUT:\n${originalInput}`,
      },
      {
        role: 'assistant',
        content: JSON.stringify({
          decision: 'I need more clarity before suggesting a direction.',
          reasoning: 'The input contains ambiguity that could lead to a misaligned recommendation.',
          tasks: [],
          alignment_check: 'Can you clarify the core tension you are facing?',
        }),
      },
      {
        role: 'user',
        content: `CLARIFICATION:\n${clarification}\n\nNow provide the decision in the required JSON format.`,
      },
    ];
  },

  /**
   * Builds prompt for refining an existing decision
   */
  buildRefinementPrompt({ originalDecision, feedback }) {
    return [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `PREVIOUS DIRECTION:
Decision: "${originalDecision.decision}"
Reasoning: "${originalDecision.reasoning}"
Tasks: ${JSON.stringify(originalDecision.tasks)}

USER FEEDBACK:
${feedback}

Refine the direction based on this feedback. Respond in the required JSON format.`,
      },
    ];
  },

  /**
   * Gets the system prompt for reference
   */
  getSystemPrompt() {
    return SYSTEM_PROMPT;
  },
};
