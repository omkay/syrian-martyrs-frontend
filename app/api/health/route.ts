import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
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

    return NextResponse.json({
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
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
