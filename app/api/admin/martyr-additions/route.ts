import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET /api/admin/martyr-additions - Get martyr addition contributions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause for martyr additions only
    const where: any = {
      type: 'MARTYR_ADDITION'
    }
    
    if (status) {
      where.status = status
    }

    // Get martyr addition contributions with pagination
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
              name: true,
              isVerified: true
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
    console.error('Error fetching martyr additions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
