import { Request, Response, NextFunction } from 'express'
import { auth } from '../lib/firebase'

export interface AuthRequest extends Request {
  userId?: string
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const decoded = await auth.verifyIdToken(token)
    req.userId = decoded.uid
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (token) {
    try {
      const decoded = await auth.verifyIdToken(token)
      req.userId = decoded.uid
    } catch {}
  }
  next()
}
