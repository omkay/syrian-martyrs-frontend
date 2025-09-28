import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { hasPermission } from '@/lib/role-utils'
import { verifyJWT } from '@/lib/auth-utils'

const prisma = new PrismaClient()

// POST /api/admin/contributions/[id]/approve - Approve a contribution
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
    if (!decoded || !hasPermission('APPROVE_CONTRIBUTIONS', decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const { notes } = await request.json()

    // Get the contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        user: true,
        martyr: true,
        profile: true
      }
    })

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 })
    }

    if (contribution.status !== 'PENDING' && contribution.status !== 'UNDER_REVIEW') {
      return NextResponse.json({ 
        error: 'Contribution is not in a reviewable state' 
      }, { status: 400 })
    }

    // Start transaction to handle approval logic
    const result = await prisma.$transaction(async (tx) => {
      // Update contribution status
      const updatedContribution = await tx.contribution.update({
        where: { id },
        data: {
          status: 'APPROVED',
          notes: notes || contribution.notes,
          updatedAt: new Date()
        }
      })

      // Apply the contribution based on its type
      await applyContribution(tx, contribution)

      return updatedContribution
    })

    return NextResponse.json({ 
      message: 'Contribution approved successfully',
      contribution: result
    })
  } catch (error) {
    console.error('Error approving contribution:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to apply approved contributions
async function applyContribution(tx: any, contribution: any) {
  const { type, content, martyrId, profileId } = contribution

  switch (type) {
    case 'MARTYR_ADDITION':
      // Create new martyr from contribution
      await tx.martyr.create({
        data: {
          name: content.name,
          dateOfDeath: new Date(content.dateOfDeath),
          location: content.location,
          cause: content.cause,
          description: content.description,
          image: content.image,
          age: content.age,
          gender: content.gender,
          occupation: content.occupation,
          familyStatus: content.familyStatus,
          isVerified: true // Admin approved
        }
      })
      break

    case 'MARTYR_UPDATE':
      // Update existing martyr
      if (martyrId) {
        await tx.martyr.update({
          where: { id: martyrId },
          data: {
            ...content,
            isVerified: true,
            updatedAt: new Date()
          }
        })
      }
      break

    case 'TESTIMONIAL_ADDITION':
      // Create new testimonial
      await tx.testimonial.create({
        data: {
          content: content.content,
          author: content.author,
          relationship: content.relationship,
          date: content.date ? new Date(content.date) : new Date(),
          isVerified: true,
          martyrId: martyrId,
          userId: contribution.userId
        }
      })
      break

    case 'SOURCE_ADDITION':
      // Create new source
      await tx.source.create({
        data: {
          name: content.name,
          url: content.url,
          date: new Date(content.date),
          type: content.type,
          martyrId: martyrId
        }
      })
      break

    case 'PHOTO_ADDITION':
      // Update martyr with new photo
      if (martyrId) {
        await tx.martyr.update({
          where: { id: martyrId },
          data: {
            image: content.imageUrl,
            updatedAt: new Date()
          }
        })
      }
      break

    case 'PROFILE_CREATION':
    case 'PROFILE_UPDATE':
      // Update user profile
      if (profileId) {
        await tx.profile.update({
          where: { id: profileId },
          data: {
            ...content,
            isVerified: true,
            updatedAt: new Date()
          }
        })
      }
      break

    case 'PROFILE_VERIFICATION':
      // Mark profile as verified
      if (profileId) {
        await tx.profile.update({
          where: { id: profileId },
          data: {
            isVerified: true,
            updatedAt: new Date()
          }
        })
      }
      break

    default:
      console.log(`Unhandled contribution type: ${type}`)
  }
}
