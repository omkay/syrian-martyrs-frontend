import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { hasPermission } from '@/lib/role-utils'
import { verifyJWT } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// POST /api/admin/martyrs/[id]/verify - Verify or unverify a martyr
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
    if (!decoded || !hasPermission('VERIFY_MARTYRS', decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const { isVerified, notes } = await request.json()

    // Get the martyr
    const martyr = await prisma.martyr.findUnique({
      where: { id }
    })

    if (!martyr) {
      return NextResponse.json({ error: 'Martyr not found' }, { status: 404 })
    }

    // Update martyr verification status
    const updatedMartyr = await prisma.martyr.update({
      where: { id },
      data: {
        isVerified,
        updatedAt: new Date()
      }
    })

    // Log the verification action
    await prisma.contribution.create({
      data: {
        type: 'PROFILE_VERIFICATION',
        status: 'APPROVED',
        content: {
          action: isVerified ? 'verified' : 'unverified',
          notes: notes || `Martyr ${isVerified ? 'verified' : 'unverified'} by admin`
        },
        userId: decoded.userId,
        martyrId: id
      }
    })

    return NextResponse.json({ 
      message: `Martyr ${isVerified ? 'verified' : 'unverified'} successfully`,
      martyr: updatedMartyr
    })
  } catch (error) {
    console.error('Error updating martyr verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
