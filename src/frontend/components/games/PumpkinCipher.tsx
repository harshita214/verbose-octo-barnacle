import { useState, useEffect } from 'react'
import '../../styles/PumpkinCipher.css'

interface PumpkinCipherProps {
  onComplete: (success: boolean) => void
  duration?: number
}

const RUNES = ['🔮', '✨', '🌙', '⭐', '🎃', '👻']
const TARGET_SEQUENCE = [0, 2, 4, 1, 3, 5] // Indices of runes to match

/**
 * Pumpkin Cipher Mini-Game
 * Drag runes to match the target sequence
 * 15 seconds to complete
 */
export const PumpkinCipher = ({ onComplete, duration = 15000 }: PumpkinCipherProps) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000)
  const [currentSequence, setCurrentSequence] = useState<number[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [draggedRune, setDraggedRune] = useState<number | null>(null)

  // Timer
  useEffect(() => {
    const start_time = Date.now()

    const timer = setInterval(() => {
      const elapsed = Date.now() - start_time
      const time_remaining = Math.max(0, duration - elapsed)

      setTimeLeft(Math.ceil(time_remaining / 1000))

      if (time_remaining <= 0) {
        setGameOver(true)
        setWon(false)
        onComplete(false)
        clearInterval(timer)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [duration, onComplete])

  // Check if sequence is complete
  useEffect(() => {
    if (currentSequence.length === TARGET_SEQUENCE.length) {
      const is_correct = currentSequence.every((rune, index) => rune === TARGET_SEQUENCE[index])

      if (is_correct) {
        setGameOver(true)
        setWon(true)
        onComplete(true)
      }
    }
  }, [currentSequence, onComplete])

  const handle_rune_click = (rune_index: number) => {
    if (gameOver) return

    const new_sequence = [...currentSequence, rune_index]
    setCurrentSequence(new_sequence)

    // Check if wrong rune was selected
    if (new_sequence[new_sequence.length - 1] !== TARGET_SEQUENCE[new_sequence.length - 1]) {
      // Wrong rune - reset after a short delay
      setTimeout(() => {
        setCurrentSequence([])
      }, 500)
    }
  }

  const handle_undo = () => {
    if (currentSequence.length > 0) {
      setCurrentSequence(currentSequence.slice(0, -1))
    }
  }

  return (
    <div className="mini-game-container pumpkin-cipher">
      <div className="game-header">
        <h2 className="game-title">🎃 Pumpkin Cipher</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">
              {currentSequence.length}/{TARGET_SEQUENCE.length}
            </span>
          </div>
        </div>
      </div>

      {/* Target Sequence Display */}
      <div className="sequence-display">
        <div className="sequence-label">Match this sequence:</div>
        <div className="target-sequence">
          {TARGET_SEQUENCE.map((rune_index, index) => (
            <div key={index} className="target-rune">
              {RUNES[rune_index]}
            </div>
          ))}
        </div>
      </div>

      {/* Current Sequence Display */}
      <div className="current-sequence">
        <div className="sequence-label">Your sequence:</div>
        <div className="sequence-runes">
          {currentSequence.map((rune_index, index) => (
            <div key={index} className="current-rune">
              {RUNES[rune_index]}
            </div>
          ))}
          {currentSequence.length < TARGET_SEQUENCE.length && (
            <div className="empty-slot">?</div>
          )}
        </div>
      </div>

      {/* Rune Selection */}
      <div className="rune-selection">
        <div className="selection-label">Click runes in order:</div>
        <div className="runes-grid">
          {RUNES.map((rune, index) => (
            <button
              key={index}
              className="rune-button"
              onClick={() => handle_rune_click(index)}
              disabled={gameOver}
            >
              {rune}
            </button>
          ))}
        </div>
      </div>

      {/* Undo Button */}
      <button
        className="undo-button"
        onClick={handle_undo}
        disabled={gameOver || currentSequence.length === 0}
      >
        ↶ Undo
      </button>

      {/* Game Result */}
      {gameOver && (
        <div className={`game-result ${won ? 'won' : 'lost'}`}>
          <h3>{won ? '🎉 Cipher Solved!' : '❌ Cipher Failed!'}</h3>
          <p>{won ? 'You matched the sequence!' : 'Time ran out or wrong sequence!'}</p>
        </div>
      )}
    </div>
  )
}

export default PumpkinCipher
