import { Router, Response } from 'express'
import { upload_handler, validate_uploaded_file, get_file_info } from '../middleware/uploadHandler.js'
import { asyncHandler, HauntError } from '../middleware/errorHandler.js'
import { SessionRequest, update_session } from '../middleware/sessionManager.js'
import { ApiResponse } from '../models/types.js'
import { costume_generator } from '../services/CostumeGenerator.js'
import { spirit_registry } from '../services/SpiritRegistry.js'

// Extend SessionRequest to include multer file property
interface FileSessionRequest extends SessionRequest {
  file?: {
    fieldname: string
    originalname: string
    encoding: string
    mimetype: string
    size: number
    buffer: Buffer
  }
}

const haunt_router = Router()

/**
 * POST /api/haunt/upload
 * Upload an image file for costume generation
 * Validates file type and size
 * Stores image in session
 */
haunt_router.post(
  '/upload',
  upload_handler.single('image'),
  asyncHandler(async (req: FileSessionRequest, res: Response) => {
    try {
      // Validate file was uploaded
      if (!req.file) {
        throw new HauntError(400, 'No image file provided', 'NO_FILE_UPLOADED')
      }

      // Validate uploaded file
      validate_uploaded_file(req.file)

      // Get file info
      const file_info = get_file_info(req.file)

      // Store image in session
      if (!req.sessionId) {
        throw new HauntError(500, 'Session not initialized', 'SESSION_ERROR')
      }

      update_session(req.sessionId, {
        uploadedImage: req.file.buffer,
      })

      res.json({
        success: true,
        curse: {
          spirit: 'upload_complete',
        },
        data: {
          sessionId: req.sessionId,
          file: file_info,
          message: 'Image uploaded successfully. Ready to summon a spirit!',
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * GET /api/haunt/session
 * Get current session information
 */
haunt_router.get('/session', (req: SessionRequest, res: Response) => {
  try {
    if (!req.gameSession) {
      throw new HauntError(500, 'Session not found', 'SESSION_NOT_FOUND')
    }

    res.json({
      success: true,
      data: {
        sessionId: req.sessionId,
        spiritId: req.gameSession.spiritId,
        hasImage: req.gameSession.uploadedImage.length > 0,
        gameCompleted: req.gameSession.gameCompleted,
        createdAt: req.gameSession.createdAt,
      },
    } as ApiResponse<any>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
    } as ApiResponse<null>)
  }
})

/**
 * POST /api/haunt/validate-image
 * Validate an image without uploading
 * Useful for client-side validation
 */
haunt_router.post(
  '/validate-image',
  upload_handler.single('image'),
  asyncHandler(async (req: FileSessionRequest, res: Response) => {
    try {
      if (!req.file) {
        throw new HauntError(400, 'No image file provided', 'NO_FILE_UPLOADED')
      }

      validate_uploaded_file(req.file)
      const file_info = get_file_info(req.file)

      res.json({
        success: true,
        data: {
          isValid: true,
          file: file_info,
          message: 'Image is valid and ready for costume generation',
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

/**
 * DELETE /api/haunt/session
 * Clear current session
 */
haunt_router.delete('/session', (req: SessionRequest, res: Response) => {
  try {
    if (!req.sessionId) {
      throw new HauntError(400, 'No session to delete', 'NO_SESSION')
    }

    // Clear session by resetting it
    update_session(req.sessionId, {
      spiritId: '',
      uploadedImage: Buffer.alloc(0),
      gameCompleted: false,
      createdAt: new Date(),
    })

    res.json({
      success: true,
      data: {
        message: 'Session cleared',
      },
    } as ApiResponse<any>)
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear session',
    } as ApiResponse<null>)
  }
})

/**
 * POST /api/haunt/costume
 * Generate AI costume from uploaded image
 */
haunt_router.post(
  '/costume',
  asyncHandler(async (req: SessionRequest, res: Response) => {
    try {
      if (!req.sessionId) {
        throw new HauntError(500, 'Session not initialized', 'SESSION_ERROR')
      }

      if (!req.gameSession) {
        throw new HauntError(500, 'Game session not found', 'SESSION_NOT_FOUND')
      }

      const { spiritId } = req.body

      if (!spiritId || typeof spiritId !== 'string') {
        throw new HauntError(400, 'spiritId is required', 'MISSING_SPIRIT_ID')
      }

      // Check if spirit exists
      if (!spirit_registry.has_haunt_spirit(spiritId)) {
        throw new HauntError(404, `Spirit "${spiritId}" not found`, 'SPIRIT_NOT_FOUND')
      }

      // Check if image is uploaded
      if (!req.gameSession.uploadedImage || req.gameSession.uploadedImage.length === 0) {
        throw new HauntError(400, 'No image uploaded', 'NO_IMAGE_UPLOADED')
      }

      // Get spirit and curse template
      const haunt_spirit = spirit_registry.get_haunt_spirit(spiritId)
      const spectral_curse = spirit_registry.get_spectral_curse(spiritId)

      if (!haunt_spirit) {
        throw new HauntError(500, 'Failed to load spirit', 'SPIRIT_LOAD_ERROR')
      }

      // Generate costume
      let costume_url: string
      try {
        costume_url = await costume_generator.generate_costume(req.gameSession.uploadedImage, {
          spiritId,
          transformations: spectral_curse.transformations.map(t => t.name),
          intensity: haunt_spirit.glitch_intensity,
        })
      } catch (error) {
        console.error('Costume generation failed, using fallback:', error)
        // Use fallback costume on error
        costume_url = await costume_generator.generate_fallback_costume(spiritId)
      }

      // Update session with costume
      update_session(req.sessionId, {
        spiritId,
      })

      res.json({
        success: true,
        curse: {
          spirit: spiritId,
          costume_url,
          mini_game: spectral_curse.mini_game.name,
        },
        data: {
          sessionId: req.sessionId,
          costumeUrl: costume_url,
          spirit: haunt_spirit,
          miniGame: spectral_curse.mini_game,
          message: `Your ${haunt_spirit.name} costume is ready!`,
        },
      } as ApiResponse<any>)
    } catch (error) {
      throw error
    }
  })
)

export default haunt_router
