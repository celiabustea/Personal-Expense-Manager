import { Request, Response, NextFunction } from 'express';

// Usage: router.get('/admin', authenticateJWT, authorizeRole('admin'), ...)
export function authorizeRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !user.role || user.role !== role) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}
