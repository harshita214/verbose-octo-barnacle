import { useState, useEffect } from 'react'
import axios from 'axios'
import '../../styles/SpiritSelection.css'

interface Spirit {
  id: string
  name: string
  description: string
  color_theme: string
  glitch_intensity: number
  mini_game: string
}

interface SpiritSelectionProps {
  onSelect: (spiritId: string) => void
  isLoading: boolean
  selectedSpirit?: string
}

/**
 * SpiritSelection Component
 * Displays available spirits with visual previews
 * Allows user to select a spirit to summon
 */
export const SpiritSelection = ({
  onSelect,
  isLoading,
  selectedSpirit,
}: SpiritSelectionProps) => {
  const [spirits, setSpirits] = useState<Spirit[]>([])
  const [loadingSpirits, setLoadingSpirits] = useState(true)
  const [error, setError] = useState<string>('')

  // Load available spirits on mount
  useEffect(() => {
    const load_spirits = async () => {
      try {
        const response = await axios.get('/api/summon/spirits')
        if (response.data.success && response.data.data.spirits) {
          setSpirits(response.data.data.spirits)
        }
      } catch (err) {
        console.error('Failed to load spirits:', err)
        setError('Failed to load spirits. Please refresh the page.')
      } finally {
        setLoadingSpirits(false)
      }
    }

    load_spirits()
  }, [])

  const handle_spirit_select = (spiritId: string) => {
    onSelect(spiritId)
  }

  if (loadingSpirits) {
    return (
      <div className="possess-spirit-selection">
        <div className="loading-spinner">Loading spirits...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="possess-spirit-selection">
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span className="error-text">{error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="possess-spirit-selection">
      <h2 className="spirit-selection-title">Choose Your Spirit</h2>
      <p className="spirit-selection-subtitle">
        Select a spirit to summon and begin your haunted transformation
      </p>

      <div className="spirit-grid-container">
        {spirits.map((spirit) => (
          <button
            key={spirit.id}
            className={`spirit-card ${selectedSpirit === spirit.id ? 'selected' : ''}`}
            onClick={() => handle_spirit_select(spirit.id)}
            disabled={isLoading}
            style={{
              borderColor: selectedSpirit === spirit.id ? spirit.color_theme : undefined,
              boxShadow:
                selectedSpirit === spirit.id
                  ? `0 0 30px ${spirit.color_theme}, inset 0 0 20px ${spirit.color_theme}33`
                  : undefined,
            }}
          >
            {/* Spirit Icon/Avatar */}
            <div className="spirit-icon">
              {spirit.id === 'ghost' && '👻'}
              {spirit.id === 'vampire' && '🧛'}
              {spirit.id === 'witch' && '🧙'}
              {spirit.id === 'pumpkin_demon' && '🎃'}
            </div>

            {/* Spirit Info */}
            <div className="spirit-info">
              <h3 className="spirit-name">{spirit.name}</h3>
              <p className="spirit-description">{spirit.description}</p>

              {/* Spirit Stats */}
              <div className="spirit-stats">
                <div className="stat">
                  <span className="stat-label">Intensity:</span>
                  <div className="stat-bar">
                    <div
                      className="stat-fill"
                      style={{
                        width: `${spirit.glitch_intensity * 100}%`,
                        backgroundColor: spirit.color_theme,
                      }}
                    />
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-label">Game:</span>
                  <span className="stat-value">{spirit.mini_game}</span>
                </div>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedSpirit === spirit.id && (
              <div className="selection-indicator">
                <span className="checkmark">✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {spirits.length === 0 && (
        <div className="no-spirits">
          <p>No spirits available. Please try again later.</p>
        </div>
      )}
    </div>
  )
}

export default SpiritSelection
