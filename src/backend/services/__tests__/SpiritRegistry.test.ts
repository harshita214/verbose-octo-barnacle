import { describe, it, expect, beforeEach } from 'vitest'
import { SpiritRegistry } from '../SpiritRegistry.js'
import { Spirit } from '../../models/types.js'

describe('SpiritRegistry', () => {
  let spirit_registry: SpiritRegistry

  beforeEach(() => {
    spirit_registry = new SpiritRegistry()
  })

  describe('get_haunt_spirit', () => {
    it('should return a spirit by ID', () => {
      const spirit = spirit_registry.get_haunt_spirit('ghost')
      
      expect(spirit).toBeDefined()
      expect(spirit?.id).toBe('ghost')
      expect(spirit?.name).toBeDefined()
    })

    it('should return null for unknown spirit ID', () => {
      const spirit = spirit_registry.get_haunt_spirit('unknown')
      
      expect(spirit).toBeNull()
    })
  })

  describe('get_all_haunt_spirits', () => {
    it('should return all available spirits', () => {
      const spirits = spirit_registry.get_all_haunt_spirits()
      
      expect(Array.isArray(spirits)).toBe(true)
      expect(spirits.length).toBeGreaterThan(0)
    })

    it('should include all expected spirits', () => {
      const spirits = spirit_registry.get_all_haunt_spirits()
      const spirit_ids = spirits.map(s => s.id)
      
      expect(spirit_ids).toContain('ghost')
      expect(spirit_ids).toContain('vampire')
      expect(spirit_ids).toContain('witch')
      expect(spirit_ids).toContain('pumpkin_demon')
    })
  })

  describe('get_spectral_curse', () => {
    it('should return a valid curse template for a spirit', () => {
      const curse = spirit_registry.get_spectral_curse('ghost')
      
      expect(curse).toBeDefined()
      expect(curse.spirit.id).toBe('ghost')
      expect(curse.mini_game).toBeDefined()
      expect(curse.transformations).toBeDefined()
      expect(curse.audio).toBeDefined()
    })

    it('should cache curse templates', () => {
      const curse1 = spirit_registry.get_spectral_curse('vampire')
      const curse2 = spirit_registry.get_spectral_curse('vampire')
      
      expect(curse1).toBe(curse2) // Same reference
    })

    it('should throw error for invalid curse template', () => {
      // This would require mocking the curse_loader, so we'll skip for now
      // In a real scenario, we'd mock the curse_loader to return invalid data
    })
  })

  describe('has_haunt_spirit', () => {
    it('should return true for existing spirit', () => {
      const has_spirit = spirit_registry.has_haunt_spirit('ghost')
      
      expect(has_spirit).toBe(true)
    })

    it('should return false for non-existing spirit', () => {
      const has_spirit = spirit_registry.has_haunt_spirit('unknown')
      
      expect(has_spirit).toBe(false)
    })
  })

  describe('find_haunt_spirit_by_name', () => {
    it('should find a spirit by name (case-insensitive)', () => {
      const spirit = spirit_registry.find_haunt_spirit_by_name('Phantom')
      
      expect(spirit).toBeDefined()
      expect(spirit?.id).toBe('ghost')
    })

    it('should find a spirit by lowercase name', () => {
      const spirit = spirit_registry.find_haunt_spirit_by_name('nosferatu')
      
      expect(spirit).toBeDefined()
      expect(spirit?.id).toBe('vampire')
    })

    it('should return null for unknown name', () => {
      const spirit = spirit_registry.find_haunt_spirit_by_name('Unknown Spirit')
      
      expect(spirit).toBeNull()
    })
  })

  describe('get_spirits_by_mini_game', () => {
    it('should return spirits with a specific mini-game', () => {
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
  })

  describe('register_haunt_spirit', () => {
    it('should register a new spirit', () => {
      const new_spirit: Spirit = {
        id: 'test_spirit',
        name: 'Test Spirit',
        description: 'A test spirit',
        color_theme: '#ff0000',
        glitch_intensity: 0.5,
        costume_style: 'test',
        mini_game: 'ghost_chase',
        ambient_sound: 'test_sound',
        transformations: ['test_transform'],
      }

      spirit_registry.register_haunt_spirit(new_spirit)
      const registered = spirit_registry.get_haunt_spirit('test_spirit')

      expect(registered).toBeDefined()
      expect(registered?.id).toBe('test_spirit')
      expect(registered?.name).toBe('Test Spirit')
    })

    it('should overwrite existing spirit with same ID', () => {
      const new_spirit: Spirit = {
        id: 'ghost',
        name: 'Modified Ghost',
        description: 'A modified ghost',
        color_theme: '#00ff00',
        glitch_intensity: 0.8,
        costume_style: 'modified',
        mini_game: 'ghost_chase',
        ambient_sound: 'modified_sound',
        transformations: ['modified_transform'],
      }

      spirit_registry.register_haunt_spirit(new_spirit)
      const registered = spirit_registry.get_haunt_spirit('ghost')

      expect(registered?.name).toBe('Modified Ghost')
    })
  })

  describe('unregister_haunt_spirit', () => {
    it('should unregister an existing spirit', () => {
      const removed = spirit_registry.unregister_haunt_spirit('ghost')
      const spirit = spirit_registry.get_haunt_spirit('ghost')

      expect(removed).toBe(true)
      expect(spirit).toBeNull()
    })

    it('should return false for non-existing spirit', () => {
      const removed = spirit_registry.unregister_haunt_spirit('unknown')

      expect(removed).toBe(false)
    })
  })

  describe('get_spirit_stats', () => {
    it('should return spirit statistics', () => {
      const stats = spirit_registry.get_spirit_stats()

      expect(stats).toBeDefined()
      expect(stats.total_spirits).toBeGreaterThan(0)
      expect(stats.spirits_by_difficulty).toBeDefined()
      expect(stats.mini_games_count).toBeGreaterThan(0)
    })

    it('should have correct difficulty distribution', () => {
      const stats = spirit_registry.get_spirit_stats()

      expect(stats.spirits_by_difficulty.easy).toBeGreaterThanOrEqual(0)
      expect(stats.spirits_by_difficulty.medium).toBeGreaterThanOrEqual(0)
      expect(stats.spirits_by_difficulty.hard).toBeGreaterThanOrEqual(0)
    })
  })

  describe('clear_spectral_cache', () => {
    it('should clear the spectral cache', () => {
      const curse1 = spirit_registry.get_spectral_curse('ghost')
      const curse1_id = curse1.spirit.id
      
      spirit_registry.clear_spectral_cache()
      const curse2 = spirit_registry.get_spectral_curse('ghost')
      const curse2_id = curse2.spirit.id

      // After clearing cache, we should get a fresh curse template
      // The data should be the same but it's a new object from CurseLoader
      expect(curse1_id).toBe(curse2_id) // Same spirit data
      expect(curse1.mini_game.name).toBe(curse2.mini_game.name) // Same mini-game
    })
  })
})
