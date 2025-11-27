import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { ApiResponse } from '../types';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Detect database connection errors and convert to 503
  let retryAfter: number | undefined;
  if (
    err.message.includes('ECONNREFUSED') ||
    err.message.includes('ETIMEDOUT') ||
    err.message.includes('database') ||
    err.message.includes('connection') ||
    err.message.includes('Connection lost') ||
    (err as any).code === 'ECONNREFUSED' ||
    (err as any).code === 'ETIMEDOUT' ||
    (err as any).code === 'PROTOCOL_CONNECTION_LOST' ||
    (err as any).code === 'PROTOCOL_ENQUEUE_AFTER_QUIT'
  ) {
    statusCode = 503;
    message = 'Service temporarily unavailable. Database connection failed.';
    retryAfter = 30; // Retry after 30 seconds
    logger.error('Database connection error detected, returning 503:', {
      error: err.message,
      code: (err as any).code,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode,
    code: (err as any).code,
  });

  // Handle specific error types
  if (err.name === 'ValidationError' || err.message.includes('validation')) {
    statusCode = 422;
  } else if (err.name === 'UnauthorizedError' || err.message.includes('unauthorized')) {
    statusCode = 401;
  } else if (err.name === 'ForbiddenError' || err.message.includes('forbidden')) {
    statusCode = 403;
  } else if (err.message.includes('not found') || err.message.includes('does not exist')) {
    statusCode = 404;
  } else if (err.message.includes('already exists') || err.message.includes('duplicate')) {
    statusCode = 409;
  }

  // Add Retry-After header for 503 errors (SEO best practice)
  if (statusCode === 503 && retryAfter) {
    res.setHeader('Retry-After', retryAfter.toString());
  }

  // Send error response
  const response: ApiResponse<null> = {
    success: false,
    error: message,
    message,
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = err.stack || message;
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found Handler
 * Returns SEO-friendly HTML for browser requests, JSON for API requests
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  // Check if it's an API request
  if (req.path.startsWith('/api/')) {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
    return;
  }

  // For non-API requests, return SEO-friendly HTML
  // This allows search engines to understand the 404 status
  // while providing a better user experience
  res.status(404).send(`
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>404 - Sayfa Bulunamadı</title>
      <meta name="robots" content="noindex, nofollow">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #333;
        }
        .container {
          background: white;
          border-radius: 20px;
          padding: 60px 40px;
          max-width: 600px;
          width: 100%;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { font-size: 120px; color: #667eea; margin-bottom: 20px; font-weight: 700; }
        h2 { font-size: 32px; margin-bottom: 15px; color: #333; }
        p { font-size: 18px; color: #666; margin-bottom: 30px; line-height: 1.6; }
        .links { display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; }
        a {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.3s;
        }
        a:hover { background: #5568d3; }
        a.secondary {
          background: #e0e0e0;
          color: #333;
        }
        a.secondary:hover { background: #d0d0d0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>404</h1>
        <h2>Sayfa Bulunamadı</h2>
        <p>Aradığınız sayfa taşınmış, kaldırılmış veya hiç var olmamış olabilir.</p>
        <div class="links">
          <a href="/">Ana Sayfa</a>
          <a href="/blog" class="secondary">Blog</a>
          <a href="/gear" class="secondary">Ekipmanlar</a>
          <a href="/about" class="secondary">Hakkımızda</a>
        </div>
      </div>
    </body>
    </html>
  `);
};

/**
 * Async Error Handler Wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


