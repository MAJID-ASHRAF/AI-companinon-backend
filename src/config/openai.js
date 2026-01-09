import OpenAI from 'openai';
import { env } from './env.js';

// Lazy initialization - only create client when API key is available
let aiClient = null;

export const getOpenAI = () => {
  if (!aiClient) {
    if (!env.ai.apiKey) {
      throw new Error('AI API key is not configured. Please set GROQ_API_KEY or OPENAI_API_KEY in your .env file.');
    }
    
    aiClient = new OpenAI({
      apiKey: env.ai.apiKey,
      baseURL: env.ai.baseUrl,
    });
  }
  return aiClient;
};

// For backwards compatibility
export const openai = {
  get chat() {
    return getOpenAI().chat;
  },
};

export const openaiConfig = {
  model: env.ai.model,
  maxTokens: 2048,
  temperature: 0.7,
};

