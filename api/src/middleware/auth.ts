import { Request, Response, NextFunction } from 'express'
import { verifyJWT } from '../../lib/auth-utils'
import { hasPermission } from '../../lib/role-utils'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      console.log('[Auth] No token provided')
      return res.status(401).json({ error: 'No token provided' })
    }

    console.log('[Auth] Verifying token:', token.substring(0, 20) + '...')
    const decoded = verifyJWT(token)
    if (!decoded) {
      console.log('[Auth] Token verification failed')
      return res.status(401).json({ error: 'Token verification failed' })
    }

    console.log('[Auth] Token verified for user:', decoded.userId)
    // Map userId to id for consistency
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      role: decoded.role
    }
    next()
  } catch (error) {
    console.error('[Auth] Error in auth middleware:', error)
    return res.status(401).json({ error: 'Authentication error' })
  }
}

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!hasPermission('ADMIN_ACCESS', req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  next()
}

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!hasPermission(permission, req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

