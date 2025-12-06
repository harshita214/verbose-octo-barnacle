import { Request, Response, NextFunction } from 'express'

/**
 * Request Logger Middleware
 * Logs all incoming requests with timestamps and response times
 */
export const request_logger = (req: Request, res: Response, next: NextFunction) => {
  const start_time = Date.now()
  const request_id = Math.random().toString(36).substring(7)

  // Log request
  console.log(`📨 [${request_id}] ${req.method} ${req.path}`)

  // Capture response
  const original_send = res.send
  res.send = function (data: any) {
    const duration = Date.now() - start_time
    const status_code = res.statusCode

    // Color code based on status
    let status_emoji = '✅'
    if (status_code >= 400 && status_code < 500) {
      status_emoji = '⚠️'
    } else if (status_code >= 500) {
      status_emoji = '❌'
    }

    console.log(`${status_emoji} [${request_id}] ${status_code} ${duration}ms`)

    return original_send.call(this, data)
  }

  next()
}

/**
 * Request ID Middleware
 * Adds a unique request ID to each request
 */
export const request_id_middleware = (req: Request, res: Response, next: NextFunction) => {
  const request_id = req.headers['x-request-id'] || Math.random().toString(36).substring(7)
  res.setHeader('X-Request-ID', request_id)
  next()
}
