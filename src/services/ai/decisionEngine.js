import { openai, openaiConfig } from '../../config/openai.js';
import { promptBuilder } from './promptBuilder.js';
import { responseParser } from './responseParser.js';

/**
 * Core AI decision engine.
 * Orchestrates prompt building, API calls, and response parsing.
 */
export const decisionEngine = {
  /**
   * Generates a decision from user input
   */
  async generateDecision({ userInput, context = null }) {
    const messages = promptBuilder.buildDecisionPrompt({ userInput, context });
    
    const response = await this.callOpenAI(messages);
    const parsed = responseParser.parseDecisionResponse(response);
    
    return {
      ...parsed,
      raw: response,
    };
  },

  /**
   * Refines an existing decision based on user feedback
   */
  async refineDecision({ originalDecision, feedback }) {
    const messages = promptBuilder.buildRefinementPrompt({
      originalDecision,
      feedback,
    });
    
    const response = await this.callOpenAI(messages);
    const parsed = responseParser.parseDecisionResponse(response);
    
    return {
      ...parsed,
      raw: response,
    };
  },

  /**
   * Handles clarification requests
   */
  async handleClarification({ originalInput, clarification }) {
    const messages = promptBuilder.buildClarificationPrompt({
      originalInput,
      clarification,
    });
    
    const response = await this.callOpenAI(messages);
    const parsed = responseParser.parseDecisionResponse(response);
    
    return {
      ...parsed,
      raw: response,
    };
  },

  /**
   * Makes the actual OpenAI API call
   */
  async callOpenAI(messages) {
    try {
      const completion = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages,
        max_tokens: openaiConfig.maxTokens,
        temperature: openaiConfig.temperature,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      return content;
    } catch (error) {
      // Wrap OpenAI errors with context
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      }
      if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      }
      if (error.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      
      throw new Error(`AI service error: ${error.message}`);
    }
  },

  /**
   * Validates that the AI service is configured and working
   */
  async healthCheck() {
    try {
      const response = await openai.chat.completions.create({
        model: openaiConfig.model,
        messages: [{ role: 'user', content: 'Say "ok" in JSON: {"status": "ok"}' }],
        max_tokens: 20,
        response_format: { type: 'json_object' },
      });
      
      return {
        status: 'ok',
        model: openaiConfig.model,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
      };
    }
  },
};

