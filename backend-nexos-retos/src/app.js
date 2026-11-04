import cors from 'cors'
import express from 'express'
import pool from './config/database.js'
import apiRoutes from './routes/api.routes.js'
import authRoutes from './routes/auth.routes.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'

app.use(cors({ origin: allowedOrigin }))
app.use(express.json({ limit: '1mb' }))

app.use('/api/auth', authRoutes)

app.get('/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    next(error)
  }
})

app.use('/api', apiRoutes)
app.use((_req, res) => res.status(404).json({ error: { message: 'Ruta no encontrada.' } }))
app.use(errorHandler)

export default app
