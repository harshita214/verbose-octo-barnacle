import { useEffect, useCallback, useState } from 'react'
import { audio_service, AudioService } from '../services/AudioService'
import { CurseTemplate } from '../../backend/models/types'

interface UseAudioReturn {
  isLoading: boolean
  error: string | null
  playAudio: (spiritId: string) => void
  stopAudio: (spiritId: string) => void
  pauseAudio: (spiritId: string) => void
  resumeAudio: (spiritId: string) => void
  setVolume: (spiritId: string, volume: number) => void
  setMasterVolume: (volume: number) => void
  muteAll: () => void
  unmuteAll: () => void
  stopAll: () => void
}

/**
 * useAudio Hook
 * Manages audio playback for spirits
 */
export const useAudio = (): UseAudioReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load audio for a curse template
   */
  const load_audio = useCallback(async (curse: CurseTemplate) => {
    try {
      setIsLoading(true)
      setError(null)

      await audio_service.load_audio(curse.spirit.id, curse.audio)
    } catch (err: any) {
      const error_message = err.message || 'Failed to load audio'
      setError(error_message)
      console.error('Audio loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Play audio for a spirit
   */
  const playAudio = useCallback((spiritId: string) => {
    try {
      setError(null)
      audio_service.play_audio(spiritId)
    } catch (err: any) {
      setError(err.message || 'Failed to play audio')
    }
  }, [])

  /**
   * Stop audio for a spirit
   */
  const stopAudio = useCallback((spiritId: string) => {
    try {
      setError(null)
      audio_service.stop_audio(spiritId)
    } catch (err: any) {
      setError(err.message || 'Failed to stop audio')
    }
  }, [])

  /**
   * Pause audio for a spirit
   */
  const pauseAudio = useCallback((spiritId: string) => {
    try {
      setError(null)
      audio_service.pause_audio(spiritId)
    } catch (err: any) {
      setError(err.message || 'Failed to pause audio')
    }
  }, [])

  /**
   * Resume audio for a spirit
   */
  const resumeAudio = useCallback((spiritId: string) => {
    try {
      setError(null)
      audio_service.resume_audio(spiritId)
    } catch (err: any) {
      setError(err.message || 'Failed to resume audio')
    }
  }, [])

  /**
   * Set volume for a spirit
   */
  const setVolume = useCallback((spiritId: string, volume: number) => {
    try {
      setError(null)
      audio_service.set_volume(spiritId, volume)
    } catch (err: any) {
      setError(err.message || 'Failed to set volume')
    }
  }, [])

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume: number) => {
    try {
      setError(null)
      audio_service.set_master_volume(volume)
    } catch (err: any) {
      setError(err.message || 'Failed to set master volume')
    }
  }, [])

  /**
   * Mute all audio
   */
  const muteAll = useCallback(() => {
    try {
      setError(null)
      audio_service.mute_all()
    } catch (err: any) {
      setError(err.message || 'Failed to mute audio')
    }
  }, [])

  /**
   * Unmute all audio
   */
  const unmuteAll = useCallback(() => {
    try {
      setError(null)
      audio_service.unmute_all()
    } catch (err: any) {
      setError(err.message || 'Failed to unmute audio')
    }
  }, [])

  /**
   * Stop all audio
   */
  const stopAll = useCallback(() => {
    try {
      setError(null)
      audio_service.stop_all()
    } catch (err: any) {
      setError(err.message || 'Failed to stop all audio')
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audio_service.stop_all()
    }
  }, [])

  return {
    isLoading,
    error,
    playAudio,
    stopAudio,
    pauseAudio,
    resumeAudio,
    setVolume,
    setMasterVolume,
    muteAll,
    unmuteAll,
    stopAll,
  }
}

export default useAudio
