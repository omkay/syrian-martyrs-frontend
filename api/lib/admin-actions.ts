"use server"

import { PrismaClient } from '@/lib/generated/prisma'
import { hasPermission } from '@/lib/role-utils'
import { verifyJWT } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { 
  notifyContributionApproved, 
  notifyContributionRejected,
  notifyMartyrVerified,
  notifyMartyrUnverified
} from './notifications'

const prisma = new PrismaClient()

export async function getContributionsForAdmin(
  token: string,
  filters: {
    status?: string
    type?: string
    page?: number
    limit?: number
  } = {}
) {
  try {
    // Verify admin authentication
    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('VIEW_ALL_CONTRIBUTIONS', decoded.role)) {
      throw new Error('Forbidden')
    }

    const { status, type, page = 1, limit = 10 } = filters

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

    return {
      contributions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching contributions:', error)
    throw new Error('Failed to fetch contributions')
  }
}

export async function approveContribution(
  token: string,
  contributionId: string,
  notes?: string
) {
  try {
    // Verify admin authentication
    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('APPROVE_CONTRIBUTIONS', decoded.role)) {
      throw new Error('Forbidden')
    }

    // Get the contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        user: true,
        martyr: true,
        profile: true
      }
    })

    if (!contribution) {
      throw new Error('Contribution not found')
    }

    if (contribution.status !== 'PENDING' && contribution.status !== 'UNDER_REVIEW') {
      throw new Error('Contribution is not in a reviewable state')
    }

    // Start transaction to handle approval logic
    const result = await prisma.$transaction(async (tx) => {
      // Update contribution status
      const updatedContribution = await tx.contribution.update({
        where: { id: contributionId },
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

    // Send notification to user
    try {
      const martyrName = contribution.martyr?.name
      await notifyContributionApproved(
        contribution.userId,
        contribution.type,
        martyrName
      )
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the approval if notification fails
    }

    revalidatePath('/admin/contributions')
    return { success: true, contribution: result }
  } catch (error) {
    console.error('Error approving contribution:', error)
    throw new Error('Failed to approve contribution')
  }
}

export async function rejectContribution(
  token: string,
  contributionId: string,
  reason: string
) {
  try {
    // Verify admin authentication
    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('REJECT_CONTRIBUTIONS', decoded.role)) {
      throw new Error('Forbidden')
    }

    // Get the contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId }
    })

    if (!contribution) {
      throw new Error('Contribution not found')
    }

    if (contribution.status !== 'PENDING' && contribution.status !== 'UNDER_REVIEW') {
      throw new Error('Contribution is not in a reviewable state')
    }

    // Update contribution status to rejected
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        status: 'REJECTED',
        notes: reason,
        updatedAt: new Date()
      }
    })

    // Send notification to user
    try {
      const martyrName = contribution.martyr?.name
      await notifyContributionRejected(
        contribution.userId,
        contribution.type,
        reason,
        martyrName
      )
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError)
      // Don't fail the rejection if notification fails
    }

    revalidatePath('/admin/contributions')
    return { success: true, contribution: updatedContribution }
  } catch (error) {
    console.error('Error rejecting contribution:', error)
    throw new Error('Failed to reject contribution')
  }
}

export async function markContributionForReview(
  token: string,
  contributionId: string,
  notes?: string
) {
  try {
    // Verify admin authentication
    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('APPROVE_CONTRIBUTIONS', decoded.role)) {
      throw new Error('Forbidden')
    }

    // Get the contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id: contributionId }
    })

    if (!contribution) {
      throw new Error('Contribution not found')
    }

    if (contribution.status !== 'PENDING') {
      throw new Error('Contribution is not in pending state')
    }

    // Update contribution status to under review
    const updatedContribution = await prisma.contribution.update({
      where: { id: contributionId },
      data: {
        status: 'UNDER_REVIEW',
        notes: notes || contribution.notes,
        updatedAt: new Date()
      }
    })

    revalidatePath('/admin/contributions')
    return { success: true, contribution: updatedContribution }
  } catch (error) {
    console.error('Error marking contribution for review:', error)
    throw new Error('Failed to mark contribution for review')
  }
}

export async function getMartyrsForAdmin(
  token: string,
  filters: {
    verified?: boolean
    page?: number
    limit?: number
  } = {}
) {
  try {
    // Verify admin authentication
    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('EDIT_MARTYRS', decoded.role)) {
      throw new Error('Forbidden')
    }

    const { verified, page = 1, limit = 10 } = filters

    // Build where clause
    const where: any = {}
    if (verified !== undefined) {
      where.isVerified = verified
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

    return {
      martyrs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Error fetching martyrs:', error)
    throw new Error('Failed to fetch martyrs')
  }
}

export async function updateMartyrVerification(
  token: string,
  martyrId: string,
  isVerified: boolean,
  notes?: string
) {
  try {
    // Verify admin authentication
    const decoded = verifyJWT(token)
    if (!decoded || !hasPermission('VERIFY_MARTYRS', decoded.role)) {
      throw new Error('Forbidden')
    }

    // Get the martyr
    const martyr = await prisma.martyr.findUnique({
      where: { id: martyrId }
    })

    if (!martyr) {
      throw new Error('Martyr not found')
    }

    // Update martyr verification status
    const updatedMartyr = await prisma.martyr.update({
      where: { id: martyrId },
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
        martyrId: martyrId
      }
    })

    // Send notification to users who have contributed to this martyr
    try {
      const contributors = await prisma.contribution.findMany({
        where: { martyrId },
        select: { userId: true },
        distinct: ['userId']
      })

      for (const contributor of contributors) {
        if (isVerified) {
          await notifyMartyrVerified(contributor.userId, martyr.name)
        } else {
          await notifyMartyrUnverified(contributor.userId, martyr.name)
        }
      }
    } catch (notificationError) {
      console.error('Failed to send notifications:', notificationError)
      // Don't fail the verification if notifications fail
    }

    revalidatePath('/admin/martyrs')
    return { success: true, martyr: updatedMartyr }
  } catch (error) {
    console.error('Error updating martyr verification:', error)
    throw new Error('Failed to update martyr verification')
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
