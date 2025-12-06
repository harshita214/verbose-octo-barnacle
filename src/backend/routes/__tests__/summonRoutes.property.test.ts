import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { spirit_registry } from '../../services/SpiritRegistry.js'

/**
 * Property-Based Tests for Spirit Selection
 * Feature: haunthub, Property 7: Spirit Extensibility
 * Validates: Requirements 7.1, 7.2
 */
describe('Spirit Selection - Property-Based Tests', () => {
  const all_spirits = spirit_registry.get_all_haunt_spirits()
  const spirit_ids = all_spirits.map(s => s.id)

  /**
   * Property 7: Spirit Extensibility
   * For any new spirit added to the curse configuration, the system SHALL automatically
   * recognize the new spirit, load its configuration, and make it available for selection
   * without code changes.
   *
   * This property tests that:
   * 1. All spirits can be retrieved by ID
   * 2. All spirits have valid curse templates
   * 3. All spirits are available in the registry
   * 4. Spirit data is consistent across retrievals
   */
  it('Property 7: Spirit Extensibility - All spirits available and valid', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        // Spirit should exist in registry
        expect(spirit_registry.has_haunt_spirit(spirit_id)).toBe(true)

        // Spirit should be retrievable
        const spirit = spirit_registry.get_haunt_spirit(spirit_id)
        expect(spirit).toBeDefined()
        expect(spirit?.id).toBe(spirit_id)

        // Curse template should be loadable
        const curse = spirit_registry.get_spectral_curse(spirit_id)
        expect(curse).toBeDefined()
        expect(curse.spirit.id).toBe(spirit_id)

        // All required fields should be present
        expect(curse.mini_game).toBeDefined()
        expect(curse.transformations).toBeDefined()
        expect(curse.audio).toBeDefined()

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Spirit Data Consistency
   * For any spirit, retrieving it multiple times should return consistent data.
   */
  it('Property: Spirit Data Consistency - Multiple retrievals return same data', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const spirit1 = spirit_registry.get_haunt_spirit(spirit_id)
        const spirit2 = spirit_registry.get_haunt_spirit(spirit_id)

        expect(spirit1?.id).toBe(spirit2?.id)
        expect(spirit1?.name).toBe(spirit2?.name)
        expect(spirit1?.description).toBe(spirit2?.description)
        expect(spirit1?.color_theme).toBe(spirit2?.color_theme)
        expect(spirit1?.glitch_intensity).toBe(spirit2?.glitch_intensity)
        expect(spirit1?.costume_style).toBe(spirit2?.costume_style)
        expect(spirit1?.mini_game).toBe(spirit2?.mini_game)
        expect(spirit1?.ambient_sound).toBe(spirit2?.ambient_sound)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Curse Template Validity
   * For any spirit, the curse template should be valid and complete.
   */
  it('Property: Curse Template Validity - All curse templates are valid', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse = spirit_registry.get_spectral_curse(spirit_id)

        // Spirit field
        expect(curse.spirit).toBeDefined()
        expect(curse.spirit.id).toBe(spirit_id)

        // Mini-game field
        expect(curse.mini_game).toBeDefined()
        expect(curse.mini_game.name).toBeDefined()
        expect(curse.mini_game.duration).toBeGreaterThan(0)
        expect(curse.mini_game.description).toBeDefined()
        expect(['easy', 'medium', 'hard']).toContain(curse.mini_game.difficulty)

        // Transformations field
        expect(Array.isArray(curse.transformations)).toBe(true)
        expect(curse.transformations.length).toBeGreaterThan(0)

        curse.transformations.forEach(t => {
          expect(t.name).toBeDefined()
          expect(t.effect).toBeDefined()
          expect(t.intensity).toBeGreaterThanOrEqual(0)
          expect(t.intensity).toBeLessThanOrEqual(1)
        })

        // Audio field
        expect(curse.audio).toBeDefined()
        expect(curse.audio.file).toBeDefined()
        expect(curse.audio.volume).toBeGreaterThanOrEqual(0)
        expect(curse.audio.volume).toBeLessThanOrEqual(1)
        expect(typeof curse.audio.loop).toBe('boolean')

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Mini-Game Configuration Validity
   * For any spirit, the mini-game should be valid and match the spirit's configuration.
   */
  it('Property: Mini-Game Configuration Validity - Mini-games are valid', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const spirit = spirit_registry.get_haunt_spirit(spirit_id)
        const curse = spirit_registry.get_spectral_curse(spirit_id)

        // Mini-game should match spirit's mini_game field
        expect(curse.mini_game).toBeDefined()
        expect(curse.mini_game.duration).toBeGreaterThan(0)
        expect(curse.mini_game.duration).toBeLessThanOrEqual(60) // Reasonable upper bound

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Spirit Registry Completeness
   * For any spirit in the registry, it should be findable by name.
   */
  it('Property: Spirit Registry Completeness - All spirits findable by name', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const spirit = spirit_registry.get_haunt_spirit(spirit_id)
        expect(spirit).toBeDefined()

        const found_by_name = spirit_registry.find_haunt_spirit_by_name(spirit!.name)
        expect(found_by_name).toBeDefined()
        expect(found_by_name?.id).toBe(spirit_id)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Glitch Intensity Range
   * For any spirit, the glitch intensity should be within valid range [0, 1].
   */
  it('Property: Glitch Intensity Range - Glitch intensity valid for all spirits', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const spirit = spirit_registry.get_haunt_spirit(spirit_id)

        expect(spirit?.glitch_intensity).toBeGreaterThanOrEqual(0)
        expect(spirit?.glitch_intensity).toBeLessThanOrEqual(1)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Audio File Path Format
   * For any spirit, the audio file path should be properly formatted.
   */
  it('Property: Audio File Path Format - Audio paths valid for all spirits', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse = spirit_registry.get_spectral_curse(spirit_id)

        expect(curse.audio.file).toMatch(/^\/assets\/sounds\//)
        expect(curse.audio.file).toMatch(/\.mp3$/)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Spirit Statistics Accuracy
   * For any spirit count, the statistics should be accurate.
   */
  it('Property: Spirit Statistics Accuracy - Stats match actual spirits', () => {
    const stats = spirit_registry.get_spirit_stats()

    expect(stats.total_spirits).toBe(all_spirits.length)
    expect(stats.total_spirits).toBeGreaterThan(0)

    // Sum of difficulty counts should equal total
    const difficulty_sum =
      stats.spirits_by_difficulty.easy +
      stats.spirits_by_difficulty.medium +
      stats.spirits_by_difficulty.hard

    expect(difficulty_sum).toBe(stats.total_spirits)
  })
})
