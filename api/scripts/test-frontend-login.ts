// This script simulates the frontend login flow
import { loginUser } from '../app/actions'

async function testFrontendLogin() {
  try {
    console.log('Testing frontend login flow...')
    console.log('==============================')
    
    // Simulate the login form submission
    const email = 'admin@syrianmartyrs.com'
    const password = 'admin123!'
    
    console.log('1. Form validation (should pass)')
    if (!email || !password) {
      console.log('❌ Email and password are required')
      return
    }
    console.log('✅ Form validation passed')
    
    console.log('\n2. Calling loginUser action...')
    const result = await loginUser(email, password)
    
    console.log('3. Login result:')
    console.log(`   Success: ${result.success}`)
    console.log(`   Message: ${result.message}`)
    
    if (result.success && result.user) {
      console.log('\n4. User data received:')
      console.log(`   ID: ${result.user.id}`)
      console.log(`   Name: ${result.user.name}`)
      console.log(`   Email: ${result.user.email}`)
      console.log(`   Role: ${result.user.role}`)
      console.log(`   Verified: ${result.user.isVerified}`)
      
      console.log('\n5. Simulating localStorage storage...')
      try {
        // Simulate what the auth context does
        const userData = {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          isVerified: result.user.isVerified
        }
        console.log('✅ User data ready for localStorage')
        console.log('   Data:', JSON.stringify(userData, null, 2))
      } catch (e) {
        console.log('❌ Error preparing user data:', e)
      }
    } else {
      console.log('\n❌ Login failed:')
      console.log(`   Error: ${result.message}`)
    }
    
  } catch (error) {
    console.error('❌ Error in frontend login test:', error)
  }
}

testFrontendLogin()

