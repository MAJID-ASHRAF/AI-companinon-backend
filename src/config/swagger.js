import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Personal Assistant API',
      version: '1.0.0',
      description: `
A decision-first AI Personal Assistant backend that transforms unstructured user thoughts into clear decisions with prioritized actionable tasks.

## Philosophy
- **One decision, not many options**
- Clarifies the core problem
- Proposes ONE clear direction
- Breaks it into prioritized actions
- Ends with: "Are we aligned, or should we challenge this before moving on?"
      `,
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Decision',
        description: 'AI-powered decision generation',
      },
      {
        name: 'Task',
        description: 'Task management operations',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);

