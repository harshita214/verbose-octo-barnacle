import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import curse_router from './routes/curseRoutes.js'
import haunt_router from './routes/hauntRoutes.js'
import summon_router from './routes/summonRoutes.js'
import share_router from './routes/shareRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { sessionManager } from './middleware/sessionManager.js'
import { request_logger, request_id_middleware } from './middleware/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware - Logging & Request ID
app.use(request_id_middleware)
app.use(request_logger)

// Middleware - Parsing
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Middleware - Session Management
app.use(sessionManager)

// Middleware - Static Files
// __dirname is /haunthub/src/backend, so we need to go up 2 levels to reach /haunthub
const public_dir = path.join(__dirname, '../../public')
const costumes_dir = path.join(public_dir, 'costumes')

app.use(express.static(public_dir))
app.use('/costumes', express.static(costumes_dir, { 
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Cache-Control', 'public, max-age=3600')
  }
}))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'HauntHub is alive! 👻' })
})

// Costume file serving route (explicit handler)
app.get('/costumes/:filename', (req, res) => {
  const filename = req.params.filename
  const filepath = path.join(costumes_dir, filename)
  
  // Security: prevent directory traversal
  if (!filepath.startsWith(costumes_dir)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Content-Type', 'image/jpeg')
  res.sendFile(filepath, (err) => {
    if (err) {
      console.error(`Failed to send file ${filename}:`, err)
      res.status(404).json({ error: 'File not found' })
    }
  })
})

// Routes
app.use('/api/curse', curse_router)
app.use('/api/haunt', haunt_router)
app.use('/api/summon', summon_router)
app.use('/api/share', share_router)

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🎃 HauntHub backend running on http://localhost:${PORT}`)
})

export default app
