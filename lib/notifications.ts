"use server"

import { PrismaClient } from '@/lib/generated/prisma'

const prisma = new PrismaClient()

export interface NotificationData {
  type: 'CONTRIBUTION_APPROVED' | 'CONTRIBUTION_REJECTED' | 'MARTYR_VERIFIED' | 'MARTYR_UNVERIFIED'
  userId: string
  title: string
  message: string
  metadata?: any
}

export async function createNotification(data: NotificationData) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        userId: data.userId,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        isRead: false
      }
    })

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    throw new Error('Failed to create notification')
  }
}

export async function getUserNotifications(userId: string, limit: number = 10) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return notifications
  } catch (error) {
    console.error('Error fetching notifications:', error)
    throw new Error('Failed to fetch notifications')
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true }
    })

    return notification
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw new Error('Failed to mark notification as read')
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })

    return { success: true }
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw new Error('Failed to mark all notifications as read')
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false }
    })

    return count
  } catch (error) {
    console.error('Error getting unread notification count:', error)
    throw new Error('Failed to get unread notification count')
  }
}

// Helper functions for creating specific notification types
export async function notifyContributionApproved(
  userId: string,
  contributionType: string,
  martyrName?: string
) {
  const title = "Contribution Approved"
  const message = martyrName 
    ? `Your ${contributionType.toLowerCase().replace('_', ' ')} for ${martyrName} has been approved.`
    : `Your ${contributionType.toLowerCase().replace('_', ' ')} has been approved.`

  return createNotification({
    type: 'CONTRIBUTION_APPROVED',
    userId,
    title,
    message,
    metadata: { contributionType, martyrName }
  })
}

export async function notifyContributionRejected(
  userId: string,
  contributionType: string,
  reason: string,
  martyrName?: string
) {
  const title = "Contribution Rejected"
  const message = martyrName 
    ? `Your ${contributionType.toLowerCase().replace('_', ' ')} for ${martyrName} was rejected. Reason: ${reason}`
    : `Your ${contributionType.toLowerCase().replace('_', ' ')} was rejected. Reason: ${reason}`

  return createNotification({
    type: 'CONTRIBUTION_REJECTED',
    userId,
    title,
    message,
    metadata: { contributionType, reason, martyrName }
  })
}

export async function notifyMartyrVerified(
  userId: string,
  martyrName: string
) {
  const title = "Martyr Verified"
  const message = `The martyr profile for ${martyrName} has been verified by an administrator.`

  return createNotification({
    type: 'MARTYR_VERIFIED',
    userId,
    title,
    message,
    metadata: { martyrName }
  })
}

export async function notifyMartyrUnverified(
  userId: string,
  martyrName: string
) {
  const title = "Martyr Unverified"
  const message = `The martyr profile for ${martyrName} has been unverified by an administrator.`

  return createNotification({
    type: 'MARTYR_UNVERIFIED',
    userId,
    title,
    message,
    metadata: { martyrName }
  })
}
