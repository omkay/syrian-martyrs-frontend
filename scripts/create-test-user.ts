import { PrismaClient } from '../lib/generated/prisma'
import { hashPassword } from '../lib/auth-utils'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const email = 'user@example.com'
    const password = 'password123!'
    const name = 'Test User'

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Test user already exists:', email)
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'USER',
        isVerified: true
      }
    })

    console.log('Test user created successfully:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('User ID:', testUser.id)
    console.log('Role:', testUser.role)
    console.log('Verified:', testUser.isVerified)

  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()
