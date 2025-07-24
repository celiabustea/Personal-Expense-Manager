import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const supabaseJwtSecret = process.env.SUPABASE_KEY;

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Malformed token' });
  }
  try {
    // here -> supabase JWTs are signed with the service_role key
    const decoded = jwt.verify(token, supabaseJwtSecret as string);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}