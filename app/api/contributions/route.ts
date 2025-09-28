import { NextRequest, NextResponse } from 'next/server'
import { getContributionsByUser } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params or headers
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get contributions for the user, filtered to only MARTYR_ADDITION and TESTIMONIAL_ADDITION
    const contributions = await getContributionsByUser(userId)
    
    // Filter to only show the two types we want
    const filteredContributions = contributions.filter(contribution => 
      contribution.type === 'MARTYR_ADDITION' || contribution.type === 'TESTIMONIAL_ADDITION'
    )

    return NextResponse.json(filteredContributions)
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 })
  }
}
