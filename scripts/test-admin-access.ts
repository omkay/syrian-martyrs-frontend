#!/usr/bin/env tsx

import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function testAdminAccess() {
  console.log('🧪 Testing Admin Access...\n')

  try {
    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@syrianmartyrs.org' }
    })

    if (!adminUser) {
      console.log('❌ Admin user not found!')
      return
    }

    console.log('✅ Admin user found:')
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Verified: ${adminUser.isVerified}`)

    // Test role check
    const isAdmin = adminUser.role === 'ADMIN'
    console.log(`\n🔐 Admin role check: ${isAdmin ? '✅ PASS' : '❌ FAIL'}`)

    if (isAdmin) {
      console.log('\n🎉 Admin access should work!')
      console.log('\n📝 To test admin access:')
      console.log('1. Go to http://localhost:3000/login')
      console.log('2. Login with:')
      console.log('   Email: admin@syrianmartyrs.org')
      console.log('   Password: admin123')
      console.log('3. Navigate to http://localhost:3000/admin')
    }

  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testAdminAccess()
