import { describe, it, expect } from 'vitest'
import { HauntError } from '../errorHandler.js'

describe('HauntError', () => {
  it('should create an error with status code and message', () => {
    const error = new HauntError(400, 'Bad request', 'BAD_REQUEST')

    expect(error.statusCode).toBe(400)
    expect(error.message).toBe('Bad request')
    expect(error.code).toBe('BAD_REQUEST')
    expect(error.name).toBe('HauntError')
  })

  it('should create an error without code', () => {
    const error = new HauntError(500, 'Internal error')

    expect(error.statusCode).toBe(500)
    expect(error.message).toBe('Internal error')
    expect(error.code).toBeUndefined()
  })

  it('should be an instance of Error', () => {
    const error = new HauntError(400, 'Test error')

    expect(error instanceof Error).toBe(true)
  })
})
