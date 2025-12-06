import { useState, useEffect, useRef } from 'react'
import '../../styles/GhostChase.css'

interface GhostChaseProps {
  onComplete: (success: boolean) => void
  duration?: number
}

interface Ghost {
  x: number
  y: number
  vx: number
  vy: number
}

/**
 * Ghost Chase Mini-Game
 * Player must avoid ghosts for 10 seconds
 * Canvas-based game with collision detection
 */
export const GhostChase = ({ onComplete, duration = 10000 }: GhostChaseProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [timeLeft, setTimeLeft] = useState(duration / 1000)
  const [gameOver, setGameOver] = useState(false)
  const [won, setWon] = useState(false)
  const [difficulty, setDifficulty] = useState(0.25)
  const [gameStarted, setGameStarted] = useState(false)

  const gameStateRef = useRef({
    playerX: 0,
    playerY: 0,
    ghosts: [] as Ghost[],
    gameActive: true,
    startTime: Date.now(),
  })

  // Initialize canvas and setup event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !gameStarted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Initialize player
    gameStateRef.current.playerX = canvas.width / 2
    gameStateRef.current.playerY = canvas.height / 2
    gameStateRef.current.gameActive = true
    gameStateRef.current.startTime = Date.now()

    // Initialize ghosts
    gameStateRef.current.ghosts = [
      { x: 50, y: 50, vx: 2, vy: 1 },
      { x: canvas.width - 50, y: 50, vx: -2, vy: 1.5 },
      { x: 50, y: canvas.height - 50, vx: 1.5, vy: -2 },
      { x: canvas.width - 50, y: canvas.height - 50, vx: -1.5, vy: -1 },
    ]

    // Handle mouse movement
    const handle_mouse_move = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      gameStateRef.current.playerX = e.clientX - rect.left
      gameStateRef.current.playerY = e.clientY - rect.top
    }

    canvas.addEventListener('mousemove', handle_mouse_move)

    // Game loop
    const game_loop = () => {
      if (!gameStateRef.current.gameActive) return

      const elapsed = Date.now() - gameStateRef.current.startTime
      const time_remaining = Math.max(0, duration - elapsed)

      setTimeLeft(Math.ceil(time_remaining / 1000))

      // Check if time is up
      if (time_remaining <= 0) {
        gameStateRef.current.gameActive = false
        setGameOver(true)
        setWon(true)
        onComplete(true)
        return
      }

      // Update ghosts with difficulty multiplier
      gameStateRef.current.ghosts.forEach(ghost => {
        ghost.x += ghost.vx * difficulty
        ghost.y += ghost.vy * difficulty

        // Bounce off walls
        if (ghost.x < 0 || ghost.x > canvas.width) ghost.vx *= -1
        if (ghost.y < 0 || ghost.y > canvas.height) ghost.vy *= -1

        // Keep in bounds
        ghost.x = Math.max(0, Math.min(canvas.width, ghost.x))
        ghost.y = Math.max(0, Math.min(canvas.height, ghost.y))
      })

      // Check collisions
      gameStateRef.current.ghosts.forEach(ghost => {
        const dx = gameStateRef.current.playerX - ghost.x
        const dy = gameStateRef.current.playerY - ghost.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 30) {
          // Collision detected
          gameStateRef.current.gameActive = false
          setGameOver(true)
          setWon(false)
          onComplete(false)
        }
      })

      // Draw game
      draw_game(ctx, canvas)

      requestAnimationFrame(game_loop)
    }

    const frame = requestAnimationFrame(game_loop)

    return () => {
      canvas.removeEventListener('mousemove', handle_mouse_move)
      cancelAnimationFrame(frame)
    }
  }, [gameStarted, duration, difficulty, onComplete])

  const draw_game = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    // Clear canvas
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw ghosts
    gameStateRef.current.ghosts.forEach((ghost, index) => {
      ctx.fillStyle = `hsl(${120 + index * 60}, 100%, 50%)`
      ctx.beginPath()
      ctx.arc(ghost.x, ghost.y, 15, 0, Math.PI * 2)
      ctx.fill()

      // Ghost eyes
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(ghost.x - 5, ghost.y - 5, 3, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(ghost.x + 5, ghost.y - 5, 3, 0, Math.PI * 2)
      ctx.fill()

      // Ghost mouth
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(ghost.x, ghost.y + 3, 5, 0, Math.PI)
      ctx.stroke()
    })

    // Draw player
    ctx.fillStyle = '#00ff41'
    ctx.beginPath()
    ctx.arc(gameStateRef.current.playerX, gameStateRef.current.playerY, 12, 0, Math.PI * 2)
    ctx.fill()

    // Player glow
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.5)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(gameStateRef.current.playerX, gameStateRef.current.playerY, 18, 0, Math.PI * 2)
    ctx.stroke()
  }

  return (
    <div className="mini-game-container ghost-chase">
      <div className="game-header">
        <h2 className="game-title">👻 Escape the Phantom</h2>
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Time:</span>
            <span className="stat-value">{timeLeft}s</span>
          </div>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="difficulty-selector">
          <label className="difficulty-label">
            Speed: {difficulty === 0.25 ? '🐌 Super Duper Slow' : difficulty === 0.5 ? '🐢 Slow' : difficulty === 1 ? '🏃 Normal' : '⚡ Fast'}
          </label>
          <input
            type="range"
            min="0.25"
            max="3"
            step="0.25"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="difficulty-slider"
          />
          <button
            className="start-button"
            onClick={() => setGameStarted(true)}
          >
            Start Game
          </button>
        </div>
      )}

      {gameStarted && (
        <canvas
          ref={canvasRef}
          className="game-canvas"
          style={{ width: '100%', height: '220px' }}
        />
      )}

      {gameStarted && !gameOver && (
        <div className="game-instructions">
          <p>Move your cursor to avoid the ghosts!</p>
        </div>
      )}

      {gameOver && (
        <div className={`game-result ${won ? 'won' : 'lost'}`}>
          <h3>{won ? '🎉 You Survived!' : '👻 Caught by a Ghost!'}</h3>
          <p>{won ? 'You escaped the phantom!' : 'The ghost caught you!'}</p>
        </div>
      )}
    </div>
  )
}

export default GhostChase
