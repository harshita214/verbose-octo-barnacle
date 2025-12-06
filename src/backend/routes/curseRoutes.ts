import { Router, Request, Response } from 'express'
import { spirit_registry } from '../services/SpiritRegistry.js'
import { curse_loader } from '../services/CurseLoader.js'
import { ApiResponse, CurseTemplate } from '../models/types.js'

const curse_router = Router()

/**
 * GET /api/curse/load
 * Load a curse template by spirit ID
 * Returns a complete CurseTemplate with all required fields
 */
curse_router.get('/load', (req: Request, res: Response) => {
  try {
    const { spiritId } = req.query

    if (!spiritId || typeof spiritId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'spiritId query parameter is required',
      } as ApiResponse<null>)
    }

    // Check if spirit exists
    if (!spirit_registry.has_haunt_spirit(spiritId)) {
      return res.status(404).json({
        success: false,
        error: `Spirit "${spiritId}" not found`,
      } as ApiResponse<null>)
    }

    // Load curse template
    const curse_template = spirit_registry.get_spectral_curse(spiritId)

    // Validate
    if (!curse_loader.validate_curse_template(curse_template)) {
      return res.status(500).json({
        success: false,
        error: 'Invalid curse template',
      } as ApiResponse<null>)
    }

    res.json({
      success: true,
      curse: {
        spirit: curse_template.spirit.id,
        mini_game: curse_template.mini_game.name,
      },
      data: curse_template,
    } as ApiResponse<CurseTemplate>)
  } catch (error) {
    console.error('Error loading curse:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to load curse template',
    } as ApiResponse<null>)
  }
})

/**
 * GET /api/curse/list
 * Get all available spirits and their curse templates
 */
curse_router.get('/list', (req: Request, res: Response) => {
  try {
    const all_spirits = spirit_registry.get_all_haunt_spirits()
    const curse_list = all_spirits.map(spirit => ({
      id: spirit.id,
      name: spirit.name,
      description: spirit.description,
      mini_game: spirit.mini_game,
      color_theme: spirit.color_theme,
    }))

    res.json({
      success: true,
      data: curse_list,
    } as ApiResponse<typeof curse_list>)
  } catch (error) {
    console.error('Error listing curses:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to list curses',
    } as ApiResponse<null>)
  }
})

/**
 * GET /api/curse/stats
 * Get spirit statistics
 */
curse_router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = spirit_registry.get_spirit_stats()
    res.json({
      success: true,
      data: stats,
    } as ApiResponse<typeof stats>)
  } catch (error) {
    console.error('Error getting stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get stats',
    } as ApiResponse<null>)
  }
})

/**
 * GET /api/curse/validate
 * Validate a curse template (for testing)
 */
curse_router.get('/validate', (req: Request, res: Response) => {
  try {
    const { spiritId } = req.query

    if (!spiritId || typeof spiritId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'spiritId query parameter is required',
      } as ApiResponse<null>)
    }

    const curse_template = spirit_registry.get_spectral_curse(spiritId)
    const is_valid = curse_loader.validate_curse_template(curse_template)

    res.json({
      success: true,
      data: {
        spiritId,
        isValid: is_valid,
        curse: curse_template,
      },
    } as ApiResponse<any>)
  } catch (error) {
    console.error('Error validating curse:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to validate curse',
    } as ApiResponse<null>)
  }
})

export default curse_router
