import { Router } from 'express'
import { getContributionsByUser } from '../../lib/db'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// GET /api/contributions - Get contributions for a user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.query.userId as string || req.user?.id
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Get contributions for the user, filtered to only MARTYR_ADDITION and TESTIMONIAL_ADDITION
    const contributions = await getContributionsByUser(userId)
    
    // Filter to only show the two types we want
    const filteredContributions = contributions.filter(contribution => 
      contribution.type === 'MARTYR_ADDITION' || contribution.type === 'TESTIMONIAL_ADDITION'
    )

    res.json(filteredContributions)
  } catch (error) {
    console.error('Error fetching contributions:', error)
    res.status(500).json({ error: 'Failed to fetch contributions' })
  }
})

export default router

