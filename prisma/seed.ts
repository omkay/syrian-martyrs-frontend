import { PrismaClient } from '../lib/generated/prisma'
import { martyrs } from '../lib/data'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data
  await prisma.contribution.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.source.deleteMany()
  await prisma.martyr.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@syrianmartyrs.com',
      name: 'System Administrator',
      password: 'hashed_password_here', // In production, this should be properly hashed
      role: 'ADMIN',
      isVerified: true
    }
  })

  console.log('👤 Created admin user')

  // Seed martyrs data
  for (const martyrData of martyrs) {
    // Convert date string to Date object
    const dateOfDeath = new Date(martyrData.date)
    
    const martyr = await prisma.martyr.create({
      data: {
        name: martyrData.name,
        dateOfDeath,
        location: martyrData.location,
        cause: martyrData.cause,
        description: martyrData.description,
        image: martyrData.image,
        age: martyrData.age,
        gender: martyrData.gender?.toUpperCase() as any,
        occupation: martyrData.occupation,
        familyStatus: martyrData.familyStatus,
        isVerified: true
      }
    })

    console.log(`🕊️  Created martyr: ${martyr.name}`)

    // Create testimonials
    if (martyrData.testimonials) {
      for (const testimonialData of martyrData.testimonials) {
        const testimonialDate = testimonialData.date ? new Date(testimonialData.date) : undefined
        
        await prisma.testimonial.create({
          data: {
            content: testimonialData.content,
            author: testimonialData.author,
            relationship: testimonialData.relationship,
            date: testimonialDate,
            martyrId: martyr.id,
            isVerified: true
          }
        })
      }
      console.log(`  📝 Added ${martyrData.testimonials.length} testimonials`)
    }

    // Create sources
    if (martyrData.sources) {
      for (const sourceData of martyrData.sources) {
        const sourceDate = new Date(sourceData.date)
        
        await prisma.source.create({
          data: {
            name: sourceData.name,
            url: sourceData.url,
            date: sourceDate,
            type: sourceData.type.toUpperCase() as any,
            martyrId: martyr.id
          }
        })
      }
      console.log(`  📚 Added ${martyrData.sources.length} sources`)
    }
  }

  // Create some sample contributions
  const sampleContributions = [
    {
      type: 'MARTYR_ADDITION' as const,
      content: {
        name: 'Sample Martyr',
        dateOfDeath: new Date('2012-06-15'),
        location: 'Sample Location',
        description: 'This is a sample martyr entry for testing purposes'
      },
      notes: 'Sample contribution for testing the system'
    },
    {
      type: 'CORRECTION' as const,
      content: {
        field: 'age',
        oldValue: 30,
        newValue: 31,
        reason: 'Corrected based on family records'
      },
      notes: 'Sample correction for testing'
    }
  ]

  for (const contributionData of sampleContributions) {
    await prisma.contribution.create({
      data: {
        type: contributionData.type,
        userId: adminUser.id,
        content: contributionData.content,
        notes: contributionData.notes,
        status: 'APPROVED'
      }
    })
  }

  console.log('📝 Created sample contributions')

  console.log('✅ Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
