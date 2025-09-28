import { hashPassword } from '../lib/auth-utils'

async function generatePasswordHash() {
  try {
    const password = 'admin123!'
    const hash = await hashPassword(password)
    
    console.log('Password Hashing Information:')
    console.log('============================')
    console.log(`Algorithm: bcrypt`)
    console.log(`Salt Rounds: 12`)
    console.log(`Password: ${password}`)
    console.log(`Hash: ${hash}`)
    console.log('')
    console.log('This hash can be used directly in the database or for testing.')
    
  } catch (error) {
    console.error('Error generating password hash:', error)
  }
}

generatePasswordHash()

