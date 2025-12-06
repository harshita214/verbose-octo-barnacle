/**
 * HauntHub Type Definitions
 * All types follow spooky naming conventions
 */

export interface Spirit {
  id: string
  name: string
  description: string
  color_theme: string
  glitch_intensity: number
  costume_style: string
  mini_game: string
  ambient_sound: string
  transformations: string[]
}

export interface MiniGameConfig {
  name: string
  duration: number
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface TransformationRule {
  name: string
  effect: string
  intensity: number
}

export interface AudioConfig {
  file: string
  volume: number
  loop: boolean
}

export interface CurseTemplate {
  spirit: Spirit
  mini_game: MiniGameConfig
  transformations: TransformationRule[]
  audio: AudioConfig
}

export interface Costume {
  id: string
  originalImageUrl: string
  transformedImageUrl: string
  spiritId: string
  timestamp: Date
  shareUrl?: string
  metadata: CostumeMetadata
}

export interface CostumeMetadata {
  spiritName: string
  playerNickname?: string
  timestamp: Date
  gameCompleted: boolean
}

export interface GameSession {
  sessionId: string
  userId?: string
  spiritId: string
  uploadedImage: Buffer
  costume?: Costume
  gameCompleted: boolean
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  curse?: {
    spirit: string
    costume_url?: string
    mini_game?: string
  }
  data?: T
  error?: string
}
