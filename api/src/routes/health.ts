import { Router } from 'express'
import { prisma } from '../../lib/db'

const router = Router()

router.get('/', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Get basic stats
    const stats = await Promise.all([
      prisma.martyr.count(),
      prisma.user.count(),
      prisma.testimonial.count(),
      prisma.source.count(),
      prisma.contribution.count()
    ])

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      stats: {
        martyrs: stats[0],
        users: stats[1],
        testimonials: stats[2],
        sources: stats[3],
        contributions: stats[4]
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

export default router

