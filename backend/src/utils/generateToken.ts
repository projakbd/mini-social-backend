import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

const generateToken = (userId: Types.ObjectId) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET must be defined in the .env file');
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: '30d',
  });
};

export default generateToken;
