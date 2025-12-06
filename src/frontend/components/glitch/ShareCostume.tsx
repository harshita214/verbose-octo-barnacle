import { useState } from 'react'
import '../../styles/ShareCostume.css'

interface ShareCostumeProps {
  costumeUrl: string
  spiritName: string
  spiritId: string
  onShare?: (shareUrl: string) => void
}

/**
 * ShareCostume Component
 * Displays costume with download and social media share options
 * Follows spooky naming: possess_share, glitch_share
 */
export const ShareCostume = ({
  costumeUrl,
  spiritName,
  spiritId,
  onShare,
}: ShareCostumeProps) => {
  const [playerNickname, setPlayerNickname] = useState('Anonymous Haunted Soul')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [downloadFormat, setDownloadFormat] = useState<'png' | 'jpg'>('png')
  const [copied, setCopied] = useState(false)

  // Generate share text for social media
  const generate_share_text = (): string => {
    return `I just got cursed by ${spiritName} on HauntHub! 👻 Can you break the curse? #HauntHub #Halloween`
  }

  // Handle costume sharing
  const handle_share_costume = async () => {
    setIsSharing(true)
    try {
      const response = await fetch('/api/share/costume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          costumeUrl,
          playerNickname,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to share costume')
      }

      const data = await response.json()
      const generated_share_url = data.data.shareUrl

      setShareUrl(generated_share_url)

      if (onShare) {
        onShare(generated_share_url)
      }
    } catch (error) {
      console.error('Share error:', error)
      alert('Failed to share costume. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  // Copy share URL to clipboard
  const handle_copy_url = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy error:', error)
      alert('Failed to copy URL')
    }
  }

  // Download costume
  const handle_download = async () => {
    try {
      const response = await fetch('/api/share/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          costumeUrl,
          format: downloadFormat,
          filename: `haunthub_${spiritName.toLowerCase()}_${playerNickname.toLowerCase()}.${downloadFormat}`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to download costume')
      }

      // In a real implementation, this would trigger a file download
      // For now, we'll show a success message
      alert(`Costume download prepared as ${downloadFormat.toUpperCase()}!`)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download costume. Please try again.')
    }
  }

  // Social media share handlers
  const handle_twitter_share = () => {
    const text = generate_share_text()
    const url = shareUrl || window.location.href
    const twitter_url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    window.open(twitter_url, '_blank', 'width=550,height=420')
  }

  const handle_facebook_share = () => {
    const url = shareUrl || window.location.href
    const facebook_url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebook_url, '_blank', 'width=550,height=420')
  }

  const handle_instagram_share = () => {
    const text = generate_share_text()
    alert(`Share on Instagram:\n\n${text}\n\nCopy the link: ${shareUrl || window.location.href}`)
  }

  return (
    <div className="share-costume-container">
      <div className="share-header">
        <h2 className="share-title">✨ Share Your Cursed Costume</h2>
        <p className="share-subtitle">Show off your {spiritName} transformation!</p>
      </div>

      {/* Costume Preview */}
      <div className="costume-preview-section">
        <div className="costume-preview">
          <img src={costumeUrl} alt={`${spiritName} Costume`} className="costume-image" />
          <div className="costume-overlay">
            <span className="costume-spirit">{spiritName}</span>
          </div>
        </div>
      </div>

      {/* Player Nickname Input */}
      <div className="nickname-section">
        <label htmlFor="player-nickname" className="nickname-label">
          Your Name (for sharing):
        </label>
        <input
          id="player-nickname"
          type="text"
          className="nickname-input"
          value={playerNickname}
          onChange={e => setPlayerNickname(e.target.value)}
          placeholder="Enter your spooky name"
          maxLength={50}
        />
      </div>

      {/* Share Button */}
      {!shareUrl && (
        <button
          className="share-button"
          onClick={handle_share_costume}
          disabled={isSharing}
        >
          {isSharing ? '🔄 Generating Share Link...' : '🔗 Generate Share Link'}
        </button>
      )}

      {/* Share URL Display */}
      {shareUrl && (
        <div className="share-url-section">
          <div className="share-url-box">
            <input
              type="text"
              className="share-url-input"
              value={shareUrl}
              readOnly
            />
            <button
              className="copy-button"
              onClick={handle_copy_url}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p className="share-url-hint">Share this link with friends!</p>
        </div>
      )}

      {/* Download Section */}
      <div className="download-section">
        <div className="download-header">
          <h3 className="download-title">📥 Download Costume</h3>
          <div className="format-selector">
            <label htmlFor="format-select" className="format-label">
              Format:
            </label>
            <select
              id="format-select"
              className="format-select"
              value={downloadFormat}
              onChange={e => setDownloadFormat(e.target.value as 'png' | 'jpg')}
            >
              <option value="png">PNG (High Quality)</option>
              <option value="jpg">JPG (Smaller Size)</option>
            </select>
          </div>
        </div>
        <button className="download-button" onClick={handle_download}>
          ⬇️ Download as {downloadFormat.toUpperCase()}
        </button>
      </div>

      {/* Social Media Share Section */}
      {shareUrl && (
        <div className="social-share-section">
          <h3 className="social-title">👻 Share on Social Media</h3>
          <div className="social-buttons">
            <button
              className="social-button twitter"
              onClick={handle_twitter_share}
              title="Share on Twitter"
            >
              𝕏 Twitter
            </button>
            <button
              className="social-button facebook"
              onClick={handle_facebook_share}
              title="Share on Facebook"
            >
              f Facebook
            </button>
            <button
              className="social-button instagram"
              onClick={handle_instagram_share}
              title="Share on Instagram"
            >
              📷 Instagram
            </button>
          </div>
          <p className="social-hint">
            Pre-formatted message: "{generate_share_text()}"
          </p>
        </div>
      )}

      {/* Share Stats */}
      <div className="share-stats">
        <div className="stat-item">
          <span className="stat-icon">👻</span>
          <span className="stat-text">Spirit: {spiritName}</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">⏰</span>
          <span className="stat-text">Created: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}

export default ShareCostume
