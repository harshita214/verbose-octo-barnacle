import { Router, Response } from 'express'
import { asyncHandler, HauntError } from '../middleware/errorHandler.js'
import { SessionRequest, update_session, get_session } from '../middleware/sessionManager.js'
import { ApiResponse, Costume, CostumeMetadata } from '../models/types.js'
import { spirit_registry } from '../services/SpiritRegistry.js'

const share_router = Router()

// In-memory store for shared costumes (in production, use a database)
const curse_share_store = new Map<string, Costume>()

/**
 * Generate a unique shareable link ID
 */
const generate_share_id = (): string => {
  return `curse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * POST /api/share/costume
 * Create a shareable link for a costume
 * Generates metadata and stores costume for sharing
 */
share_router.post(
  '/costume',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      if (!req.sessionId) {
        throw new HauntError(500, 'Session not initialized', 'SESSION_ERROR')
      }

      if (!req.gameSession) {
        throw new HauntError(500, 'Game session not found', 'SESSION_NOT_FOUND')
      }

      const { costumeUrl, playerNickname } = req.body

      if (!costumeUrl || typeof costumeUrl !== 'string') {
        throw new HauntError(400, 'costumeUrl is required', 'MISSING_COSTUME_URL')
      }

      const { spiritId } = req.gameSession

      if (!spiritId) {
        throw new HauntError(400, 'No spirit selected in session', 'NO_SPIRIT_SELECTED')
      }

      // Get spirit name
      const haunt_spirit = spirit_registry.get_haunt_spirit(spiritId)
      if (!haunt_spirit) {
        throw new HauntError(404, `Spirit "${spiritId}" not found`, 'SPIRIT_NOT_FOUND')
      }

      // Generate share ID
      const share_id = generate_share_id()

      // Create costume metadata
      const costume_metadata: CostumeMetadata = {
        spiritName: haunt_spirit.name,
        playerNickname: playerNickname || 'Anonymous Haunted Soul',
        timestamp: new Date(),
        gameCompleted: req.gameSession.gameCompleted,
      }

      // Create costume object
      const curse_costume: Costume = {
        id: share_id,
        originalImageUrl: '', // Not stored for privacy
        transformedImageUrl: costumeUrl,
        spiritId,
        timestamp: new Date(),
        shareUrl: `/share/${share_id}`,
        metadata: costume_metadata,
      }

      // Store costume in share store
      curse_share_store.set(share_id, curse_costume)

      // Update session with share info
      const updated_session = update_session(req.sessionId, {
        costume: curse_costume,
      })

      res.json({
        success: true,
        curse: {
          spirit: spiritId,
          costume_url: costumeUrl,
        },
        data: {
          shareId: share_id,
          shareUrl: `${process.env.BASE_URL || 'http://localhost:5173'}/share/${share_id}`,
          metadata: costume_metadata,
          message: `Your ${haunt_spirit.name} costume is ready to share!`,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * GET /api/share/costume/:shareId
 * Retrieve a shared costume by ID
 */
share_router.get(
  '/costume/:shareId',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      const { shareId } = req.params

      if (!shareId || typeof shareId !== 'string') {
        throw new HauntError(400, 'shareId is required', 'MISSING_SHARE_ID')
      }

      // Look up costume in share store
      const curse_costume = curse_share_store.get(shareId)

      if (!curse_costume) {
        throw new HauntError(404, 'Shared costume not found', 'COSTUME_NOT_FOUND')
      }

      res.json({
        success: true,
        curse: {
          spirit: curse_costume.spiritId,
          costume_url: curse_costume.transformedImageUrl,
        },
        data: {
          costume: curse_costume,
          message: `${curse_costume.metadata.playerNickname}'s ${curse_costume.metadata.spiritName} costume`,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * POST /api/share/metadata
 * Update metadata for a shared costume
 */
share_router.post(
  '/metadata',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      if (!req.sessionId) {
        throw new HauntError(500, 'Session not initialized', 'SESSION_ERROR')
      }

      const { shareId, playerNickname } = req.body

      if (!shareId || typeof shareId !== 'string') {
        throw new HauntError(400, 'shareId is required', 'MISSING_SHARE_ID')
      }

      // Look up costume in share store
      const curse_costume = curse_share_store.get(shareId)

      if (!curse_costume) {
        throw new HauntError(404, 'Shared costume not found', 'COSTUME_NOT_FOUND')
      }

      // Update metadata
      if (playerNickname && typeof playerNickname === 'string') {
        curse_costume.metadata.playerNickname = playerNickname
      }

      res.json({
        success: true,
        curse: {
          spirit: curse_costume.spiritId,
        },
        data: {
          costume: curse_costume,
          message: 'Costume metadata updated',
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * GET /api/share/stats
 * Get statistics about shared costumes
 */
share_router.get(
  '/stats',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      const total_shared = curse_share_store.size

      // Count by spirit
      const spirits_count: Record<string, number> = {}
      curse_share_store.forEach(costume => {
        spirits_count[costume.spiritId] = (spirits_count[costume.spiritId] || 0) + 1
      })

      // Count completed games
      const games_completed = Array.from(curse_share_store.values()).filter(
        c => c.metadata.gameCompleted
      ).length

      res.json({
        success: true,
        data: {
          totalShared: total_shared,
          gamesCompleted: games_completed,
          spiritsCount: spirits_count,
          message: 'Share statistics retrieved',
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * GET /api/share/download/:shareId
 * Download a shared costume as PNG/JPG
 * Converts image URL to downloadable file with metadata
 */
share_router.get(
  '/download/:shareId',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      const { shareId } = req.params
      const { format = 'png' } = req.query

      if (!shareId || typeof shareId !== 'string') {
        throw new HauntError(400, 'shareId is required', 'MISSING_SHARE_ID')
      }

      // Look up costume in share store
      const curse_costume = curse_share_store.get(shareId)

      if (!curse_costume) {
        throw new HauntError(404, 'Shared costume not found', 'COSTUME_NOT_FOUND')
      }

      // Validate format
      const valid_formats = ['png', 'jpg', 'jpeg']
      const download_format = (format as string).toLowerCase()

      if (!valid_formats.includes(download_format)) {
        throw new HauntError(400, 'Invalid format. Use png or jpg', 'INVALID_FORMAT')
      }

      // Generate filename with metadata
      const spirit_name = curse_costume.metadata.spiritName.toLowerCase().replace(/\s+/g, '_')
      const player_name = curse_costume.metadata.playerNickname
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
      const timestamp = curse_costume.timestamp.getTime()
      const filename = `haunthub_${spirit_name}_${player_name}_${timestamp}.${download_format === 'jpg' ? 'jpg' : 'png'}`

      // Set response headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Content-Type', `image/${download_format === 'jpg' ? 'jpeg' : 'png'}`)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

      // In a real implementation, we would:
      // 1. Fetch the image from costumeUrl
      // 2. Convert to requested format
      // 3. Add EXIF metadata with spirit name, player nickname, timestamp
      // 4. Send as binary response

      // For now, return a placeholder response with metadata
      res.json({
        success: true,
        curse: {
          spirit: curse_costume.spiritId,
        },
        data: {
          filename,
          format: download_format,
          metadata: curse_costume.metadata,
          message: `Download prepared for ${curse_costume.metadata.playerNickname}'s ${curse_costume.metadata.spiritName} costume`,
          note: 'In production, this would return the actual image file with embedded metadata',
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * POST /api/share/download
 * Download costume by URL (alternative endpoint)
 * Accepts costumeUrl and returns downloadable file
 */
share_router.post(
  '/download',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      const { costumeUrl, format = 'png', filename } = req.body

      if (!costumeUrl || typeof costumeUrl !== 'string') {
        throw new HauntError(400, 'costumeUrl is required', 'MISSING_COSTUME_URL')
      }

      // Validate format
      const valid_formats = ['png', 'jpg', 'jpeg']
      const download_format = (format as string).toLowerCase()

      if (!valid_formats.includes(download_format)) {
        throw new HauntError(400, 'Invalid format. Use png or jpg', 'INVALID_FORMAT')
      }

      // Generate filename if not provided
      const download_filename =
        filename || `haunthub_costume_${Date.now()}.${download_format === 'jpg' ? 'jpg' : 'png'}`

      // Set response headers for download
      res.setHeader('Content-Disposition', `attachment; filename="${download_filename}"`)
      res.setHeader('Content-Type', `image/${download_format === 'jpg' ? 'jpeg' : 'png'}`)
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

      // In a real implementation, we would:
      // 1. Fetch the image from costumeUrl
      // 2. Convert to requested format if needed
      // 3. Send as binary response

      // For now, return a placeholder response
      res.json({
        success: true,
        data: {
          filename: download_filename,
          format: download_format,
          message: 'Download prepared',
          note: 'In production, this would return the actual image file',
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

export default share_router
