import { Request, Response, NextFunction } from 'express'
import { ApiResponse } from '../models/types.js'

/**
 * Custom Error Class for HauntHub
 * Follows spooky naming: HauntError, CurseError
 */
export class HauntError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'HauntError'
  }
}

/**
 * Curse Error - for spirit/curse related errors
 */
export class CurseError extends HauntError {
  constructor(message: string, code?: string, details?: any) {
    super(400, message, code, details)
    this.name = 'CurseError'
  }
}

/**
 * Validation Error - for input validation failures
 */
export class ValidationError extends HauntError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

/**
 * Error Handler Middleware
 * Catches and formats all errors in a consistent way
 * Logs errors for debugging and monitoring
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error with context
  const error_context = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    name: err.name,
  }

  console.error('❌ HauntHub Error:', error_context)

  // Handle HauntError (custom error class)
  if (err instanceof HauntError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
    } as ApiResponse<null>)
  }

  // Handle ValidationError
  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.details,
    } as ApiResponse<null>)
  }

  // Handle CurseError
  if (err instanceof CurseError) {
    return res.status(400).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
    } as ApiResponse<null>)
  }

  // Handle file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large. Maximum size is 10MB.',
      code: 'FILE_TOO_LARGE',
    } as ApiResponse<null>)
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      error: 'Too many files uploaded',
      code: 'TOO_MANY_FILES',
    } as ApiResponse<null>)
  }

  // Handle multer errors
  if (err.name === 'MulterError') {
    const multer_error_map: Record<string, string> = {
      LIMIT_PART_COUNT: 'Too many parts',
      LIMIT_FILE_SIZE: 'File too large',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_FIELD_KEY: 'Field name too long',
      LIMIT_FIELD_VALUE: 'Field value too long',
      LIMIT_FIELD_COUNT: 'Too many fields',
      LIMIT_UNEXPECTED_FILE: 'Unexpected file field',
      MISSING_FIELD_NAME: 'Missing field name',
    }

    const error_message = multer_error_map[err.code] || err.message

    return res.status(400).json({
      success: false,
      error: `Upload error: ${error_message}`,
      code: err.code,
    } as ApiResponse<null>)
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'INVALID_JSON',
    } as ApiResponse<null>)
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
    return res.status(504).json({
      success: false,
      error: 'Request timeout. Please try again.',
      code: 'REQUEST_TIMEOUT',
    } as ApiResponse<null>)
  }

  // Handle network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      code: 'SERVICE_UNAVAILABLE',
    } as ApiResponse<null>)
  }

  // Default error response
  const statusCode = err.statusCode || 500
  const message = err.message || 'An unexpected error occurred. The curse is too strong!'

  res.status(statusCode).json({
    success: false,
    error: message,
    code: err.code || 'INTERNAL_ERROR',
  } as ApiResponse<null>)
}

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
