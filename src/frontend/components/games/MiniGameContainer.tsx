import { useState, useEffect } from 'react'
import { GhostChase } from './GhostChase'
import { PumpkinCipher } from './PumpkinCipher'
import { WitchsBrew } from './WitchsBrew'
import { SpellCast } from './SpellCast'
import '../../styles/MiniGameContainer.css'

interface MiniGameContainerProps {
  spiritId: string
  selectedGame: string
  onGameComplete: (success: boolean) => void
  onRetry?: () => void
}

/**
 * MiniGameContainer Component
 * Dynamically loads and renders the appropriate mini-game based on spirit ID
 * Routes: ghost → GhostChase, vampire/pumpkin_demon → PumpkinCipher, witch → WitchsBrew
 */
export const MiniGameContainer = ({
  spiritId,
  selectedGame,
  onGameComplete,
  onRetry,
}: MiniGameContainerProps) => {
  const [gameKey, setGameKey] = useState(0)
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'complete'>('loading')
  const [gameResult, setGameResult] = useState<boolean | null>(null)

  // Get spirit name for display
  const get_spirit_name = (spirit_id: string): string => {
    const spirit_names: Record<string, string> = {
      ghost: 'Phantom',
      vampire: 'Nosferatu',
      witch: 'Enchantress',
      pumpkin_demon: "Jack O'Malice",
    }
    return spirit_names[spirit_id] || 'Unknown Spirit'
  }

  // Get game name for display
  const get_game_name = (game_type: string): string => {
    const game_names: Record<string, string> = {
      ghost_chase: 'Ghost Chase',
      pumpkin_cipher: 'Pumpkin Cipher',
      witchs_brew: "Witch's Brew",
      spell_cast: 'Spell Cast',
    }
    return game_names[game_type] || 'Challenge'
  }

  // Initialize game on mount or when selectedGame changes
  useEffect(() => {
    setGameState('loading')
    setGameResult(null)
    setGameKey(prev => prev + 1)

    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setGameState('playing')
    }, 500)

    return () => clearTimeout(timer)
  }, [selectedGame])

  // Handle game completion
  const handle_game_complete = (success: boolean) => {
    setGameResult(success)
    setGameState('complete')
    onGameComplete(success)
  }

  // Handle retry
  const handle_retry = () => {
    setGameKey(prev => prev + 1)
    setGameState('loading')
    setGameResult(null)

    const timer = setTimeout(() => {
      setGameState('playing')
    }, 500)

    if (onRetry) {
      onRetry()
    }

    return () => clearTimeout(timer)
  }

  const spirit_name = get_spirit_name(spiritId)
  const game_name = get_game_name(selectedGame)

  return (
    <div className="mini-game-container-wrapper">
      <div className="mini-game-header">
        <h1 className="mini-game-title">
          {game_name}
        </h1>
        <p className="mini-game-subtitle">Complete to break the curse!</p>
      </div>

      {gameState === 'loading' && (
        <div className="game-loading">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
          </div>
          <p>Summoning the curse...</p>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="game-content" key={gameKey}>
          {selectedGame === 'ghost_chase' && (
            <GhostChase onComplete={handle_game_complete} />
          )}
          {selectedGame === 'pumpkin_cipher' && (
            <PumpkinCipher onComplete={handle_game_complete} />
          )}
          {selectedGame === 'witchs_brew' && (
            <WitchsBrew onComplete={handle_game_complete} />
          )}
          {selectedGame === 'spell_cast' && (
            <SpellCast onComplete={handle_game_complete} />
          )}
        </div>
      )}

      {gameState === 'complete' && (
        <div className={`game-completion ${gameResult ? 'success' : 'failure'}`}>
          <div className="completion-content">
            {gameResult ? (
              <>
                <div className="completion-icon">🎉</div>
                <h2>Curse Broken!</h2>
                <p>You've defeated {spirit_name}'s curse!</p>
              </>
            ) : (
              <>
                <div className="completion-icon">👻</div>
                <h2>Curse Remains...</h2>
                <p>The curse is still strong. Try again!</p>
              </>
            )}
          </div>

          <div className="completion-actions">
            <button className="retry-button" onClick={handle_retry}>
              🔄 Try Again
            </button>
            {gameResult && (
              <button className="continue-button" onClick={() => onGameComplete(true)}>
                ✨ Continue
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MiniGameContainer
