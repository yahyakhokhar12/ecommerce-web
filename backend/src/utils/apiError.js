export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, details = null, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.success = false;
    this.details = details;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}
