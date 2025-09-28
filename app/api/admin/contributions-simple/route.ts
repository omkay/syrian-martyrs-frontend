import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET /api/admin/contributions-simple - Get all contributions (for testing)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

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

    return NextResponse.json({
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
