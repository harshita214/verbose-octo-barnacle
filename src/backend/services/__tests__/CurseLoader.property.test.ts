import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { CurseLoader } from '../CurseLoader.js'
import { CurseTemplate } from '../../models/types.js'

/**
 * Property-Based Tests for CurseLoader
 * Feature: haunthub, Property 2: Spirit Configuration Loading
 * Validates: Requirements 7.1, 7.2
 */
describe('CurseLoader - Property-Based Tests', () => {
  const curse_loader = new CurseLoader()
  const all_spirits = curse_loader.get_all_spirits()
  const spirit_ids = all_spirits.map(s => s.id)

  /**
   * Property 2: Spirit Configuration Loading
   * For any spirit ID, loading the curse template SHALL return a valid, complete CurseTemplate object
   * with all required fields (spirit, mini_game, transformations, audio).
   *
   * This property tests that:
   * 1. Every spirit ID can be loaded
   * 2. The returned curse template has all required fields
   * 3. All fields are properly populated (not null/undefined)
   * 4. The curse template is valid according to validation rules
   */
  it('Property 2: Spirit Configuration Loading - All spirits load with complete templates', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        // Load curse template
        const curse_template = curse_loader.load_curse_template(spirit_id)

        // Validate curse template exists
        expect(curse_template).toBeDefined()

        // Validate spirit field
        expect(curse_template.spirit).toBeDefined()
        expect(curse_template.spirit.id).toBeDefined()
        expect(curse_template.spirit.name).toBeDefined()
        expect(curse_template.spirit.description).toBeDefined()
        expect(curse_template.spirit.color_theme).toBeDefined()
        expect(curse_template.spirit.glitch_intensity).toBeDefined()
        expect(curse_template.spirit.costume_style).toBeDefined()
        expect(curse_template.spirit.mini_game).toBeDefined()
        expect(curse_template.spirit.ambient_sound).toBeDefined()
        expect(curse_template.spirit.transformations).toBeDefined()

        // Validate mini_game field
        expect(curse_template.mini_game).toBeDefined()
        expect(curse_template.mini_game.name).toBeDefined()
        expect(curse_template.mini_game.duration).toBeGreaterThan(0)
        expect(curse_template.mini_game.description).toBeDefined()
        expect(['easy', 'medium', 'hard']).toContain(curse_template.mini_game.difficulty)

        // Validate transformations field
        expect(curse_template.transformations).toBeDefined()
        expect(Array.isArray(curse_template.transformations)).toBe(true)
        expect(curse_template.transformations.length).toBeGreaterThan(0)

        curse_template.transformations.forEach(transformation => {
          expect(transformation.name).toBeDefined()
          expect(transformation.effect).toBeDefined()
          expect(transformation.intensity).toBeGreaterThanOrEqual(0)
          expect(transformation.intensity).toBeLessThanOrEqual(1)
        })

        // Validate audio field
        expect(curse_template.audio).toBeDefined()
        expect(curse_template.audio.file).toBeDefined()
        expect(curse_template.audio.volume).toBeGreaterThanOrEqual(0)
        expect(curse_template.audio.volume).toBeLessThanOrEqual(1)
        expect(typeof curse_template.audio.loop).toBe('boolean')

        // Validate the entire curse template
        const is_valid = curse_loader.validate_curse_template(curse_template)
        expect(is_valid).toBe(true)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Curse Template Consistency
   * For any spirit ID, loading the same spirit multiple times should return
   * equivalent curse templates (due to caching).
   */
  it('Property: Curse Template Consistency - Multiple loads return equivalent templates', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse1 = curse_loader.load_curse_template(spirit_id)
        const curse2 = curse_loader.load_curse_template(spirit_id)

        // Should be the same reference (cached)
        expect(curse1).toBe(curse2)

        // Should have identical data
        expect(curse1.spirit.id).toBe(curse2.spirit.id)
        expect(curse1.mini_game.name).toBe(curse2.mini_game.name)
        expect(curse1.transformations.length).toBe(curse2.transformations.length)
        expect(curse1.audio.file).toBe(curse2.audio.file)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Spirit Field Integrity
   * For any spirit, the curse template's spirit field should match the original spirit data.
   */
  it('Property: Spirit Field Integrity - Curse template spirit matches source spirit', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse_template = curse_loader.load_curse_template(spirit_id)
        const original_spirit = curse_loader.get_all_spirits().find(s => s.id === spirit_id)

        expect(original_spirit).toBeDefined()
        expect(curse_template.spirit.id).toBe(original_spirit!.id)
        expect(curse_template.spirit.name).toBe(original_spirit!.name)
        expect(curse_template.spirit.description).toBe(original_spirit!.description)
        expect(curse_template.spirit.color_theme).toBe(original_spirit!.color_theme)
        expect(curse_template.spirit.glitch_intensity).toBe(original_spirit!.glitch_intensity)
        expect(curse_template.spirit.costume_style).toBe(original_spirit!.costume_style)
        expect(curse_template.spirit.mini_game).toBe(original_spirit!.mini_game)
        expect(curse_template.spirit.ambient_sound).toBe(original_spirit!.ambient_sound)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Mini-Game Configuration Validity
   * For any spirit, the mini-game configuration should be valid and match the spirit's mini_game field.
   */
  it('Property: Mini-Game Configuration Validity - Mini-game config is valid for spirit', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse_template = curse_loader.load_curse_template(spirit_id)
        const all_mini_games = curse_loader.get_all_mini_games()

        // Mini-game should exist in the registry
        expect(all_mini_games[curse_template.spirit.mini_game]).toBeDefined()

        // Mini-game config should match the registry
        const registered_game = all_mini_games[curse_template.spirit.mini_game]
        expect(curse_template.mini_game.name).toBe(registered_game.name)
        expect(curse_template.mini_game.duration).toBe(registered_game.duration)
        expect(curse_template.mini_game.description).toBe(registered_game.description)
        expect(curse_template.mini_game.difficulty).toBe(registered_game.difficulty)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Transformation Array Non-Empty
   * For any spirit, the transformations array should never be empty.
   */
  it('Property: Transformation Array Non-Empty - Every spirit has transformations', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse_template = curse_loader.load_curse_template(spirit_id)

        expect(curse_template.transformations.length).toBeGreaterThan(0)
        expect(curse_template.transformations.length).toBeLessThanOrEqual(10) // Reasonable upper bound

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Audio File Path Format
   * For any spirit, the audio file path should be properly formatted.
   */
  it('Property: Audio File Path Format - Audio file paths are valid', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse_template = curse_loader.load_curse_template(spirit_id)

        // Audio file should start with /assets/sounds/
        expect(curse_template.audio.file).toMatch(/^\/assets\/sounds\//)
        // Audio file should end with .mp3
        expect(curse_template.audio.file).toMatch(/\.mp3$/)

        return true
      }),
      { numRuns: 100 }
    )
  })

  /**
   * Property: Glitch Intensity Range
   * For any spirit, the glitch intensity should be within valid range [0, 1].
   */
  it('Property: Glitch Intensity Range - Glitch intensity is within valid bounds', () => {
    fc.assert(
      fc.property(fc.constantFrom(...spirit_ids), (spirit_id: string) => {
        const curse_template = curse_loader.load_curse_template(spirit_id)

        expect(curse_template.spirit.glitch_intensity).toBeGreaterThanOrEqual(0)
        expect(curse_template.spirit.glitch_intensity).toBeLessThanOrEqual(1)

        return true
      }),
      { numRuns: 100 }
    )
  })
})
