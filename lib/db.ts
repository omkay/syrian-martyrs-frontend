import { PrismaClient } from './generated/prisma'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utility functions
export async function getMartyrsWithRelations(limit?: number, offset?: number) {
  return await prisma.martyr.findMany({
    include: {
      testimonials: {
        where: { isVerified: true },
        orderBy: { createdAt: 'desc' }
      },
      sources: {
        orderBy: { date: 'desc' }
      }
    },
    orderBy: { dateOfDeath: 'desc' },
    take: limit,
    skip: offset
  })
}

export async function getMartyrById(id: string) {
  return await prisma.martyr.findUnique({
    where: { id },
    include: {
      testimonials: {
        where: { isVerified: true },
        orderBy: { createdAt: 'desc' }
      },
      sources: {
        orderBy: { date: 'desc' }
      }
    }
  })
}

export async function searchMartyrs(query: string) {
  return await prisma.martyr.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { location: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { occupation: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      testimonials: {
        where: { isVerified: true },
        take: 1
      }
    },
    orderBy: { dateOfDeath: 'desc' }
  })
}

export async function createContribution(data: {
  type: string
  userId: string
  martyrId?: string
  content: any
  notes?: string
}) {
  return await prisma.contribution.create({
    data: {
      type: data.type as any,
      userId: data.userId,
      martyrId: data.martyrId,
      content: data.content,
      notes: data.notes
    }
  })
}

export async function getPendingContributions() {
  return await prisma.contribution.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      martyr: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })
}

export async function updateContributionStatus(id: string, status: string) {
  return await prisma.contribution.update({
    where: { id },
    data: { status: status as any }
  })
}

export async function createTestimonial(data: {
  content: string
  author: string
  relationship?: string
  date?: Date
  martyrId?: string
  userId?: string
}) {
  return await prisma.testimonial.create({
    data: {
      content: data.content,
      author: data.author,
      relationship: data.relationship,
      date: data.date,
      martyrId: data.martyrId,
      userId: data.userId
    }
  })
}

export async function getTestimonialsByMartyr(martyrId: string) {
  return await prisma.testimonial.findMany({
    where: { 
      martyrId,
      isVerified: true 
    },
    orderBy: { createdAt: 'desc' }
  })
}

export async function createSource(data: {
  name: string
  url?: string
  date: Date
  type: string
  martyrId?: string
}) {
  return await prisma.source.create({
    data: {
      name: data.name,
      url: data.url,
      date: data.date,
      type: data.type as any,
      martyrId: data.martyrId
    }
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      contributions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
    include: { profile: true }
  })
}

export async function createUser(data: {
  email: string
  name?: string
  password: string
  role?: string
}) {
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      role: data.role as any
    },
    include: { profile: true }
  })
}

export async function updateUserProfile(userId: string, data: {
  bio?: string
  avatar?: string
  location?: string
  website?: string
  socialLinks?: any
}) {
  return await prisma.profile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data
    }
  })
}

// Statistics and analytics functions
export async function getDatabaseStats() {
  const [martyrsCount, testimonialsCount, sourcesCount, contributionsCount, usersCount] = await Promise.all([
    prisma.martyr.count(),
    prisma.testimonial.count(),
    prisma.source.count(),
    prisma.contribution.count(),
    prisma.user.count()
  ])

  return {
    martyrs: martyrsCount,
    testimonials: testimonialsCount,
    sources: sourcesCount,
    contributions: contributionsCount,
    users: usersCount
  }
}

export async function getMartyrsByYear() {
  return await prisma.$queryRaw`
    SELECT 
      EXTRACT(YEAR FROM "dateOfDeath") as year,
      COUNT(*) as count
    FROM martyrs 
    WHERE "dateOfDeath" IS NOT NULL
    GROUP BY year 
    ORDER BY year DESC
  `
}

export async function getMartyrsByLocation() {
  return await prisma.martyr.groupBy({
    by: ['location'],
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  })
}

export async function createMartyr(data: {
  name: string
  dateOfDeath: Date
  location: string
  cause?: string
  description?: string
  image?: string
  age?: number
  gender?: string
  occupation?: string
  familyStatus?: string
  isVerified?: boolean
}) {
  return await prisma.martyr.create({
    data: {
      name: data.name,
      dateOfDeath: data.dateOfDeath,
      location: data.location,
      cause: data.cause,
      description: data.description,
      image: data.image,
      age: data.age,
      gender: data.gender as any,
      occupation: data.occupation,
      familyStatus: data.familyStatus,
      isVerified: data.isVerified ?? false
    }
  })
}
