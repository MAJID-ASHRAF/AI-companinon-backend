/**
 * Global error handling middleware.
 * Catches all errors and returns consistent responses.
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error factory methods
 */
export const Errors = {
  badRequest: (message = 'Bad request') => 
    new AppError(message, 400, 'BAD_REQUEST'),
  
  unauthorized: (message = 'Unauthorized') => 
    new AppError(message, 401, 'UNAUTHORIZED'),
  
  forbidden: (message = 'Forbidden') => 
    new AppError(message, 403, 'FORBIDDEN'),
  
  notFound: (message = 'Not found') => 
    new AppError(message, 404, 'NOT_FOUND'),
  
  conflict: (message = 'Conflict') => 
    new AppError(message, 409, 'CONFLICT'),
  
  validation: (message = 'Validation error') => 
    new AppError(message, 422, 'VALIDATION_ERROR'),
  
  internal: (message = 'Internal server error') => 
    new AppError(message, 500, 'INTERNAL_ERROR'),
  
  aiService: (message = 'AI service error') => 
    new AppError(message, 503, 'AI_SERVICE_ERROR'),
};

/**
 * Error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'INTERNAL_ERROR';

  // Log error details (in production, use proper logging)
  console.error(`[ERROR] ${new Date().toISOString()}`, {
    code,
    message,
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle specific error types
  if (err.name === 'SyntaxError' && err.body) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
    code = 'INVALID_JSON';
  }

  if (err.code === 'ECONNREFUSED') {
    statusCode = 503;
    message = 'Database connection failed';
    code = 'DATABASE_ERROR';
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * 404 handler for unknown routes
 */
export const notFoundHandler = (req, res, next) => {
  const error = Errors.notFound(`Route ${req.method} ${req.path} not found`);
  next(error);
};

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

