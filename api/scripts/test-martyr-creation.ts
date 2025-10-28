#!/usr/bin/env tsx

import { createMartyr, createContribution, getUserByEmail } from '../lib/db'

async function testMartyrCreation() {
  console.log('🧪 Testing martyr creation functionality...')

  try {
    // Test 1: Get admin user
    console.log('1. Getting admin user...')
    const adminUser = await getUserByEmail('admin@syrianmartyrs.com')
    if (!adminUser) {
      throw new Error('Admin user not found')
    }
    console.log(`✅ Found admin user: ${adminUser.name} (${adminUser.id})`)

    // Test 2: Create a test martyr
    console.log('2. Creating test martyr...')
    const testMartyr = await createMartyr({
      name: 'Test Martyr',
      dateOfDeath: new Date('2023-01-01'),
      location: 'Test Location',
      cause: 'Test Cause',
      description: 'This is a test martyr entry for testing purposes',
      age: 30,
      gender: 'MALE',
      occupation: 'Test Occupation',
      familyStatus: 'Single',
      isVerified: false
    })
    console.log(`✅ Created test martyr: ${testMartyr.name} (${testMartyr.id})`)

    // Test 3: Create a contribution for the martyr
    console.log('3. Creating contribution...')
    const contribution = await createContribution({
      type: 'MARTYR_ADDITION',
      userId: adminUser.id,
      martyrId: testMartyr.id,
      content: {
        martyrData: {
          name: testMartyr.name,
          dateOfDeath: testMartyr.dateOfDeath,
          location: testMartyr.location,
          cause: testMartyr.cause,
          description: testMartyr.description
        },
        source: 'Test source',
        submitterRelationship: 'Test relationship'
      },
      notes: 'Test contribution for martyr creation'
    })
    console.log(`✅ Created contribution: ${contribution.id}`)

    // Test 4: Clean up - delete the test data
    console.log('4. Cleaning up test data...')
    // Note: In a real scenario, you might want to keep test data or use a separate test database
    console.log('⚠️  Test data created but not cleaned up (for inspection)')

    console.log('\n🎉 All martyr creation tests passed successfully!')
    console.log('\n📊 Test Results:')
    console.log(`   - Admin User ID: ${adminUser.id}`)
    console.log(`   - Test Martyr ID: ${testMartyr.id}`)
    console.log(`   - Contribution ID: ${contribution.id}`)

  } catch (error) {
    console.error('❌ Martyr creation test failed:', error)
    process.exit(1)
  }
}

testMartyrCreation()
