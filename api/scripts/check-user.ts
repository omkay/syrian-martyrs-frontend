import { PrismaClient } from '../lib/generated/prisma'
import { verifyPassword } from '../lib/auth-utils'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const email = 'admin@syrianmartyrs.com'
    const password = 'admin123!'
    
    console.log('Checking user details...')
    console.log('========================')
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ User not found: ${email}`)
      return
    }
    
    console.log(`✅ User found: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Verified: ${user.isVerified}`)
    console.log(`   Created: ${user.createdAt}`)
    console.log(`   Password hash: ${user.password}`)
    
    // Test password verification
    console.log('\nTesting password verification...')
    console.log('================================')
    const isPasswordValid = await verifyPassword(password, user.password)
    console.log(`Password "${password}" is valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`)
    
    if (!isPasswordValid) {
      console.log('\n🔧 Password mismatch detected!')
      console.log('The stored password hash does not match "admin123!"')
      console.log('This could be because:')
      console.log('1. The user was created with a different password')
      console.log('2. The password hash is corrupted')
      console.log('3. The user was created before the current hashing method')
    }
    
  } catch (error) {
    console.error('Error checking user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()

