import { Router } from 'express'
import { PrismaClient } from '../../lib/generated/prisma'
import { adminMiddleware, requirePermission, AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// GET /api/admin/contributions - Get all contributions for admin review
router.get('/contributions', requirePermission('VIEW_ALL_CONTRIBUTIONS'), async (req: AuthenticatedRequest, res) => {
  try {
    const status = req.query.status as string
    const type = req.query.type as string
    const page = parseInt(req.query.page as string || '1')
    const limit = parseInt(req.query.limit as string || '10')

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (type) {
      where.type = type
    }

    // Get contributions with pagination
    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          martyr: {
            select: {
              id: true,
              name: true
            }
          },
          profile: {
            select: {
              id: true,
              userId: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.contribution.count({ where })
    ])

    res.json({
      contributions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching contributions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/admin/stats - Get admin statistics
router.get('/stats', requirePermission('VIEW_ADMIN_STATS'), async (req: AuthenticatedRequest, res) => {
  try {
    const stats = await Promise.all([
      prisma.martyr.count(),
      prisma.user.count(),
      prisma.testimonial.count(),
      prisma.source.count(),
      prisma.contribution.count(),
      prisma.contribution.count({ where: { status: 'PENDING' } }),
      prisma.contribution.count({ where: { status: 'APPROVED' } }),
      prisma.contribution.count({ where: { status: 'REJECTED' } })
    ])

    res.json({
      martyrs: stats[0],
      users: stats[1],
      testimonials: stats[2],
      sources: stats[3],
      contributions: stats[4],
      pendingContributions: stats[5],
      approvedContributions: stats[6],
      rejectedContributions: stats[7]
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/admin/users - Get all users
router.get('/users', requirePermission('VIEW_ALL_USERS'), async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string || '1')
    const limit = parseInt(req.query.limit as string || '10')
    const role = req.query.role as string

    const where: any = {}
    if (role) {
      where.role = role
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          profile: true,
          contributions: {
            select: {
              id: true,
              type: true,
              status: true,
              createdAt: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.user.count({ where })
    ])

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/admin/martyrs - Get all martyrs
router.get('/martyrs', requirePermission('VIEW_ALL_MARTYRS'), async (req: AuthenticatedRequest, res) => {
  try {
    const page = parseInt(req.query.page as string || '1')
    const limit = parseInt(req.query.limit as string || '10')
    const verified = req.query.verified as string

    const where: any = {}
    if (verified !== undefined) {
      where.isVerified = verified === 'true'
    }

    const [martyrs, total] = await Promise.all([
      prisma.martyr.findMany({
        where,
        include: {
          testimonials: {
            where: { isVerified: true },
            take: 3
          },
          sources: {
            take: 3
          }
        },
        orderBy: {
          dateOfDeath: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.martyr.count({ where })
    ])

    res.json({
      martyrs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching martyrs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

