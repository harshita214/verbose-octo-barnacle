import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { GameSession } from '../models/types.js'

/**
 * Session Manager Middleware
 * Manages game sessions for each player
 */

// In-memory session store (in production, use Redis or database)
const session_store = new Map<string, GameSession>()

/**
 * Session storage interface
 */
export interface SessionRequest extends Request {
  sessionId?: string
  gameSession?: GameSession
}

/**
 * Initialize or retrieve session
 */
export const sessionManager = (req: SessionRequest, res: Response, next: NextFunction) => {
  try {
    // Get session ID from cookie or create new one
    let session_id = req.cookies?.sessionId || req.headers['x-session-id'] as string

    if (!session_id) {
      session_id = uuidv4()
      res.cookie('sessionId', session_id, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      })
    }

    req.sessionId = session_id

    // Get or create session
    if (!session_store.has(session_id)) {
      const new_session: GameSession = {
        sessionId: session_id,
        spiritId: '',
        uploadedImage: Buffer.alloc(0),
        gameCompleted: false,
        createdAt: new Date(),
      }
      session_store.set(session_id, new_session)
    }

    req.gameSession = session_store.get(session_id)!

    next()
  } catch (error) {
    console.error('Session manager error:', error)
    next(error)
  }
}

/**
 * Get session by ID
 */
export const get_session = (session_id: string): GameSession | null => {
  return session_store.get(session_id) || null
}

/**
 * Update session
 */
export const update_session = (session_id: string, updates: Partial<GameSession>): GameSession | null => {
  const session = session_store.get(session_id)
  if (!session) return null

  const updated_session = { ...session, ...updates }
  session_store.set(session_id, updated_session)
  return updated_session
}

/**
 * Delete session
 */
export const delete_session = (session_id: string): boolean => {
  return session_store.delete(session_id)
}

/**
 * Clear all sessions (for testing)
 */
export const clear_all_sessions = (): void => {
  session_store.clear()
}

/**
 * Get session statistics
 */
export const get_session_stats = () => {
  const total_sessions = session_store.size
  const completed_games = Array.from(session_store.values()).filter(s => s.gameCompleted).length

  return {
    total_sessions,
    completed_games,
    active_sessions: total_sessions - completed_games,
  }
}
