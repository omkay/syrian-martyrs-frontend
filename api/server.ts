import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { PrismaClient } from './lib/generated/prisma'
import { authMiddleware } from './src/middleware/auth'
import { errorHandler } from './src/middleware/errorHandler'

// Import routes
import authRoutes from './src/routes/auth'
import healthRoutes from './src/routes/health'
import contributionRoutes from './src/routes/contributions'
import adminRoutes from './src/routes/admin'
import martyrsRoutes from './src/routes/martyrs'

const app = express()
const prisma = new PrismaClient()

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api' })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/contributions', contributionRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/martyrs', martyrsRoutes)

// Error handling
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  await prisma.$disconnect()
  process.exit(0)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app

