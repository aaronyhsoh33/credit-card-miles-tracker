import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import { env } from '../config/env';
import { AuthUser } from '../types';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(createError(401, 'Missing or invalid authorization header'));
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthUser & { iat: number; exp: number };
    req.user = { id: payload.id, email: payload.email, name: payload.name };
    next();
  } catch {
    next(createError(401, 'Invalid or expired token'));
  }
}
