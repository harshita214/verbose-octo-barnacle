import { Spirit, CurseTemplate } from '../models/types.js'
import { curse_loader } from './CurseLoader.js'

/**
 * SpiritRegistry Service
 * Manages available spirits and their configurations
 * Follows spooky naming convention: haunt_*, spectral_*
 */
export class SpiritRegistry {
  private haunt_spirits: Map<string, Spirit> = new Map()
  private spectral_cache: Map<string, CurseTemplate> = new Map()

  constructor() {
    this.initialize_spirits()
  }

  /**
   * Initialize all available spirits from curse loader
   */
  private initialize_spirits(): void {
    const all_spirits = curse_loader.get_all_spirits()
    all_spirits.forEach(spirit => {
      this.haunt_spirits.set(spirit.id, spirit)
    })
    console.log(`👻 SpiritRegistry initialized with ${this.haunt_spirits.size} spirits`)
  }

  /**
   * Get a spirit by ID
   */
  public get_haunt_spirit(spirit_id: string): Spirit | null {
    return this.haunt_spirits.get(spirit_id) || null
  }

  /**
   * Get all available spirits
   */
  public get_all_haunt_spirits(): Spirit[] {
    return Array.from(this.haunt_spirits.values())
  }

  /**
   * Get a spirit's curse template
   */
  public get_spectral_curse(spirit_id: string): CurseTemplate {
    // Load from curse loader (always fresh to ensure different references after cache clear)
    const curse_template = curse_loader.load_curse_template(spirit_id)

    // Validate
    if (!curse_loader.validate_curse_template(curse_template)) {
      throw new Error(`Invalid curse template for spirit "${spirit_id}"`)
    }

    return curse_template
  }

  /**
   * Check if a spirit exists
   */
  public has_haunt_spirit(spirit_id: string): boolean {
    return this.haunt_spirits.has(spirit_id)
  }

  /**
   * Get spirit by name (case-insensitive)
   */
  public find_haunt_spirit_by_name(name: string): Spirit | null {
    const lower_name = name.toLowerCase()
    for (const spirit of this.haunt_spirits.values()) {
      if (spirit.name.toLowerCase() === lower_name) {
        return spirit
      }
    }
    return null
  }

  /**
   * Get all spirits with a specific mini-game
   */
  public get_spirits_by_mini_game(mini_game_id: string): Spirit[] {
    return Array.from(this.haunt_spirits.values()).filter(
      spirit => spirit.mini_game === mini_game_id
    )
  }

  /**
   * Register a new spirit (for dynamic spirit addition)
   */
  public register_haunt_spirit(spirit: Spirit): void {
    if (this.haunt_spirits.has(spirit.id)) {
      console.warn(`⚠️ Spirit "${spirit.id}" already registered, overwriting`)
    }
    this.haunt_spirits.set(spirit.id, spirit)
    this.spectral_cache.delete(spirit.id) // Invalidate cache
    console.log(`✨ Spirit "${spirit.id}" registered`)
  }

  /**
   * Unregister a spirit
   */
  public unregister_haunt_spirit(spirit_id: string): boolean {
    const removed = this.haunt_spirits.delete(spirit_id)
    this.spectral_cache.delete(spirit_id)
    if (removed) {
      console.log(`🗑️ Spirit "${spirit_id}" unregistered`)
    }
    return removed
  }

  /**
   * Get spirit statistics
   */
  public get_spirit_stats(): {
    total_spirits: number
    spirits_by_difficulty: Record<string, number>
    mini_games_count: number
  } {
    const spirits = this.get_all_haunt_spirits()
    const mini_games = new Set(spirits.map(s => s.mini_game))

    const spirits_by_difficulty: Record<string, number> = {
      easy: 0,
      medium: 0,
      hard: 0,
    }

    spirits.forEach(spirit => {
      const curse = this.get_spectral_curse(spirit.id)
      const difficulty = curse.mini_game.difficulty
      if (difficulty in spirits_by_difficulty) {
        spirits_by_difficulty[difficulty]++
      }
    })

    return {
      total_spirits: spirits.length,
      spirits_by_difficulty,
      mini_games_count: mini_games.size,
    }
  }

  /**
   * Clear all caches (useful for development/testing)
   */
  public clear_spectral_cache(): void {
    this.spectral_cache.clear()
    console.log('🔄 Spectral cache cleared')
  }
}

// Export singleton instance
export const spirit_registry = new SpiritRegistry()
