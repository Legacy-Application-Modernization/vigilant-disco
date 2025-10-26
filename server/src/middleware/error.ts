import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

// Global error handler middleware
export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log the error
  console.error('API Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Default error response
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let errorCode = error.code || 'INTERNAL_SERVER_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    errorCode = 'INVALID_ID';
  } else if (error.message?.includes('Firebase')) {
    statusCode = 500;
    errorCode = 'FIREBASE_ERROR';
    message = 'Database operation failed';
  } else if (error.message?.includes('auth/')) {
    statusCode = 401;
    errorCode = 'AUTHENTICATION_ERROR';
    message = 'Authentication failed';
  }

  // Don't leak sensitive information in production
  if (process.env.NODE_ENV === 'production') {
    if (statusCode === 500) {
      message = 'Internal Server Error';
    }
  }

  const errorResponse: any = {
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString()
  };

  // Include error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: error.stack,
      originalMessage: error.message
    };
    
    if (error.details) {
      errorResponse.validationDetails = error.details;
    }
  }

  res.status(statusCode).json(errorResponse);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString()
  });
};

export default {
  errorHandler,
  notFoundHandler
};