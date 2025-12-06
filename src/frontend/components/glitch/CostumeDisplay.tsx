import { useState, useEffect } from 'react'
import { StickerService } from '../../services/StickerService'
import '../../styles/CostumeDisplay.css'

interface CostumeDisplayProps {
  costumeUrl: string
  spiritName: string
  spiritId: string
  transformations: string[]
  onGameStart: () => void
  onShare: () => void
  isLoading?: boolean
}

/**
 * CostumeDisplay Component
 * Shows the generated AI costume with spirit sticker overlay
 * Provides options to play mini-game or share
 */
export const CostumeDisplay = ({
  costumeUrl,
  spiritName,
  spiritId,
  transformations,
  onGameStart,
  onShare,
  isLoading = false,
}: CostumeDisplayProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [stickerImageUrl, setStickerImageUrl] = useState<string | null>(null)

  // Apply sticker overlay when image loads
  useEffect(() => {
    if (imageLoaded && costumeUrl && !stickerImageUrl) {
      apply_sticker_overlay()
    }
  }, [imageLoaded, costumeUrl, stickerImageUrl])

  const apply_sticker_overlay = async () => {
    try {
      const sticker_url = await StickerService.apply_sticker_to_image(
        costumeUrl,
        spiritId,
        'top-right'
      )
      setStickerImageUrl(sticker_url)
    } catch (error) {
      console.error('Failed to apply sticker:', error)
      // Continue without sticker if it fails
    }
  }

  const handle_image_load = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handle_image_error = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  return (
    <div className="costume-display-container">
      <div className="costume-header">
        <h2 className="costume-title">Your Cursed Transformation</h2>
        <p className="costume-subtitle">Behold your new form as {spiritName}</p>
      </div>

      {/* Costume Image */}
      <div className="costume-image-wrapper">
        {!imageLoaded && !imageError && (
          <div className="costume-loading">
            <div className="loading-spinner"></div>
            <p>Manifesting your costume...</p>
          </div>
        )}

        {imageError && (
          <div className="costume-error">
            <p>⚠️ Failed to load costume image</p>
            <p className="error-hint">Please try again</p>
          </div>
        )}

        {/* Hidden image for loading and sticker processing */}
        <img
          src={costumeUrl}
          alt={`${spiritName} Costume`}
          className="costume-image-hidden"
          onLoad={handle_image_load}
          onError={handle_image_error}
          style={{ display: 'none' }}
        />

        {/* Display image with sticker overlay */}
        <img
          src={stickerImageUrl || costumeUrl}
          alt={`${spiritName} Costume with Sticker`}
          className={`costume-image ${imageLoaded ? 'loaded' : ''}`}
        />

        {/* Costume Frame */}
        <div className="costume-frame" />
      </div>

      {/* Transformation Details */}
      <div className="transformation-details">
        <div className="detail-section">
          <h3 className="detail-title">Spirit</h3>
          <p className="detail-value">{spiritName}</p>
        </div>

        <div className="detail-section">
          <h3 className="detail-title">Transformations Applied</h3>
          <div className="transformations-list">
            {transformations.map((transformation, index) => (
              <span key={index} className="transformation-tag">
                ✨ {transformation}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="costume-actions">
        <button
          className="action-button play-game-btn"
          onClick={onGameStart}
          disabled={isLoading || !imageLoaded}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Loading...
            </>
          ) : (
            <>
              🎮 Play Mini-Game
            </>
          )}
        </button>

        <button
          className="action-button share-btn"
          onClick={onShare}
          disabled={isLoading || !imageLoaded}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Loading...
            </>
          ) : (
            <>
              📤 Share Costume
            </>
          )}
        </button>
      </div>

      {/* Flavor Text */}
      <div className="flavor-text">
        <p>
          {spiritId === 'ghost' && '👻 The phantom has claimed your form...'}
          {spiritId === 'vampire' && '🧛 Your mortal life has ended...'}
          {spiritId === 'witch' && '🧙 The magic flows through you...'}
          {spiritId === 'pumpkin_demon' && '🎃 The harvest has transformed you...'}
        </p>
      </div>
    </div>
  )
}

export default CostumeDisplay
