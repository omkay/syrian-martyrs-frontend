import { PrismaClient } from '../lib/generated/prisma'
import { hashPassword } from '../lib/auth-utils'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const email = 'admin@syrianmartyrs.com'
    const password = 'admin123!'
    const name = 'System Administrator'

    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Admin user already exists:', email)
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true
      }
    })

    console.log('Admin user created successfully:')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('User ID:', adminUser.id)
    console.log('Role:', adminUser.role)
    console.log('Verified:', adminUser.isVerified)

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
