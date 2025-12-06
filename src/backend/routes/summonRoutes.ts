import { Router, Request, Response } from 'express'
import { spirit_registry } from '../services/SpiritRegistry.js'
import { asyncHandler, HauntError } from '../middleware/errorHandler.js'
import { SessionRequest, update_session } from '../middleware/sessionManager.js'
import { ApiResponse, CurseTemplate } from '../models/types.js'

const summon_router = Router()

/**
 * POST /api/summon/spirit
 * Initialize spirit summoning and create session
 * Validates spirit ID and loads curse template
 */
summon_router.post(
  '/spirit',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      const { spiritId } = req.body

      if (!spiritId || typeof spiritId !== 'string') {
        throw new HauntError(400, 'spiritId is required', 'MISSING_SPIRIT_ID')
      }

      // Check if spirit exists
      if (!spirit_registry.has_haunt_spirit(spiritId)) {
        throw new HauntError(404, `Spirit "${spiritId}" not found`, 'SPIRIT_NOT_FOUND')
      }

      // Get spirit and curse template
      const haunt_spirit = spirit_registry.get_haunt_spirit(spiritId)
      const spectral_curse = spirit_registry.get_spectral_curse(spiritId)

      if (!haunt_spirit) {
        throw new HauntError(500, 'Failed to load spirit', 'SPIRIT_LOAD_ERROR')
      }

      // Update session with spirit
      if (!req.sessionId) {
        throw new HauntError(500, 'Session not initialized', 'SESSION_ERROR')
      }

      const updated_session = update_session(req.sessionId, {
        spiritId,
      })

      if (!updated_session) {
        throw new HauntError(500, 'Failed to update session', 'SESSION_UPDATE_ERROR')
      }

      res.json({
        success: true,
        curse: {
          spirit: spiritId,
          mini_game: spectral_curse.mini_game.name,
        },
        data: {
          sessionId: req.sessionId,
          spirit: haunt_spirit,
          curse: spectral_curse,
          message: `${haunt_spirit.name} has been summoned!`,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * GET /api/summon/spirit/:spiritId
 * Get spirit details and curse template
 */
summon_router.get(
  '/spirit/:spiritId',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      const { spiritId } = req.params

      if (!spiritId) {
        throw new HauntError(400, 'spiritId is required', 'MISSING_SPIRIT_ID')
      }

      // Check if spirit exists
      if (!spirit_registry.has_haunt_spirit(spiritId)) {
        throw new HauntError(404, `Spirit "${spiritId}" not found`, 'SPIRIT_NOT_FOUND')
      }

      // Get spirit and curse template
      const haunt_spirit = spirit_registry.get_haunt_spirit(spiritId)
      const spectral_curse = spirit_registry.get_spectral_curse(spiritId)

      if (!haunt_spirit) {
        throw new HauntError(500, 'Failed to load spirit', 'SPIRIT_LOAD_ERROR')
      }

      res.json({
        success: true,
        curse: {
          spirit: spiritId,
        },
        data: {
          spirit: haunt_spirit,
          curse: spectral_curse,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * GET /api/summon/spirits
 * Get all available spirits
 */
summon_router.get(
  '/spirits',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      res.json({
        success: true,
        data: {
          spirits: all_spirits,
          count: all_spirits.length,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * POST /api/summon/validate
 * Validate spirit selection without updating session
 */
summon_router.post(
  '/validate',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { spiritId } = req.body

      if (!spiritId || typeof spiritId !== 'string') {
        throw new HauntError(400, 'spiritId is required', 'MISSING_SPIRIT_ID')
      }

      // Check if spirit exists
      if (!spirit_registry.has_haunt_spirit(spiritId)) {
        throw new HauntError(404, `Spirit "${spiritId}" not found`, 'SPIRIT_NOT_FOUND')
      }

      const haunt_spirit = spirit_registry.get_haunt_spirit(spiritId)
      const spectral_curse = spirit_registry.get_spectral_curse(spiritId)

      res.json({
        success: true,
        data: {
          isValid: true,
          spirit: haunt_spirit,
          curse: spectral_curse,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

export default summon_router
