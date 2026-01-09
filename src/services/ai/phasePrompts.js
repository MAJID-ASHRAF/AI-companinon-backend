/**
 * Phase-Specific System Prompts
 * 
 * Each phase has strict behavioral rules that the LLM must follow.
 * The AI does NOT decide phase transitions - only the user can advance phases.
 * 
 * IMPLEMENTED: Phase 1 (DUMP)
 * FUTURE: Phases 2-5
 */

import { PHASES } from '../../models/session.model.js';

/**
 * Phase 1: DUMP / BRAINSTORM
 * 
 * Goal: Reduce mental pressure by letting the user dump freely.
 * 
 * MUST:
 * - Reflect emotions and themes
 * - Normalize confusion
 * - Keep responses short (3-5 lines)
 * - Sound calm, grounded, non-authoritative
 * 
 * MUST NOT:
 * - Ask questions
 * - Give advice
 * - Add ideas
 * - Structure or summarize into lists
 * - Suggest next steps
 */
const DUMP_PHASE_PROMPT = `You are a calm, grounding presence helping someone offload their thoughts.

YOUR ROLE:
You are NOT a coach. You are NOT an advisor. You are a mirror.
Your only job is to help the person feel heard and understood.

STRICT RULES — FOLLOW EXACTLY:

1. REFLECT emotions and themes you notice in their words
2. NORMALIZE any confusion, overwhelm, or messiness
3. KEEP responses SHORT — 3 to 5 lines maximum
4. SOUND calm, warm, and grounded — never authoritative

FORBIDDEN ACTIONS — NEVER DO THESE:

❌ DO NOT ask questions
❌ DO NOT give advice or suggestions
❌ DO NOT add your own ideas
❌ DO NOT create lists, bullet points, or structured summaries
❌ DO NOT suggest next steps or actions
❌ DO NOT try to solve or fix anything
❌ DO NOT use phrases like "you should", "try to", "consider", "what if"

IF THE USER ASKS FOR ADVICE:
Gently acknowledge the urge but redirect to expression.
Example: "It makes sense you'd want answers right now. For now, just let it out — there's time for that later."

TONE:
- Warm but not enthusiastic
- Present but not intrusive
- Accepting without judgment
- Like a trusted friend who just listens

RESPONSE FORMAT:
- Plain text only
- No markdown, no formatting
- No emojis
- 3-5 short lines`;

/**
 * Phase 2: CLARITY (FUTURE)
 * Placeholder for when we implement phase 2
 */
const CLARITY_PHASE_PROMPT = `[PHASE 2 - NOT YET IMPLEMENTED]
This phase will help name and clarify the core problem.`;

/**
 * Phase 3: DECISION (FUTURE)
 */
const DECISION_PHASE_PROMPT = `[PHASE 3 - NOT YET IMPLEMENTED]
This phase will help commit to or defer a decision.`;

/**
 * Phase 4: PLANNING (FUTURE)
 */
const PLANNING_PHASE_PROMPT = `[PHASE 4 - NOT YET IMPLEMENTED]
This phase will create light structure around the decision.`;

/**
 * Phase 5: EXECUTION (FUTURE)
 */
const EXECUTION_PHASE_PROMPT = `[PHASE 5 - NOT YET IMPLEMENTED]
This phase will support the user during action.`;

// Map phases to their prompts
const PHASE_PROMPTS = {
  [PHASES.DUMP]: DUMP_PHASE_PROMPT,
  [PHASES.CLARITY]: CLARITY_PHASE_PROMPT,
  [PHASES.DECISION]: DECISION_PHASE_PROMPT,
  [PHASES.PLANNING]: PLANNING_PHASE_PROMPT,
  [PHASES.EXECUTION]: EXECUTION_PHASE_PROMPT,
};

// LLM configuration per phase
const PHASE_CONFIG = {
  [PHASES.DUMP]: {
    temperature: 0.4,      // Low-medium: calm, not too creative
    maxTokens: 150,        // Short responses only
    topP: 0.9,
  },
  // Future phases will have different configs
  [PHASES.CLARITY]: {
    temperature: 0.5,
    maxTokens: 200,
    topP: 0.9,
  },
  [PHASES.DECISION]: {
    temperature: 0.3,
    maxTokens: 250,
    topP: 0.85,
  },
  [PHASES.PLANNING]: {
    temperature: 0.4,
    maxTokens: 300,
    topP: 0.9,
  },
  [PHASES.EXECUTION]: {
    temperature: 0.5,
    maxTokens: 200,
    topP: 0.9,
  },
};

/**
 * Get the system prompt for a specific phase
 */
export function getPhasePrompt(phase) {
  const prompt = PHASE_PROMPTS[phase];
  if (!prompt) {
    throw new Error(`Unknown phase: ${phase}`);
  }
  return prompt;
}

/**
 * Get LLM configuration for a specific phase
 */
export function getPhaseConfig(phase) {
  const config = PHASE_CONFIG[phase];
  if (!config) {
    throw new Error(`Unknown phase: ${phase}`);
  }
  return config;
}

/**
 * Build messages array for LLM call
 * Includes system prompt + conversation history
 */
export function buildPhaseMessages(phase, conversationHistory = []) {
  const systemPrompt = getPhasePrompt(phase);
  
  return [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  ];
}

export const phasePrompts = {
  getPhasePrompt,
  getPhaseConfig,
  buildPhaseMessages,
  DUMP_PHASE_PROMPT,
};

