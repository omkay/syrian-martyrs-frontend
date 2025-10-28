import { Router, Request, Response } from 'express'
import { prisma } from '../../lib/db'
import { getUserByEmail, createUser } from '../../lib/db'
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  validatePassword, 
  validateEmail 
} from '../../lib/auth-utils'

const router = Router()

// POST /api/auth/login - User login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      })
    }

    // Find user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      })
    }

    // Check if email verification is required
    const requireEmailVerification = process.env.REQUIRE_EMAIL_VERIFICATION === 'true'
    if (requireEmailVerification && !user.isVerified) {
      return res.status(403).json({ 
        success: false,
        message: 'Please verify your email address before logging in. Check your email for a verification link.' 
      })
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Return user data (without password) with token
    const { password: _, ...userWithoutPassword } = user
    
    return res.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.'
    })
  }
})

// POST /api/auth/register - User registration
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      })
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await createUser({
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      role: 'USER'
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    // Return user data (without password) with token
    const { password: _, ...userWithoutPassword } = user

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword,
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    return res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    })
  }
})

// POST /api/auth/verify-token - Verify JWT token
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      })
    }

    const { verifyToken } = require('../../lib/auth-utils')
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }

    // Fetch fresh user data
    const user = await getUserByEmail(decoded.email)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const { password: _, ...userWithoutPassword } = user

    return res.json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return res.status(500).json({
      success: false,
      message: 'An error occurred during token verification'
    })
  }
})

// GET /api/auth/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    const { verifyToken } = require('../../lib/auth-utils')
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      })
    }

    // Fetch user data
    const user = await getUserByEmail(decoded.email)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    const { password: _, ...userWithoutPassword } = user

    return res.json({
      success: true,
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return res.status(500).json({
      success: false,
      message: 'An error occurred'
    })
  }
})

export default router

