import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// PUT /api/admin/users/[id] - Update user (role, verification status, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { role, isVerified, isActive } = await request.json()

    // Validate role if provided
    if (role && !['ADMIN', 'MODERATOR', 'USER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(isVerified !== undefined && { isVerified }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        profile: true,
        _count: {
          select: {
            contributions: true,
            testimonials: true
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if user has contributions
    const contributionCount = await prisma.contribution.count({
      where: { userId: id }
    })

    if (contributionCount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete user with contributions. Please reassign or delete contributions first.' 
      }, { status: 400 })
    }

    // Delete user (this will cascade to profile, testimonials, etc.)
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
