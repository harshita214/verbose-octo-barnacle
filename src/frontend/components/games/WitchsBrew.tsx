import { useState, useEffect } from 'react'
import '../../styles/WitchsBrew.css'

interface WitchsBrewProps {
  onComplete: (success: boolean) => void
  duration?: number
}

const INGREDIENTS = [
  { name: 'Eye of Newt', emoji: '👁️', id: 'eye' },
  { name: 'Bat Wing', emoji: '🦇', id: 'wing' },
  { name: 'Spider Web', emoji: '🕷️', id: 'web' },
  { name: 'Toad Skin', emoji: '🐸', id: 'toad' },
  { name: 'Raven Feather', emoji: '🪶', id: 'feather' },
  { name: 'Moonstone', emoji: '🌙', id: 'moon' },
]

const CORRECT_RECIPE = ['eye', 'wing', 'web'] // Correct order

/**
 * Witch's Brew Mini-Game
 * Select 3 ingredients in the correct order
 * 20 seconds to complete
 */
export const WitchsBrew = ({ onComplete, duration = 20000 }: WitchsBrewProps) => {
  const [timeLeft, setTimeLeft] = useState(duration / 1000)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [shuffledIngredients, setShuffledIngredients] = useState(INGREDIENTS)

  // Shuffle ingredients on mount
  useEffect(() => {
    const shuffled = [...INGREDIENTS].sort(() => Math.random() - 0.5)
    setShuffledIngredients(shuffled)
  }, [])

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

  // Check if recipe is complete
  useEffect(() => {
    if (selectedIngredients.length === CORRECT_RECIPE.length) {
      const is_correct = selectedIngredients.every(
        (ingredient, index) => ingredient === CORRECT_RECIPE[index]
      )

      if (is_correct) {
        setGameOver(true)
        setWon(true)
        onComplete(true)
      } else {
        // Wrong recipe - reset after a short delay
        setTimeout(() => {
          setSelectedIngredients([])
        }, 500)
      }
    }
  }, [selectedIngredients, onComplete])

  const handle_ingredient_click = (ingredient_id: string) => {
    if (gameOver || selectedIngredients.length >= CORRECT_RECIPE.length) return

    const new_selected = [...selectedIngredients, ingredient_id]
    setSelectedIngredients(new_selected)

    // Check if wrong ingredient was selected
    if (new_selected[new_selected.length - 1] !== CORRECT_RECIPE[new_selected.length - 1]) {
      // Wrong ingredient - visual feedback
      setTimeout(() => {
        setSelectedIngredients([])
      }, 500)
    }
  }

  const handle_clear = () => {
    setSelectedIngredients([])
  }

  const get_ingredient_name = (id: string) => {
    return INGREDIENTS.find(ing => ing.id === id)?.name || ''
  }

  const get_ingredient_emoji = (id: string) => {
    return INGREDIENTS.find(ing => ing.id === id)?.emoji || ''
  }

  return (
    <div className="mini-game-container witchs-brew">
      <div className="game-header">
        <h2 className="game-title">🧙 Witch's Brew</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">
              {selectedIngredients.length}/{CORRECT_RECIPE.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cauldron Display */}
      <div className="cauldron-container">
        <div className="cauldron">
          <div className="cauldron-liquid">
            {selectedIngredients.map((ingredient_id, index) => (
              <div key={index} className="ingredient-bubble">
                {get_ingredient_emoji(ingredient_id)}
              </div>
            ))}
          </div>
        </div>
        <div className="cauldron-label">Cauldron</div>
      </div>

      {/* Recipe Display */}
      <div className="recipe-display">
        <div className="recipe-label">Correct Recipe:</div>
        <div className="recipe-ingredients">
          {CORRECT_RECIPE.map((ingredient_id, index) => (
            <div key={index} className="recipe-step">
              <span className="step-number">{index + 1}</span>
              <span className="step-emoji">{get_ingredient_emoji(ingredient_id)}</span>
              <span className="step-name">{get_ingredient_name(ingredient_id)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredient Selection */}
      <div className="ingredient-selection">
        <div className="selection-label">Click ingredients to add to cauldron:</div>
        <div className="ingredients-grid">
          {shuffledIngredients.map(ingredient => (
            <button
              key={ingredient.id}
              className="ingredient-button"
              onClick={() => handle_ingredient_click(ingredient.id)}
              disabled={gameOver}
              title={ingredient.name}
            >
              <span className="ingredient-emoji">{ingredient.emoji}</span>
              <span className="ingredient-name">{ingredient.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <button
        className="clear-button"
        onClick={handle_clear}
        disabled={gameOver || selectedIngredients.length === 0}
      >
        🗑️ Clear Cauldron
      </button>

      {/* Game Result */}
      {gameOver && (
        <div className={`game-result ${won ? 'won' : 'lost'}`}>
          <h3>{won ? '🎉 Brew Complete!' : '❌ Brew Failed!'}</h3>
          <p>{won ? 'The potion is ready!' : 'Wrong recipe or time ran out!'}</p>
        </div>
      )}
    </div>
  )
}

export default WitchsBrew
