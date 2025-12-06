import { useState } from 'react'
import '../../styles/ModeToggle.css'

interface ModeToggleProps {
  onModeChange: (mode: 'angel' | 'devil') => void
  currentMode: 'angel' | 'devil'
}

/**
 * ModeToggle Component
 * Allows users to switch between Angel Mode and Devil Mode
 * Angel: Light, pure, heavenly theme
 * Devil: Dark, spooky, cursed theme
 */
export const ModeToggle = ({ onModeChange, currentMode }: ModeToggleProps) => {
  const handle_mode_change = (mode: 'angel' | 'devil') => {
    onModeChange(mode)
  }

  return (
    <div className="mode-toggle-container">
      <button
        className={`mode-button angel-mode ${currentMode === 'angel' ? 'active' : ''}`}
        onClick={() => handle_mode_change('angel')}
        title="Switch to Angel Mode"
      >
        <span className="mode-icon">😇</span>
        <span className="mode-label">Angel</span>
      </button>

      <div className="mode-divider" />

      <button
        className={`mode-button devil-mode ${currentMode === 'devil' ? 'active' : ''}`}
        onClick={() => handle_mode_change('devil')}
        title="Switch to Devil Mode"
      >
        <span className="mode-icon">😈</span>
        <span className="mode-label">Devil</span>
      </button>
    </div>
  )
}

export default ModeToggle
