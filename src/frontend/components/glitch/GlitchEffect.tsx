import { useState, useEffect, ReactNode } from 'react'
import '../../styles/GlitchEffect.css'

interface GlitchEffectProps {
  active: boolean
  intensity: number // 0-1 scale
  children: ReactNode
  duration?: number // milliseconds
  onComplete?: () => void
}

/**
 * GlitchEffect Component
 * Applies CSS-based glitch animations to simulate UI corruption
 * Follows spooky naming convention: glitch_*
 */
export const GlitchEffect = ({
  active,
  intensity,
  children,
  duration = 3000,
  onComplete,
}: GlitchEffectProps) => {
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchPhase, setGlitchPhase] = useState(0)

  // Validate intensity is between 0 and 1
  const normalized_intensity = Math.max(0, Math.min(1, intensity))

  useEffect(() => {
    if (!active) {
      setIsGlitching(false)
      setGlitchPhase(0)
      return
    }

    setIsGlitching(true)
    let animation_frame_id: number | null = null

    // Set timer for completion
    const timer = setTimeout(() => {
      setIsGlitching(false)
      setGlitchPhase(0)
      onComplete?.()
    }, duration)

    // Animation loop for glitch phase updates
    const start_time = Date.now()

    const update_phase = () => {
      const elapsed = Date.now() - start_time
      const progress = elapsed / duration

      if (progress < 1) {
        // Update glitch phase (0-3) for cycling effects
        setGlitchPhase(Math.floor(progress * 4) % 4)
        animation_frame_id = requestAnimationFrame(update_phase)
      }
    }

    animation_frame_id = requestAnimationFrame(update_phase)

    return () => {
      clearTimeout(timer)
      if (animation_frame_id !== null) {
        cancelAnimationFrame(animation_frame_id)
      }
    }
  }, [active, duration, onComplete])

  // Calculate CSS variables based on intensity
  const glitch_offset = normalized_intensity * 10 // 0-10px
  const color_shift = normalized_intensity * 100 // 0-100%
  const shake_amount = normalized_intensity * 5 // 0-5px

  return (
    <div
      className={`glitch-container ${isGlitching ? 'glitch-active' : ''}`}
      style={{
        '--glitch-intensity': normalized_intensity,
        '--glitch-offset': `${glitch_offset}px`,
        '--color-shift': `${color_shift}%`,
        '--shake-amount': `${shake_amount}px`,
        '--glitch-phase': glitchPhase,
      } as React.CSSProperties & Record<string, any>}
    >
      {/* Spectral overlay for possession effect */}
      {isGlitching && (
        <div className="spectral-overlay" style={{ opacity: normalized_intensity * 0.3 }} />
      )}

      {/* Main content with glitch effect */}
      <div className={`glitch-content ${isGlitching ? 'glitch-shake' : ''}`}>
        {children}
      </div>

      {/* Glitch artifacts (visual noise) */}
      {isGlitching && (
        <>
          <div className="glitch-artifact glitch-artifact-1" />
          <div className="glitch-artifact glitch-artifact-2" />
          <div className="glitch-artifact glitch-artifact-3" />
        </>
      )}
    </div>
  )
}

export default GlitchEffect
