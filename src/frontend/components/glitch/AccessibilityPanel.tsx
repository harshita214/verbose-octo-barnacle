import { useState } from 'react'
import { useAccessibility } from '../../hooks/useAccessibility'
import '../../styles/AccessibilityPanel.css'

/**
 * AccessibilityPanel Component
 * Provides accessibility settings and toggles
 * Includes calm mode, reduced motion, and high contrast options
 */
export const AccessibilityPanel = () => {
  const { calmMode, toggleCalmMode, reducedMotion, highContrast } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  const handle_toggle_calm_mode = () => {
    toggleCalmMode(!calmMode)
  }

  return (
    <div className="accessibility-panel">
      {/* Toggle Button */}
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle accessibility settings"
        aria-expanded={isOpen}
      >
        ♿
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="accessibility-menu" role="region" aria-label="Accessibility settings">
          <div className="menu-header">
            <h3 className="menu-title">Accessibility</h3>
            <button
              className="menu-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close accessibility menu"
            >
              ✕
            </button>
          </div>

          <div className="menu-content">
            {/* Calm Mode Toggle */}
            <div className="setting-item">
              <label htmlFor="calm-mode-toggle" className="setting-label">
                <input
                  id="calm-mode-toggle"
                  type="checkbox"
                  className="setting-checkbox"
                  checked={calmMode}
                  onChange={handle_toggle_calm_mode}
                  aria-label="Enable calm mode to reduce glitch effects"
                />
                <span className="setting-text">Calm Mode</span>
              </label>
              <p className="setting-description">Reduces glitch effects and animations</p>
            </div>

            {/* Reduced Motion Status */}
            <div className="setting-item">
              <div className="setting-label">
                <span className="setting-icon">⏸️</span>
                <span className="setting-text">Reduced Motion</span>
              </div>
              <p className="setting-description">
                {reducedMotion
                  ? '✓ Enabled (from system settings)'
                  : 'Not enabled in system settings'}
              </p>
            </div>

            {/* High Contrast Status */}
            <div className="setting-item">
              <div className="setting-label">
                <span className="setting-icon">◐</span>
                <span className="setting-text">High Contrast</span>
              </div>
              <p className="setting-description">
                {highContrast
                  ? '✓ Enabled (from system settings)'
                  : 'Not enabled in system settings'}
              </p>
            </div>

            {/* Keyboard Navigation Info */}
            <div className="setting-item info-box">
              <h4 className="info-title">Keyboard Navigation</h4>
              <ul className="info-list">
                <li>
                  <kbd>Tab</kbd> - Navigate between elements
                </li>
                <li>
                  <kbd>Enter</kbd> - Activate buttons
                </li>
                <li>
                  <kbd>Space</kbd> - Toggle checkboxes
                </li>
                <li>
                  <kbd>Esc</kbd> - Close menus
                </li>
              </ul>
            </div>

            {/* Screen Reader Info */}
            <div className="setting-item info-box">
              <h4 className="info-title">Screen Reader Support</h4>
              <p className="info-text">
                HauntHub is designed to work with screen readers. All interactive elements have
                proper ARIA labels and semantic HTML.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityPanel
