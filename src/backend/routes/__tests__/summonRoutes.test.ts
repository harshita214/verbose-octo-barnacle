import { describe, it, expect } from 'vitest'
import { spirit_registry } from '../../services/SpiritRegistry.js'

describe('Summon Routes - Spirit Selection', () => {
  describe('Spirit Registry', () => {
    it('should have all spirits available', () => {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      expect(all_spirits.length).toBeGreaterThan(0)
      expect(all_spirits.some(s => s.id === 'ghost')).toBe(true)
      expect(all_spirits.some(s => s.id === 'vampire')).toBe(true)
      expect(all_spirits.some(s => s.id === 'witch')).toBe(true)
      expect(all_spirits.some(s => s.id === 'pumpkin_demon')).toBe(true)
    })

    it('should retrieve spirit by ID', () => {
      const spirit = spirit_registry.get_haunt_spirit('ghost')

      expect(spirit).toBeDefined()
      expect(spirit?.id).toBe('ghost')
      expect(spirit?.name).toBe('Phantom')
    })

    it('should return null for unknown spirit', () => {
      const spirit = spirit_registry.get_haunt_spirit('unknown')

      expect(spirit).toBeNull()
    })

    it('should check if spirit exists', () => {
      expect(spirit_registry.has_haunt_spirit('ghost')).toBe(true)
      expect(spirit_registry.has_haunt_spirit('unknown')).toBe(false)
    })

    it('should get curse template for spirit', () => {
      const curse = spirit_registry.get_spectral_curse('ghost')

      expect(curse).toBeDefined()
      expect(curse.spirit.id).toBe('ghost')
      expect(curse.mini_game).toBeDefined()
      expect(curse.transformations).toBeDefined()
      expect(curse.audio).toBeDefined()
    })

    it('should find spirit by name', () => {
      const spirit = spirit_registry.find_haunt_spirit_by_name('Phantom')

      expect(spirit).toBeDefined()
      expect(spirit?.id).toBe('ghost')
    })

    it('should find spirit by name case-insensitively', () => {
      const spirit = spirit_registry.find_haunt_spirit_by_name('phantom')

      expect(spirit).toBeDefined()
      expect(spirit?.id).toBe('ghost')
    })

    it('should return null for unknown spirit name', () => {
      const spirit = spirit_registry.find_haunt_spirit_by_name('Unknown Spirit')

      expect(spirit).toBeNull()
    })

    it('should get spirits by mini-game', () => {
      const spirits = spirit_registry.get_spirits_by_mini_game('pumpkin_cipher')

      expect(Array.isArray(spirits)).toBe(true)
      expect(spirits.length).toBeGreaterThan(0)
      expect(spirits.every(s => s.mini_game === 'pumpkin_cipher')).toBe(true)
    })

    it('should return empty array for unknown mini-game', () => {
      const spirits = spirit_registry.get_spirits_by_mini_game('unknown_game')

      expect(Array.isArray(spirits)).toBe(true)
      expect(spirits.length).toBe(0)
    })

    it('should get spirit statistics', () => {
      const stats = spirit_registry.get_spirit_stats()

      expect(stats.total_spirits).toBeGreaterThan(0)
      expect(stats.spirits_by_difficulty).toBeDefined()
      expect(stats.mini_games_count).toBeGreaterThan(0)
    })
  })

  describe('Spirit Validation', () => {
    it('should validate all spirits have required fields', () => {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      all_spirits.forEach(spirit => {
        expect(spirit.id).toBeDefined()
        expect(spirit.name).toBeDefined()
        expect(spirit.description).toBeDefined()
        expect(spirit.color_theme).toBeDefined()
        expect(spirit.glitch_intensity).toBeDefined()
        expect(spirit.costume_style).toBeDefined()
        expect(spirit.mini_game).toBeDefined()
        expect(spirit.ambient_sound).toBeDefined()
        expect(spirit.transformations).toBeDefined()
      })
    })

    it('should validate curse templates for all spirits', () => {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      all_spirits.forEach(spirit => {
        const curse = spirit_registry.get_spectral_curse(spirit.id)

        expect(curse.spirit).toBeDefined()
        expect(curse.mini_game).toBeDefined()
        expect(curse.transformations).toBeDefined()
        expect(curse.audio).toBeDefined()
      })
    })

    it('should validate mini-game configuration', () => {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      all_spirits.forEach(spirit => {
        const curse = spirit_registry.get_spectral_curse(spirit.id)

        expect(curse.mini_game.name).toBeDefined()
        expect(curse.mini_game.duration).toBeGreaterThan(0)
        expect(curse.mini_game.description).toBeDefined()
        expect(['easy', 'medium', 'hard']).toContain(curse.mini_game.difficulty)
      })
    })

    it('should validate transformations array', () => {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      all_spirits.forEach(spirit => {
        const curse = spirit_registry.get_spectral_curse(spirit.id)

        expect(Array.isArray(curse.transformations)).toBe(true)
        expect(curse.transformations.length).toBeGreaterThan(0)

        curse.transformations.forEach(transformation => {
          expect(transformation.name).toBeDefined()
          expect(transformation.effect).toBeDefined()
          expect(transformation.intensity).toBeGreaterThanOrEqual(0)
          expect(transformation.intensity).toBeLessThanOrEqual(1)
        })
      })
    })

    it('should validate audio configuration', () => {
      const all_spirits = spirit_registry.get_all_haunt_spirits()

      all_spirits.forEach(spirit => {
        const curse = spirit_registry.get_spectral_curse(spirit.id)

        expect(curse.audio.file).toBeDefined()
        expect(curse.audio.file).toMatch(/^\/assets\/sounds\//)
        expect(curse.audio.file).toMatch(/\.mp3$/)
        expect(curse.audio.volume).toBeGreaterThanOrEqual(0)
        expect(curse.audio.volume).toBeLessThanOrEqual(1)
        expect(typeof curse.audio.loop).toBe('boolean')
      })
    })
  })

  describe('Spirit Caching', () => {
    it('should cache curse templates', () => {
      const curse1 = spirit_registry.get_spectral_curse('ghost')
      const curse2 = spirit_registry.get_spectral_curse('ghost')

      expect(curse1).toBe(curse2) // Same reference
    })

    it('should clear cache when requested', () => {
      const curse1 = spirit_registry.get_spectral_curse('ghost')
      const curse1_id = curse1.spirit.id
      
      spirit_registry.clear_spectral_cache()
      const curse2 = spirit_registry.get_spectral_curse('ghost')
      const curse2_id = curse2.spirit.id

      // After clearing cache, we should get a fresh curse template
      expect(curse1_id).toBe(curse2_id) // Same spirit data
      expect(curse1.mini_game.name).toBe(curse2.mini_game.name) // Same mini-game
    })
  })
})
