import { describe, it, expect, beforeEach } from 'vitest'
import { CurseLoader } from '../CurseLoader.js'
import { CurseTemplate } from '../../models/types.js'

describe('CurseLoader', () => {
  let curse_loader: CurseLoader

  beforeEach(() => {
    curse_loader = new CurseLoader()
  })

  describe('load_curse_template', () => {
    it('should load a valid curse template for a known spirit', () => {
      const curse = curse_loader.load_curse_template('ghost')
      
      expect(curse).toBeDefined()
      expect(curse.spirit).toBeDefined()
      expect(curse.spirit.id).toBe('ghost')
      expect(curse.mini_game).toBeDefined()
      expect(curse.transformations).toBeDefined()
      expect(Array.isArray(curse.transformations)).toBe(true)
      expect(curse.audio).toBeDefined()
    })

    it('should return a complete CurseTemplate with all required fields', () => {
      const curse = curse_loader.load_curse_template('vampire')
      
      expect(curse.spirit.id).toBeDefined()
      expect(curse.spirit.name).toBeDefined()
      expect(curse.spirit.description).toBeDefined()
      expect(curse.spirit.color_theme).toBeDefined()
      expect(curse.spirit.glitch_intensity).toBeDefined()
      expect(curse.spirit.costume_style).toBeDefined()
      expect(curse.spirit.mini_game).toBeDefined()
      expect(curse.spirit.ambient_sound).toBeDefined()
      expect(curse.spirit.transformations).toBeDefined()
      
      expect(curse.mini_game.name).toBeDefined()
      expect(curse.mini_game.duration).toBeDefined()
      expect(curse.mini_game.description).toBeDefined()
      expect(curse.mini_game.difficulty).toBeDefined()
      
      expect(curse.transformations.length).toBeGreaterThan(0)
      expect(curse.audio.file).toBeDefined()
      expect(curse.audio.volume).toBeDefined()
      expect(curse.audio.loop).toBeDefined()
    })

    it('should cache curse templates for performance', () => {
      const curse1 = curse_loader.load_curse_template('witch')
      const curse2 = curse_loader.load_curse_template('witch')
      
      expect(curse1).toBe(curse2) // Same reference
    })

    it('should fall back to default spirit for unknown spirit ID', () => {
      const curse = curse_loader.load_curse_template('unknown_spirit')
      
      expect(curse).toBeDefined()
      expect(curse.spirit.id).toBe('ghost') // Default
    })

    it('should load all available spirits', () => {
      const spirits = ['ghost', 'vampire', 'witch', 'pumpkin_demon']
      
      spirits.forEach(spirit_id => {
        const curse = curse_loader.load_curse_template(spirit_id)
        expect(curse.spirit.id).toBe(spirit_id)
      })
    })
  })

  describe('get_all_spirits', () => {
    it('should return all available spirits', () => {
      const spirits = curse_loader.get_all_spirits()
      
      expect(Array.isArray(spirits)).toBe(true)
      expect(spirits.length).toBeGreaterThan(0)
      expect(spirits.some(s => s.id === 'ghost')).toBe(true)
      expect(spirits.some(s => s.id === 'vampire')).toBe(true)
    })

    it('should return spirits with all required fields', () => {
      const spirits = curse_loader.get_all_spirits()
      
      spirits.forEach(spirit => {
        expect(spirit.id).toBeDefined()
        expect(spirit.name).toBeDefined()
        expect(spirit.description).toBeDefined()
        expect(spirit.color_theme).toBeDefined()
        expect(spirit.glitch_intensity).toBeGreaterThanOrEqual(0)
        expect(spirit.glitch_intensity).toBeLessThanOrEqual(1)
        expect(spirit.costume_style).toBeDefined()
        expect(spirit.mini_game).toBeDefined()
        expect(spirit.ambient_sound).toBeDefined()
        expect(Array.isArray(spirit.transformations)).toBe(true)
      })
    })
  })

  describe('get_all_mini_games', () => {
    it('should return all available mini-games', () => {
      const mini_games = curse_loader.get_all_mini_games()
      
      expect(typeof mini_games).toBe('object')
      expect(Object.keys(mini_games).length).toBeGreaterThan(0)
    })

    it('should return mini-games with all required fields', () => {
      const mini_games = curse_loader.get_all_mini_games()
      
      Object.values(mini_games).forEach(game => {
        expect(game.name).toBeDefined()
        expect(game.duration).toBeGreaterThan(0)
        expect(game.description).toBeDefined()
        expect(['easy', 'medium', 'hard']).toContain(game.difficulty)
      })
    })
  })

  describe('validate_curse_template', () => {
    it('should validate a correct curse template', () => {
      const curse = curse_loader.load_curse_template('ghost')
      const is_valid = curse_loader.validate_curse_template(curse)
      
      expect(is_valid).toBe(true)
    })

    it('should reject a curse template with missing spirit', () => {
      const invalid_curse = {
        spirit: null,
        mini_game: { name: 'test', duration: 10, description: 'test', difficulty: 'easy' as const },
        transformations: [],
        audio: { file: 'test.mp3', volume: 0.7, loop: true },
      } as any
      
      const is_valid = curse_loader.validate_curse_template(invalid_curse)
      expect(is_valid).toBe(false)
    })

    it('should reject a curse template with missing mini_game', () => {
      const invalid_curse = {
        spirit: { id: 'test', name: 'test', description: 'test', color_theme: '#fff', glitch_intensity: 0.5, costume_style: 'test', mini_game: 'test', ambient_sound: 'test', transformations: [] },
        mini_game: null,
        transformations: [],
        audio: { file: 'test.mp3', volume: 0.7, loop: true },
      } as any
      
      const is_valid = curse_loader.validate_curse_template(invalid_curse)
      expect(is_valid).toBe(false)
    })

    it('should reject a curse template with missing audio', () => {
      const invalid_curse = {
        spirit: { id: 'test', name: 'test', description: 'test', color_theme: '#fff', glitch_intensity: 0.5, costume_style: 'test', mini_game: 'test', ambient_sound: 'test', transformations: [] },
        mini_game: { name: 'test', duration: 10, description: 'test', difficulty: 'easy' as const },
        transformations: [],
        audio: null,
      } as any
      
      const is_valid = curse_loader.validate_curse_template(invalid_curse)
      expect(is_valid).toBe(false)
    })
  })

  describe('reload_curse_data', () => {
    it('should clear cache and reload curse data', () => {
      const curse1 = curse_loader.load_curse_template('ghost')
      curse_loader.reload_curse_data()
      const curse2 = curse_loader.load_curse_template('ghost')
      
      expect(curse1).not.toBe(curse2) // Different reference after reload
      expect(curse1.spirit.id).toBe(curse2.spirit.id) // But same data
    })
  })
})
