import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { hasPermission } from '@/lib/role-utils'
import { verifyJWT } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// GET /api/admin/martyrs - Get all martyrs for admin management
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('EDIT_MARTYRS', decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const verified = searchParams.get('verified')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause
    const where: any = {}
    if (verified !== null) {
      where.isVerified = verified === 'true'
    }

    // Get martyrs with pagination
    const [martyrs, total] = await Promise.all([
      prisma.martyr.findMany({
        where,
        include: {
          testimonials: {
            select: {
              id: true,
              content: true,
              author: true,
              isVerified: true
            }
          },
          sources: {
            select: {
              id: true,
              name: true,
              type: true,
              url: true
            }
          },
          contributions: {
            select: {
              id: true,
              type: true,
              status: true,
              createdAt: true
            }
          },
          _count: {
            select: {
              testimonials: true,
              sources: true,
              contributions: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.martyr.count({ where })
    ])

    return NextResponse.json({
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
