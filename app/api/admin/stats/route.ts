import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET(request: NextRequest) {
  try {
    // Get all statistics in parallel
    const [
      totalMartyrs,
      pendingContributions,
      approvedContributions,
      rejectedContributions,
      verifiedMartyrs,
      unverifiedMartyrs,
      totalUsers,
      adminUsers,
      moderatorUsers,
      regularUsers,
      recentContributions,
      recentMartyrs
    ] = await Promise.all([
      // Martyr statistics
      prisma.martyr.count(),
      prisma.contribution.count({ where: { status: 'PENDING' } }),
      prisma.contribution.count({ where: { status: 'APPROVED' } }),
      prisma.contribution.count({ where: { status: 'REJECTED' } }),
      prisma.martyr.count({ where: { isVerified: true } }),
      prisma.martyr.count({ where: { isVerified: false } }),
      
      // User statistics
      prisma.user.count(),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { role: 'MODERATOR' } }),
      prisma.user.count({ where: { role: 'USER' } }),
      
      // Recent activity
      prisma.contribution.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          martyr: { select: { name: true } }
        }
      }),
      prisma.martyr.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { contributions: true, testimonials: true }
          }
        }
      })
    ])

    // Calculate additional metrics
    const totalContributions = pendingContributions + approvedContributions + rejectedContributions
    const approvalRate = totalContributions > 0 ? (approvedContributions / totalContributions) * 100 : 0
    const verificationRate = totalMartyrs > 0 ? (verifiedMartyrs / totalMartyrs) * 100 : 0

    return NextResponse.json({
      martyrs: {
        total: totalMartyrs,
        verified: verifiedMartyrs,
        unverified: unverifiedMartyrs,
        verificationRate: Math.round(verificationRate * 100) / 100
      },
      contributions: {
        total: totalContributions,
        pending: pendingContributions,
        approved: approvedContributions,
        rejected: rejectedContributions,
        approvalRate: Math.round(approvalRate * 100) / 100
      },
      users: {
        total: totalUsers,
        admins: adminUsers,
        moderators: moderatorUsers,
        regular: regularUsers
      },
      recentActivity: {
        contributions: recentContributions,
        martyrs: recentMartyrs
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
