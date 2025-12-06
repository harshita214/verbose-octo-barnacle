import { useState, useEffect, useRef } from 'react'
import '../../styles/SpellCast.css'

interface SpellCastProps {
  onComplete: (success: boolean) => void
}

interface Circle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

/**
 * SpellCast Game Component
 * Move fast and click the moving circles to score points
 */
export const SpellCast = ({ onComplete }: SpellCastProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameActive, setGameActive] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [circles, setCircles] = useState<Circle[]>([])
  const circlesRef = useRef<Circle[]>([])
  const scoreRef = useRef(0)
  const gameActiveRef = useRef(true)
  const idRef = useRef(0)

  const CANVAS_WIDTH = 220
  const CANVAS_HEIGHT = 220
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A']

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Create initial circles
    const initialCircles: Circle[] = []
    for (let i = 0; i < 4; i++) {
      initialCircles.push({
        id: idRef.current++,
        x: Math.random() * (CANVAS_WIDTH - 40) + 20,
        y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 12,
        color: colors[i],
      })
    }
    circlesRef.current = initialCircles
    setCircles(initialCircles)

    // Game loop
    const gameLoop = setInterval(() => {
      if (!gameActiveRef.current) return

      // Update circles
      circlesRef.current.forEach(circle => {
        circle.x += circle.vx
        circle.y += circle.vy

        // Bounce off walls
        if (circle.x - circle.radius < 0 || circle.x + circle.radius > CANVAS_WIDTH) {
          circle.vx *= -1
          circle.x = Math.max(circle.radius, Math.min(CANVAS_WIDTH - circle.radius, circle.x))
        }
        if (circle.y - circle.radius < 0 || circle.y + circle.radius > CANVAS_HEIGHT) {
          circle.vy *= -1
          circle.y = Math.max(circle.radius, Math.min(CANVAS_HEIGHT - circle.radius, circle.y))
        }
      })

      // Draw
      ctx.fillStyle = 'rgba(26, 26, 26, 0.8)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw border
      ctx.strokeStyle = '#00ff41'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw circles
      circlesRef.current.forEach(circle => {
        ctx.fillStyle = circle.color
        ctx.beginPath()
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2)
        ctx.fill()

        // Glow effect
        ctx.strokeStyle = circle.color
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.5
        ctx.stroke()
        ctx.globalAlpha = 1
      })

      setCircles([...circlesRef.current])
    }, 30)

    return () => clearInterval(gameLoop)
  }, [])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameActiveRef.current || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Check if clicked on any circle
    for (let i = 0; i < circlesRef.current.length; i++) {
      const circle = circlesRef.current[i]
      const dist = Math.sqrt((x - circle.x) ** 2 + (y - circle.y) ** 2)

      if (dist < circle.radius) {
        // Hit! Remove circle and add score
        scoreRef.current += 10
        setScore(scoreRef.current)

        // Remove clicked circle
        circlesRef.current.splice(i, 1)

        // Add new circle
        const newCircle: Circle = {
          id: idRef.current++,
          x: Math.random() * (CANVAS_WIDTH - 40) + 20,
          y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          radius: 12,
          color: colors[Math.floor(Math.random() * colors.length)],
        }
        circlesRef.current.push(newCircle)

        // Check win condition
        if (scoreRef.current >= 50) {
          gameActiveRef.current = false
          setGameActive(false)
          setGameOver(true)
          onComplete(true)
        }
        break
      }
    }
  }

  return (
    <div className="spell-cast">
      <div className="spell-header">
        <div className="spell-score">Score: {score}</div>
        <div className="spell-message">Click the circles!</div>
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="spell-canvas"
        onClick={handleCanvasClick}
      />

      {gameOver && (
        <div className="spell-result won">
          <p>✨ Victory! Score: {score}</p>
        </div>
      )}
    </div>
  )
}

export default SpellCast
