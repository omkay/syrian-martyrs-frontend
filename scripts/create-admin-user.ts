#!/usr/bin/env tsx

import { PrismaClient } from '../lib/generated/prisma'
import { hashPassword } from '../lib/auth-utils'

const prisma = new PrismaClient()

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n')

  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@syrianmartyrs.org' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Name: ${existingAdmin.name}`)
      console.log(`   Role: ${existingAdmin.role}`)
      console.log(`   Verified: ${existingAdmin.isVerified}`)
      
      // Update role to ADMIN if needed
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' }
        })
        console.log('✅ Updated user role to ADMIN')
      }
      
      return existingAdmin
    }

    // Create new admin user
    const hashedPassword = await hashPassword('admin123')
    
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@syrianmartyrs.org',
        name: 'System Administrator',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Password: admin123`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Verified: ${adminUser.isVerified}`)
    console.log('\n🔐 You can now login with:')
    console.log('   Email: admin@syrianmartyrs.org')
    console.log('   Password: admin123')

    return adminUser

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAdminUser()
  .then(() => {
    console.log('\n🎉 Admin user setup complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error)
    process.exit(1)
  })