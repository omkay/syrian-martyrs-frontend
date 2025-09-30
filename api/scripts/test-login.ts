import { loginUser } from '../app/actions'

async function testLogin() {
  try {
    console.log('Testing login action...')
    console.log('======================')
    
    const email = 'admin@syrianmartyrs.com'
    const password = 'admin123!'
    
    console.log(`Attempting login with:`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('')
    
    const result = await loginUser(email, password)
    
    console.log('Login result:')
    console.log(`Success: ${result.success}`)
    console.log(`Message: ${result.message}`)
    
    if (result.success && result.user) {
      console.log('User data:')
      console.log(`  ID: ${result.user.id}`)
      console.log(`  Name: ${result.user.name}`)
      console.log(`  Email: ${result.user.email}`)
      console.log(`  Role: ${result.user.role}`)
      console.log(`  Verified: ${result.user.isVerified}`)
    }
    
  } catch (error) {
    console.error('Error testing login:', error)
  }
}

testLogin()

