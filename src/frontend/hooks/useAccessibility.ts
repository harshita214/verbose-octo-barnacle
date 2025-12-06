import { useState, useEffect } from 'react'

/**
 * useAccessibility Hook
 * Manages accessibility settings including calm mode and reduced motion
 * Follows spooky naming: possess_accessible, glitch_calm
 */
export const useAccessibility = () => {
  const [calmMode, setCalmMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)

  // Check for prefers-reduced-motion on mount
  useEffect(() => {
    const media_query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(media_query.matches)

    const handle_change = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    media_query.addEventListener('change', handle_change)
    return () => media_query.removeEventListener('change', handle_change)
  }, [])

  // Check for prefers-contrast on mount
  useEffect(() => {
    const media_query = window.matchMedia('(prefers-contrast: more)')
    setHighContrast(media_query.matches)

    const handle_change = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches)
    }

    media_query.addEventListener('change', handle_change)
    return () => media_query.removeEventListener('change', handle_change)
  }, [])

  // Load calm mode from localStorage
  useEffect(() => {
    const saved_calm_mode = localStorage.getItem('hauntHub_calmMode')
    if (saved_calm_mode !== null) {
      setCalmMode(JSON.parse(saved_calm_mode))
    }
  }, [])

  // Save calm mode to localStorage
  const toggle_calm_mode = (enabled: boolean) => {
    setCalmMode(enabled)
    localStorage.setItem('hauntHub_calmMode', JSON.stringify(enabled))
  }

  return {
    calmMode,
    toggleCalmMode: toggle_calm_mode,
    reducedMotion,
    highContrast,
    shouldReduceMotion: reducedMotion || calmMode,
  }
}

export default useAccessibility
