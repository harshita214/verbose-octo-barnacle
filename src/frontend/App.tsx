import { useState } from 'react'
import { UploadSpirit } from './components/spirits/UploadSpirit'
import { PossessHUD } from './components/glitch/PossessHUD'
import { MiniGameContainer } from './components/games/MiniGameContainer'
import { ShareCostume } from './components/glitch/ShareCostume'
import { ErrorBoundary } from './components/glitch/ErrorBoundary'
import { StickerVariants } from './components/glitch/StickerVariants'
import './styles/App.css'

type GamePhase = 'upload' | 'possession' | 'costume' | 'game' | 'share' | 'complete'
type GameMode = 'angel' | 'devil'
type GameType = 'ghost_chase' | 'pumpkin_cipher' | 'witchs_brew' | 'spell_cast'

interface GameState {
  sessionId: string | null
  spiritId: string | null
  costumeUrl: string | null
  gameCompleted: boolean
  selectedGame: GameType | null
}

/**
 * HauntHub Main App Component
 * Orchestrates the complete game flow:
 * Upload → Spirit Select → Possession → Costume → Mini-Game → Share
 */
function App() {
  const [gamePhase, setGamePhase] = useState<GamePhase>('upload')
  const [gameMode, setGameMode] = useState<GameMode>('devil')
  const [gameState, setGameState] = useState<GameState>({
    sessionId: null,
    spiritId: null,
    costumeUrl: null,
    gameCompleted: false,
    selectedGame: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle upload completion
  const handle_upload_complete = async (file: File, spiritId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Upload file to backend
      const formData = new FormData()
      formData.append('image', file)
      formData.append('spiritId', spiritId)

      const response = await fetch('/api/haunt/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      if (data.success && data.data?.sessionId) {
        setGameState(prev => ({ ...prev, sessionId: data.data.sessionId, spiritId }))
        setGamePhase('possession')
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      const error_message = err instanceof Error ? err.message : 'Upload failed'
      setError(error_message)
      console.error('Upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle possession completion
  const handle_possession_complete = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Generate costume
      const response = await fetch('/api/haunt/costume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spiritId: gameState.spiritId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate costume')
      }

      const data = await response.json()
      const costume_url = data.data.costumeUrl
      // Use the costume URL directly - it's a relative path that will be resolved by the browser
      setGameState(prev => ({ ...prev, costumeUrl: costume_url }))
      setGamePhase('costume')
    } catch (err) {
      const error_message = err instanceof Error ? err.message : 'Unknown error'
      setError(error_message)
      console.error('Costume generation error:', err)
    } finally {
      setIsLoading(false)
    }
  }



  // Handle mini-game completion
  const handle_game_complete = (success: boolean) => {
    if (success) {
      setGameState(prev => ({ ...prev, gameCompleted: true }))
      setGamePhase('share')
    } else {
      // Allow retry
      setGamePhase('game')
    }
  }

  // Handle share completion
  const handle_share_complete = () => {
    setGamePhase('complete')
  }

  // Handle restart
  const handle_restart = () => {
    setGameState({
      sessionId: null,
      spiritId: null,
      costumeUrl: null,
      gameCompleted: false,
      selectedGame: null,
    })
    setGamePhase('upload')
    setError(null)
  }

  return (
    <ErrorBoundary onError={(error, info) => console.error('App error:', error, info)}>
      <div className={`haunt-app mode-${gameMode}`}>
        {/* Game Console Bezel */}
        <div className="console-bezel">
          {/* Header */}
          <header className="haunt-header">
            <div className="header-content">
              <h1 className="header-title">🎃 Halloween Vintage Booth 📸</h1>
            </div>
            <div className="header-phase">
              <span className="phase-indicator">{gamePhase.replace('_', ' ').toUpperCase()}</span>
            </div>
          </header>

        {/* Main Content */}
        <main className="haunt-main">
          {/* Booth Handle - Mode Toggle */}
          <div className="booth-handle">
            <button 
              className={`handle-btn ${gameMode === 'angel' ? 'active' : ''}`}
              onClick={() => setGameMode('angel')}
              title="Angel Mode"
            >
              😇 Angel
            </button>
            <button 
              className={`handle-btn ${gameMode === 'devil' ? 'active' : ''}`}
              onClick={() => setGameMode('devil')}
              title="Devil Mode"
            >
              😈 Devil
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button className="error-close" onClick={() => setError(null)}>
                ✕
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
              <p className="loading-text">Summoning the curse...</p>
            </div>
          )}

          {/* Phase: Upload */}
          {gamePhase === 'upload' && (
            <section className="phase-section upload-phase">
              <UploadSpirit onUpload={handle_upload_complete} isLoading={isLoading} />
            </section>
          )}

          {/* Phase: Possession */}
          {gamePhase === 'possession' && gameState.spiritId && (
            <section className="phase-section possession-phase">
              <PossessHUD
                spiritId={gameState.spiritId}
                spiritName={
                  {
                    ghost: 'Phantom',
                    vampire: 'Nosferatu',
                    witch: 'Enchantress',
                    pumpkin_demon: "Jack O'Malice",
                  }[gameState.spiritId] || 'Unknown Spirit'
                }
                onComplete={handle_possession_complete}
              />
            </section>
          )}

          {/* Phase: Costume Display with Game Options */}
          {(gamePhase === 'costume' || gamePhase === 'game') && gameState.costumeUrl && gameState.spiritId && (
            <section className="phase-section costume-phase">
              {gamePhase === 'costume' && (
                <div className="costume-game-layout">
                  {/* Sticker Previews - Multiple Variants */}
                  {gameState.costumeUrl && gameState.spiritId && (
                    <StickerVariants imageUrl={gameState.costumeUrl} spiritId={gameState.spiritId} />
                  )}

                  {/* Game Options */}
                  <div className="game-options-container">
                    <h3 className="game-options-title">Choose Your Challenge</h3>
                    <div className="game-options-grid">
                      <button
                        className="game-option-btn"
                        onClick={() => {
                          setGameState(prev => ({ ...prev, selectedGame: 'ghost_chase' }))
                          setGamePhase('game')
                        }}
                        title="Ghost Chase"
                      >
                        <span className="game-emoji">👻</span>
                        <span className="game-name">Chase</span>
                      </button>
                      <button
                        className="game-option-btn"
                        onClick={() => {
                          setGameState(prev => ({ ...prev, selectedGame: 'pumpkin_cipher' }))
                          setGamePhase('game')
                        }}
                        title="Pumpkin Cipher"
                      >
                        <span className="game-emoji">🎃</span>
                        <span className="game-name">Cipher</span>
                      </button>
                      <button
                        className="game-option-btn"
                        onClick={() => {
                          setGameState(prev => ({ ...prev, selectedGame: 'witchs_brew' }))
                          setGamePhase('game')
                        }}
                        title="Witch's Brew"
                      >
                        <span className="game-emoji">🧙</span>
                        <span className="game-name">Brew</span>
                      </button>
                      <button
                        className="game-option-btn"
                        onClick={() => {
                          setGameState(prev => ({ ...prev, selectedGame: 'spell_cast' }))
                          setGamePhase('game')
                        }}
                        title="Spell Cast"
                      >
                        <span className="game-emoji">✨</span>
                        <span className="game-name">Spell</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {gamePhase === 'game' && gameState.selectedGame && (
                <MiniGameContainer
                  spiritId={gameState.spiritId}
                  selectedGame={gameState.selectedGame}
                  onGameComplete={handle_game_complete}
                />
              )}
            </section>
          )}

          {/* Phase: Share */}
          {gamePhase === 'share' && gameState.costumeUrl && gameState.spiritId && (
            <section className="phase-section share-phase">
              <ShareCostume
                costumeUrl={gameState.costumeUrl}
                spiritId={gameState.spiritId}
                spiritName={
                  {
                    ghost: 'Phantom',
                    vampire: 'Nosferatu',
                    witch: 'Enchantress',
                    pumpkin_demon: "Jack O'Malice",
                  }[gameState.spiritId] || 'Unknown Spirit'
                }
                onShare={handle_share_complete}
              />
            </section>
          )}

          {/* Phase: Complete */}
          {gamePhase === 'complete' && (
            <section className="phase-section complete-phase">
              <div className="completion-container">
                <div className="completion-icon">🎉</div>
                <h2 className="completion-title">Curse Complete!</h2>
                <p className="completion-message">
                  You've successfully summoned a spirit and broken the curse!
                </p>
                <button className="restart-button" onClick={handle_restart}>
                  🔄 Summon Another Spirit
                </button>
              </div>
            </section>
          )}
        </main>

          {/* Footer with Booth Modes */}
          <footer className="haunt-footer">
            <div className="booth-modes">
              <button className="booth-mode-btn" title="Classic Mode">📷</button>
              <button className="booth-mode-btn" title="Vintage Mode">🎞️</button>
              <button className="booth-mode-btn" title="Spooky Mode">👻</button>
              <button className="booth-mode-btn" title="Glitch Mode">✨</button>
            </div>
            <p className="footer-text">
              Halloween Vintage Booth © 2024 | Kiroween Hackathon
            </p>
          </footer>
        </div>
        {/* End Console Bezel */}
      </div>
    </ErrorBoundary>
  )
}

export default App
