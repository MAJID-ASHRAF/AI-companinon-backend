/**
 * Request logging middleware.
 * Logs incoming requests and response times.
 */

/**
 * Creates a request logger middleware
 */
export const requestLogger = (options = {}) => {
  const { 
    logBody = false,
    excludePaths = ['/health'],
  } = options;

  return (req, res, next) => {
    // Skip logging for excluded paths
    if (excludePaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    const startTime = Date.now();
    const requestId = generateRequestId();

    // Attach request ID for tracing
    req.requestId = requestId;

    // Log request
    const requestLog = {
      type: 'REQUEST',
      requestId,
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    if (logBody && req.body && Object.keys(req.body).length > 0) {
      requestLog.body = sanitizeBody(req.body);
    }

    console.log(JSON.stringify(requestLog));

    // Capture response
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - startTime;

      const responseLog = {
        type: 'RESPONSE',
        requestId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      };

      console.log(JSON.stringify(responseLog));

      return originalSend.call(this, body);
    };

    next();
  };
};

/**
 * Generates a simple request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Sanitizes request body for logging (removes sensitive data)
 */
function sanitizeBody(body) {
  const sanitized = { ...body };
  
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Truncate large fields
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + '... [truncated]';
    }
  }

  return sanitized;
}

/**
 * Simple timing middleware for specific routes
 */
export const timing = (label) => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[TIMING] ${label}: ${duration}ms`);
    });

    next();
  };
};

