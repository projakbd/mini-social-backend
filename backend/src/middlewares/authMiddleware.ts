import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { type Types } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: Types.ObjectId;
        username: string;
        email: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  console.log(`[Protect Middleware] Request Path: ${req.path}`);
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        console.warn('[Protect Middleware] Authorize header found but no token');
        throw new Error('Not authorized, no token');
      }

      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET must be defined in the .env file');
      }

      const decoded = jwt.verify(token, secret) as unknown as JwtPayload;
      console.log(`[Protect Middleware] Token decoded successfully for userId: ${decoded.userId}`);

      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = {
          _id: user._id,
          username: user.username,
          email: user.email,
        };
        next();
      } else {
        console.warn(`[Protect Middleware] User not found in DB for id: ${decoded.userId}`);
        res.status(401);
        next(new Error('Not authorized, user not found'));
        return;
      }
    } catch (error) {
      console.error('[Protect Middleware] Auth failed:', (error as Error).message);
      res.status(401);
      next(new Error('Not authorized, token failed'));
      return;
    }
  }

  if (!token) {
    console.warn(`[Protect Middleware] No Authorization header for path: ${req.path}`);
    res.status(401);
    next(new Error('Not authorized, no token'));
    return;
  }
};
