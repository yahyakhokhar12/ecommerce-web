import { ApiError } from '../utils/apiError.js';
import { logger } from '../utils/logger.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
};

export const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(404, `Resource not found with id: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ApiError(400, `Duplicate field value: ${field}`);
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, messages.join(', '));
  }

  // JWT
  if (err.name === 'JsonWebTokenError') error = new ApiError(401, 'Invalid token');
  if (err.name === 'TokenExpiredError') error = new ApiError(401, 'Token expired');

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
