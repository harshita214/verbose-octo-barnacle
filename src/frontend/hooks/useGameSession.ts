import { useState, useCallback } from 'react'
import axios from 'axios'

interface GameSessionState {
  sessionId: string | null
  spiritId: string
  hasImage: boolean
  gameCompleted: boolean
  createdAt: Date | null
}

interface UseGameSessionReturn {
  session: GameSessionState
  uploadImage: (file: File, spiritId: string) => Promise<void>
  getSession: () => Promise<void>
  clearSession: () => Promise<void>
  isLoading: boolean
  error: string | null
}

/**
 * useGameSession Hook
 * Manages game session state and API interactions
 * Follows spooky naming convention
 */
export const useGameSession = (): UseGameSessionReturn => {
  const [session, setSession] = useState<GameSessionState>({
    sessionId: null,
    spiritId: '',
    hasImage: false,
    gameCompleted: false,
    createdAt: null,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Upload image to backend
   */
  const uploadImage = useCallback(async (file: File, spiritId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post('/api/haunt/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        setSession(prev => ({
          ...prev,
          sessionId: response.data.data.sessionId,
          spiritId,
          hasImage: true,
        }))
      } else {
        throw new Error(response.data.error || 'Upload failed')
      }
    } catch (err: any) {
      const error_message = err.response?.data?.error || err.message || 'Upload failed'
      setError(error_message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Get current session from backend
   */
  const getSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.get('/api/haunt/session')

      if (response.data.success) {
        setSession(prev => ({
          ...prev,
          sessionId: response.data.data.sessionId,
          spiritId: response.data.data.spiritId,
          hasImage: response.data.data.hasImage,
          gameCompleted: response.data.data.gameCompleted,
          createdAt: new Date(response.data.data.createdAt),
        }))
      } else {
        throw new Error(response.data.error || 'Failed to get session')
      }
    } catch (err: any) {
      const error_message = err.response?.data?.error || err.message || 'Failed to get session'
      setError(error_message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Clear current session
   */
  const clearSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.delete('/api/haunt/session')

      if (response.data.success) {
        setSession({
          sessionId: null,
          spiritId: '',
          hasImage: false,
          gameCompleted: false,
          createdAt: null,
        })
      } else {
        throw new Error(response.data.error || 'Failed to clear session')
      }
    } catch (err: any) {
      const error_message = err.response?.data?.error || err.message || 'Failed to clear session'
      setError(error_message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    session,
    uploadImage,
    getSession,
    clearSession,
    isLoading,
    error,
  }
}

export default useGameSession
