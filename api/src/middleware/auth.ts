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
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const decoded = verifyJWT(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
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

