import { Router } from 'express'
import { PrismaClient } from '../../lib/generated/prisma'

const router = Router()
const prisma = new PrismaClient()

// GET /api/martyrs - Get all martyrs with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const search = req.query.search as string
    const verified = req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (verified !== undefined) {
      where.isVerified = verified
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const totalCount = await prisma.martyr.count({ where })

    // Fetch martyrs with relations
    const martyrs = await prisma.martyr.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: [
        { isVerified: 'desc' }, // Show verified martyrs first
        { createdAt: 'desc' }
      ],
      include: {
        contributions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            contributions: true
          }
        }
      }
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages
    const hasPrevious = page > 1

    res.json({
      martyrs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore,
        hasPrevious
      }
    })
  } catch (error) {
    console.error('Error fetching martyrs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/martyrs/:id - Get a single martyr by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const martyr = await prisma.martyr.findUnique({
      where: { id },
      include: {
        contributions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        _count: {
          select: {
            contributions: true
          }
        }
      }
    })

    if (!martyr) {
      return res.status(404).json({ error: 'Martyr not found' })
    }

    res.json(martyr)
  } catch (error) {
    console.error('Error fetching martyr:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

