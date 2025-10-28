import { Router } from 'express'
import { getContributionsByUser, createContribution } from '../../lib/db'
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

// POST /api/contributions - Create a new contribution
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user?.id
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { type, content, martyrId, profileId, notes } = req.body

    // Validate required fields
    if (!type || !content) {
      return res.status(400).json({ error: 'Type and content are required' })
    }

    // Validate content for MARTYR_ADDITION
    if (type === 'MARTYR_ADDITION') {
      const { name, dateOfDeath, location, description } = content
      if (!name || !dateOfDeath || !location || !description) {
        return res.status(400).json({ 
          error: 'Name, date of death, location, and description are required for martyr additions' 
        })
      }
    }

    // Create the contribution
    const contribution = await createContribution({
      type,
      userId,
      martyrId,
      profileId,
      content,
      notes
    })

    res.status(201).json({
      success: true,
      message: 'Contribution submitted successfully. It will be reviewed before being published.',
      contribution
    })
  } catch (error) {
    console.error('Error creating contribution:', error)
    res.status(500).json({ error: 'Failed to create contribution' })
  }
})

export default router

