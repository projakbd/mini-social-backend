import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { type Types } from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      username: string;
      email: string;
    };
  }
}

interface JwtPayload {
  userId: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        throw new Error('Not authorized, no token');
      }

      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new Error('JWT_SECRET must be defined in the .env file');
      }

      const decoded = jwt.verify(token, secret) as unknown as JwtPayload;

      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = {
          _id: user._id,
          username: user.username,
          email: user.email,
        };
        next();
      } else {
        res.status(401);
        next(new Error('Not authorized, user not found'));
        return;
      }
    } catch (error) {
      console.error(error);
      res.status(401);
      next(new Error('Not authorized, token failed'));
      return;
    }
  }

  if (!token) {
    res.status(401);
    next(new Error('Not authorized, no token'));
    return;
  }
};
