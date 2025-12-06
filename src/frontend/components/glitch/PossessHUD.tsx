import { useState, useEffect } from 'react'
import { GlitchEffect } from './GlitchEffect'
import '../../styles/PossessHUD.css'

interface PossessHUDProps {
  spiritId: string
  spiritName: string
  onComplete: () => void
  calmMode?: boolean
}

/**
 * PossessHUD Component
 * Orchestrates glitch effects and possession animation
 * Shows possession progress and spirit information
 */
export const PossessHUD = ({
  spiritId,
  spiritName,
  onComplete,
  calmMode = false,
}: PossessHUDProps) => {
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [intensity, setIntensity] = useState(0)

  const POSSESSION_DURATION = 3000 // 3 seconds

  useEffect(() => {
    const start_time = Date.now()

    const animate = () => {
      const elapsed = Date.now() - start_time
      const current_progress = Math.min(elapsed / POSSESSION_DURATION, 1)

      // Intensity increases over time
      setIntensity(current_progress)
      setProgress(current_progress * 100)

      if (current_progress >= 1) {
        setIsComplete(true)
        onComplete()
        return
      }

      requestAnimationFrame(animate)
    }

    const frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [onComplete])

  const handle_calm_mode_toggle = () => {
    // This would be handled by parent component
    // Just a placeholder for UI
  }

  return (
    <GlitchEffect
      active={!isComplete}
      intensity={calmMode ? intensity * 0.3 : intensity}
      duration={POSSESSION_DURATION}
      onComplete={onComplete}
    >
      <div className={`possess-hud ${calmMode ? 'calm-mode' : ''}`}>
        {/* Spirit Name Display */}
        <div className="spirit-display">
          <h2 className="spirit-title">Summoning...</h2>
          <p className="spirit-name">{spiritName}</p>
        </div>

        {/* Possession Progress Bar */}
        <div className="possession-progress">
          <div className="progress-label">Possession Progress</div>
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                opacity: 0.8 + intensity * 0.2,
              }}
            />
            <div className="progress-bar-glow" />
          </div>
          <div className="progress-percentage">{Math.round(progress)}%</div>
        </div>

        {/* Possession Status */}
        <div className="possession-status">
          {progress < 33 && <p className="status-text">The spirit awakens...</p>}
          {progress >= 33 && progress < 66 && (
            <p className="status-text">The possession intensifies...</p>
          )}
          {progress >= 66 && progress < 100 && (
            <p className="status-text">You are becoming one...</p>
          )}
          {progress >= 100 && <p className="status-text">Possession complete!</p>}
        </div>

        {/* Accessibility Controls */}
        <div className="accessibility-controls">
          <button
            className="calm-mode-toggle"
            onClick={handle_calm_mode_toggle}
            title="Toggle calm mode for reduced motion"
          >
            {calmMode ? '🧘 Calm Mode: ON' : '👻 Calm Mode: OFF'}
          </button>
        </div>

        {/* Spectral Particles */}
        <div className="spectral-particles">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </GlitchEffect>
  )
}

export default PossessHUD
