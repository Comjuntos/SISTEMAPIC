import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken | { uid: string; email: string; name?: string; role?: string };
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    
    // Support simulated institutional session header for fast persona switching in preview
    if (token.startsWith('mock-')) {
      const parts = token.replace('mock-', '').split(':');
      req.user = {
        uid: parts[0] || 'mock-user',
        email: parts[1] || 'usuario@unig.br',
        name: parts[2] || 'Usuário UNIG',
      };
      return next();
    }

    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      req.user = decodedToken;
    } catch (error) {
      console.warn('Firebase token verification notice:', error);
    }
  }
  next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  // Support simulated test persona token
  if (token.startsWith('mock-')) {
    const parts = token.replace('mock-', '').split(':');
    req.user = {
      uid: parts[0] || 'mock-user',
      email: parts[1] || 'usuario@unig.br',
      name: decodeURIComponent(parts[2] || 'Usuário UNIG'),
    };
    return next();
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
