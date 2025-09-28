import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { hasPermission } from '@/lib/role-utils'
import { verifyJWT } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// POST /api/admin/contributions/[id]/reject - Reject a contribution
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('REJECT_CONTRIBUTIONS', decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const { reason } = await request.json()

    // Get the contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id }
    })

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    if (contribution.status !== 'PENDING' && contribution.status !== 'UNDER_REVIEW') {
      return NextResponse.json({ 
        error: 'Contribution is not in a reviewable state' 
      }, { status: 400 })
    }

    // Update contribution status to rejected
    const updatedContribution = await prisma.contribution.update({
      where: { id },
      data: {
        status: 'REJECTED',
        notes: reason || contribution.notes,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      message: 'Contribution rejected successfully',
      contribution: updatedContribution
    })
  } catch (error) {
    console.error('Error rejecting contribution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
