#!/usr/bin/env tsx

import { prisma } from '../lib/db'

async function testDatabase() {
  console.log('🧪 Testing database functionality...')

  try {
    // Test 1: Basic connection
    console.log('1. Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')

    // Test 2: Get martyrs count
    console.log('2. Testing martyrs query...')
    const martyrsCount = await prisma.martyr.count()
    console.log(`✅ Found ${martyrsCount} martyrs`)

    // Test 3: Get users count
    console.log('3. Testing users query...')
    const usersCount = await prisma.user.count()
    console.log(`✅ Found ${usersCount} users`)

    // Test 4: Get testimonials count
    console.log('4. Testing testimonials query...')
    const testimonialsCount = await prisma.testimonial.count()
    console.log(`✅ Found ${testimonialsCount} testimonials`)

    // Test 5: Get sources count
    console.log('5. Testing sources query...')
    const sourcesCount = await prisma.source.count()
    console.log(`✅ Found ${sourcesCount} sources`)

    // Test 6: Get contributions count
    console.log('6. Testing contributions query...')
    const contributionsCount = await prisma.contribution.count()
    console.log(`✅ Found ${contributionsCount} contributions`)

    // Test 7: Test complex query with relations
    console.log('7. Testing complex query with relations...')
    const martyrWithRelations = await prisma.martyr.findFirst({
      include: {
        testimonials: true,
        sources: true
      }
    })
    
    if (martyrWithRelations) {
      console.log(`✅ Found martyr: ${martyrWithRelations.name}`)
      console.log(`   - Testimonials: ${martyrWithRelations.testimonials.length}`)
      console.log(`   - Sources: ${martyrWithRelations.sources.length}`)
    } else {
      console.log('⚠️  No martyrs found with relations')
    }

    // Test 8: Test search functionality
    console.log('8. Testing search functionality...')
    const searchResults = await prisma.martyr.findMany({
      where: {
        OR: [
          { name: { contains: 'Ahmad', mode: 'insensitive' } },
          { location: { contains: 'Daraa', mode: 'insensitive' } }
        ]
      },
      take: 5
    })
    console.log(`✅ Search found ${searchResults.length} results`)

    console.log('\n🎉 All database tests passed successfully!')
    console.log('\n📊 Database Summary:')
    console.log(`   - Martyrs: ${martyrsCount}`)
    console.log(`   - Users: ${usersCount}`)
    console.log(`   - Testimonials: ${testimonialsCount}`)
    console.log(`   - Sources: ${sourcesCount}`)
    console.log(`   - Contributions: ${contributionsCount}`)

  } catch (error) {
    console.error('❌ Database test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()
