import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'
import { Spirit, CurseTemplate, MiniGameConfig, TransformationRule, AudioConfig } from '../models/types.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface CursesData {
  spirits: Spirit[]
  mini_games: Record<string, MiniGameConfig>
}

/**
 * CurseLoader Service
 * Loads and validates curse templates from JSON configuration
 * Follows spooky naming convention: curse_*
 */
export class CurseLoader {
  private curse_data: CursesData | null = null
  private curse_cache: Map<string, CurseTemplate> = new Map()
  private default_spirit_id = 'ghost'

  constructor() {
    this.load_curse_data()
  }

  /**
   * Load curse data from JSON file
   */
  private load_curse_data(): void {
    try {
      // Resolve from: src/backend/services -> ../../../../ -> home directory
      // Then navigate to .kiro/specs/haunthub/curses.json
      const home_dir = resolve(__dirname, '../../../../')
      const curse_file_path = resolve(home_dir, '.kiro/specs/haunthub/curses.json')
      const curse_json = readFileSync(curse_file_path, 'utf-8')
      this.curse_data = JSON.parse(curse_json)
      console.log(`✨ Curse data loaded: ${this.curse_data.spirits.length} spirits found`)
    } catch (error) {
      console.error('❌ Failed to load curse data:', error)
      this.curse_data = null
    }
  }

  /**
   * Load a curse template by spirit ID
   * Returns a complete CurseTemplate with all required fields
   */
  public load_curse_template(spirit_id: string): CurseTemplate {
    // Check cache first
    if (this.curse_cache.has(spirit_id)) {
      return this.curse_cache.get(spirit_id)!
    }

    // Validate curse data is loaded
    if (!this.curse_data) {
      console.error('⚠️ Curse data not loaded, using default spirit')
      return this.load_curse_template(this.default_spirit_id)
    }

    // Find spirit by ID
    const spirit = this.curse_data.spirits.find(s => s.id === spirit_id)
    if (!spirit) {
      console.warn(`⚠️ Spirit "${spirit_id}" not found, falling back to default`)
      return this.load_curse_template(this.default_spirit_id)
    }

    // Get mini-game config
    const mini_game = this.curse_data.mini_games[spirit.mini_game]
    if (!mini_game) {
      throw new Error(`Mini-game "${spirit.mini_game}" not found for spirit "${spirit_id}"`)
    }

    // Build transformation rules from spirit transformations
    const transformations: TransformationRule[] = spirit.transformations.map((effect, index) => ({
      name: effect,
      effect: effect,
      intensity: 0.5 + (index * 0.1), // Vary intensity
    }))

    // Build audio config
    const audio: AudioConfig = {
      file: `/assets/sounds/${spirit.ambient_sound}.mp3`,
      volume: 0.7,
      loop: true,
    }

    // Create curse template
    const curse_template: CurseTemplate = {
      spirit,
      mini_game,
      transformations,
      audio,
    }

    // Cache it
    this.curse_cache.set(spirit_id, curse_template)
    return curse_template
  }

  /**
   * Get all available spirits
   */
  public get_all_spirits(): Spirit[] {
    if (!this.curse_data) {
      console.error('⚠️ Curse data not loaded')
      return []
    }
    return this.curse_data.spirits
  }

  /**
   * Get all available mini-games
   */
  public get_all_mini_games(): Record<string, MiniGameConfig> {
    if (!this.curse_data) {
      console.error('⚠️ Curse data not loaded')
      return {}
    }
    return this.curse_data.mini_games
  }

  /**
   * Validate a curse template
   */
  public validate_curse_template(curse: CurseTemplate): boolean {
    try {
      // Check required fields
      if (!curse.spirit || !curse.spirit.id) {
        throw new Error('Missing spirit or spirit.id')
      }
      if (!curse.mini_game || !curse.mini_game.name) {
        throw new Error('Missing mini_game or mini_game.name')
      }
      if (!Array.isArray(curse.transformations)) {
        throw new Error('transformations must be an array')
      }
      if (!curse.audio || !curse.audio.file) {
        throw new Error('Missing audio or audio.file')
      }
      return true
    } catch (error) {
      console.error('❌ Curse template validation failed:', error)
      return false
    }
  }

  /**
   * Reload curse data (useful for hot-reloading during development)
   */
  public reload_curse_data(): void {
    this.curse_cache.clear()
    this.load_curse_data()
    console.log('🔄 Curse data reloaded')
  }
}

// Export singleton instance
export const curse_loader = new CurseLoader()
