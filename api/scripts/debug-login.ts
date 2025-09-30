import { PrismaClient } from '../lib/generated/prisma'
import { hashPassword, verifyPassword } from '../lib/auth-utils'

const prisma = new PrismaClient()

async function debugLogin() {
  try {
    console.log('🔍 Debugging login issue...')
    console.log('============================')
    
    const email = 'admin@syrianmartyrs.com'
    const password = 'admin123!'
    
    // Step 1: Check if user exists
    console.log('\n1. Checking if user exists in database...')
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log('❌ User not found in database')
      return
    }
    
    console.log('✅ User found in database')
    console.log(`   ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Verified: ${user.isVerified}`)
    
    // Step 2: Test password verification
    console.log('\n2. Testing password verification...')
    const isPasswordValid = await verifyPassword(password, user.password)
    console.log(`Password "${password}" is valid: ${isPasswordValid ? '✅ YES' : '❌ NO'}`)
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed')
      console.log('   This is the issue! The password hash does not match.')
      return
    }
    
    // Step 3: Check environment variables
    console.log('\n3. Checking environment variables...')
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === "true"
    console.log(`REQUIRE_EMAIL_VERIFICATION: ${process.env.REQUIRE_EMAIL_VERIFICATION}`)
    console.log(`Email verification required: ${requireEmailVerification}`)
    
    if (requireEmailVerification && !user.isVerified) {
      console.log('❌ User is not verified and verification is required')
      return
    }
    
    console.log('✅ All checks passed!')
    console.log('\n🎯 The login should work. If it\'s not working in the frontend:')
    console.log('1. Check browser console for errors')
    console.log('2. Check network tab for failed requests')
    console.log('3. Verify the frontend is calling the correct endpoint')
    console.log('4. Check if there are any CORS issues')
    
  } catch (error) {
    console.error('❌ Error during debug:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLogin()

