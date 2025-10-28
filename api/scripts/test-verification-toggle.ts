import { PrismaClient } from '../lib/generated/prisma'
import { hashPassword } from '../lib/auth-utils'

const prisma = new PrismaClient()

async function testVerificationToggle() {
  try {
    console.log('Testing email verification toggle functionality...\n')

    // Test with verification enabled
    process.env.REQUIRE_EMAIL_VERIFICATION = "true"
    console.log('1. Testing with REQUIRE_EMAIL_VERIFICATION=true')
    
    const testEmail1 = 'test1@example.com'
    const hashedPassword1 = await hashPassword('password123!')
    
    // Create user with verification required
    const user1 = await prisma.user.create({
      data: {
        email: testEmail1,
        name: 'Test User 1',
        password: hashedPassword1,
        role: 'USER',
        isVerified: false, // Not verified
        emailVerificationToken: 'test-token-1',
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })
    
    console.log(`   Created user: ${user1.email}`)
    console.log(`   Verified: ${user1.isVerified}`)
    console.log(`   Has verification token: ${!!user1.emailVerificationToken}`)

    // Test with verification disabled
    process.env.REQUIRE_EMAIL_VERIFICATION = "false"
    console.log('\n2. Testing with REQUIRE_EMAIL_VERIFICATION=false')
    
    const testEmail2 = 'test2@example.com'
    const hashedPassword2 = await hashPassword('password123!')
    
    // Create user without verification required
    const user2 = await prisma.user.create({
      data: {
        email: testEmail2,
        name: 'Test User 2',
        password: hashedPassword2,
        role: 'USER',
        isVerified: true // Verified immediately
      }
    })
    
    console.log(`   Created user: ${user2.email}`)
    console.log(`   Verified: ${user2.isVerified}`)
    console.log(`   Has verification token: ${!!user2.emailVerificationToken}`)

    console.log('\n✅ Verification toggle test completed successfully!')
    console.log('\nTo test in the application:')
    console.log('1. Set REQUIRE_EMAIL_VERIFICATION="true" in your .env file')
    console.log('2. Try signing up - user will need email verification')
    console.log('3. Set REQUIRE_EMAIL_VERIFICATION="false" in your .env file')
    console.log('4. Try signing up - user will be verified immediately')

  } catch (error) {
    console.error('Error testing verification toggle:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testVerificationToggle()
