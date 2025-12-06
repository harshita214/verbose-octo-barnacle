/**
 * AudioService
 * Manages ambient sound playback for spirits
 * Handles audio loading, playback, and error handling
 */

interface AudioConfig {
  file: string
  volume: number
  loop: boolean
}

export class AudioService {
  private audio_elements: Map<string, HTMLAudioElement> = new Map()
  private current_playing: string | null = null
  private master_volume: number = 1

  /**
   * Load audio file
   */
  public async load_audio(spiritId: string, config: AudioConfig): Promise<void> {
    try {
      // Check if already loaded
      if (this.audio_elements.has(spiritId)) {
        return
      }

      const audio = new Audio()
      audio.src = config.file
      audio.volume = config.volume * this.master_volume
      audio.loop = config.loop
      audio.preload = 'auto'

      // Wait for audio to be loadable
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Audio loading timeout for ${spiritId}`))
        }, 5000)

        audio.addEventListener('canplay', () => {
          clearTimeout(timeout)
          resolve()
        })

        audio.addEventListener('error', () => {
          clearTimeout(timeout)
          reject(new Error(`Failed to load audio for ${spiritId}`))
        })

        audio.load()
      })

      this.audio_elements.set(spiritId, audio)
      console.log(`✨ Audio loaded for spirit: ${spiritId}`)
    } catch (error) {
      console.error(`Failed to load audio for ${spiritId}:`, error)
      throw error
    }
  }

  /**
   * Play audio for a spirit
   */
  public play_audio(spiritId: string): void {
    try {
      // Stop current audio
      if (this.current_playing && this.current_playing !== spiritId) {
        this.stop_audio(this.current_playing)
      }

      const audio = this.audio_elements.get(spiritId)
      if (!audio) {
        console.warn(`Audio not found for spirit: ${spiritId}`)
        return
      }

      audio.currentTime = 0
      audio.play().catch(err => {
        console.error(`Failed to play audio for ${spiritId}:`, err)
      })

      this.current_playing = spiritId
      console.log(`🔊 Playing audio for spirit: ${spiritId}`)
    } catch (error) {
      console.error(`Error playing audio for ${spiritId}:`, error)
    }
  }

  /**
   * Stop audio for a spirit
   */
  public stop_audio(spiritId: string): void {
    try {
      const audio = this.audio_elements.get(spiritId)
      if (!audio) return

      audio.pause()
      audio.currentTime = 0

      if (this.current_playing === spiritId) {
        this.current_playing = null
      }

      console.log(`🔇 Stopped audio for spirit: ${spiritId}`)
    } catch (error) {
      console.error(`Error stopping audio for ${spiritId}:`, error)
    }
  }

  /**
   * Pause audio
   */
  public pause_audio(spiritId: string): void {
    try {
      const audio = this.audio_elements.get(spiritId)
      if (!audio) return

      audio.pause()
      console.log(`⏸️ Paused audio for spirit: ${spiritId}`)
    } catch (error) {
      console.error(`Error pausing audio for ${spiritId}:`, error)
    }
  }

  /**
   * Resume audio
   */
  public resume_audio(spiritId: string): void {
    try {
      const audio = this.audio_elements.get(spiritId)
      if (!audio) return

      audio.play().catch(err => {
        console.error(`Failed to resume audio for ${spiritId}:`, err)
      })

      this.current_playing = spiritId
      console.log(`▶️ Resumed audio for spirit: ${spiritId}`)
    } catch (error) {
      console.error(`Error resuming audio for ${spiritId}:`, error)
    }
  }

  /**
   * Set volume for a spirit
   */
  public set_volume(spiritId: string, volume: number): void {
    try {
      const audio = this.audio_elements.get(spiritId)
      if (!audio) return

      const normalized_volume = Math.max(0, Math.min(1, volume))
      audio.volume = normalized_volume * this.master_volume
      console.log(`🔊 Set volume for ${spiritId}: ${normalized_volume}`)
    } catch (error) {
      console.error(`Error setting volume for ${spiritId}:`, error)
    }
  }

  /**
   * Set master volume
   */
  public set_master_volume(volume: number): void {
    try {
      this.master_volume = Math.max(0, Math.min(1, volume))

      // Update all audio elements
      this.audio_elements.forEach(audio => {
        audio.volume = audio.volume * this.master_volume
      })

      console.log(`🔊 Master volume set to: ${this.master_volume}`)
    } catch (error) {
      console.error('Error setting master volume:', error)
    }
  }

  /**
   * Mute all audio
   */
  public mute_all(): void {
    try {
      this.audio_elements.forEach(audio => {
        audio.muted = true
      })
      console.log('🔇 All audio muted')
    } catch (error) {
      console.error('Error muting audio:', error)
    }
  }

  /**
   * Unmute all audio
   */
  public unmute_all(): void {
    try {
      this.audio_elements.forEach(audio => {
        audio.muted = false
      })
      console.log('🔊 All audio unmuted')
    } catch (error) {
      console.error('Error unmuting audio:', error)
    }
  }

  /**
   * Stop all audio
   */
  public stop_all(): void {
    try {
      this.audio_elements.forEach((audio, spiritId) => {
        audio.pause()
        audio.currentTime = 0
      })
      this.current_playing = null
      console.log('🔇 All audio stopped')
    } catch (error) {
      console.error('Error stopping all audio:', error)
    }
  }

  /**
   * Unload audio for a spirit
   */
  public unload_audio(spiritId: string): void {
    try {
      const audio = this.audio_elements.get(spiritId)
      if (!audio) return

      audio.pause()
      audio.src = ''
      this.audio_elements.delete(spiritId)

      if (this.current_playing === spiritId) {
        this.current_playing = null
      }

      console.log(`🗑️ Audio unloaded for spirit: ${spiritId}`)
    } catch (error) {
      console.error(`Error unloading audio for ${spiritId}:`, error)
    }
  }

  /**
   * Unload all audio
   */
  public unload_all(): void {
    try {
      this.audio_elements.forEach((audio, spiritId) => {
        audio.pause()
        audio.src = ''
      })
      this.audio_elements.clear()
      this.current_playing = null
      console.log('🗑️ All audio unloaded')
    } catch (error) {
      console.error('Error unloading all audio:', error)
    }
  }

  /**
   * Get current playing spirit
   */
  public get_current_playing(): string | null {
    return this.current_playing
  }

  /**
   * Check if audio is loaded
   */
  public is_loaded(spiritId: string): boolean {
    return this.audio_elements.has(spiritId)
  }

  /**
   * Get audio element
   */
  public get_audio(spiritId: string): HTMLAudioElement | undefined {
    return this.audio_elements.get(spiritId)
  }
}

// Export singleton instance
export const audio_service = new AudioService()
