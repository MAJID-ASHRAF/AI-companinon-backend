import 'dotenv/config';

// Determine which AI provider to use (Groq takes priority if configured)
const getAIConfig = () => {
  // Groq (free, fast)
  if (process.env.GROQ_API_KEY) {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: 'https://api.groq.com/openai/v1',
      model: process.env.AI_MODEL || 'llama-3.3-70b-versatile',
      provider: 'groq',
    };
  }
  
  // OpenAI (fallback)
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com/v1',
      model: process.env.AI_MODEL || 'gpt-4',
      provider: 'openai',
    };
  }
  
  // No API key configured
  return {
    apiKey: null,
    baseUrl: null,
    model: null,
    provider: null,
  };
};

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'ai_assistant',
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
  },
  
  ai: getAIConfig(),
  
  // Backwards compatibility
  openai: getAIConfig(),
  
  isDevelopment() {
    return this.nodeEnv === 'development';
  },
  
  isProduction() {
    return this.nodeEnv === 'production';
  },
};

