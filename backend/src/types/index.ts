import type { Types, Document } from 'mongoose';
import type { Request } from 'express';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  fcmTokens?: string[];
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IComment {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  content: string;
  author: Types.ObjectId;
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
}

export interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
}

