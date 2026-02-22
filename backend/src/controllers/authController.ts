import type { Request, Response } from 'express';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { registerSchema, loginSchema, fcmTokenSchema } from '../schemas/authSchemas.js';


//Register
export const registerUser = async (req: Request, res: Response) => {
  const parsedData = registerSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ error: parsedData.error.issues.map((i) => i.message).join(', ') });
    return;
  }

  const { username, email, password } = parsedData.data;

  const userExists = await User.findOne({ $or: [{ username }, { email }] });

  if (userExists) {
    res.status(400).json({ error: 'User with this email or username already exists' });
    return;
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ error: 'Invalid user data' });
  }
};

//Login
export const loginUser = async (req: Request, res: Response) => {
  const parsedData = loginSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ error: parsedData.error.issues.map((i) => i.message).join(', ') });
    return;
  }

  const { email, password } = parsedData.data;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ error: 'Invalid email or password' });
  }
};

// Save FCM Token
export const saveFCMToken = async (req: Request, res: Response) => {
  const parsedData = fcmTokenSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(400).json({ error: parsedData.error.issues.map((i) => i.message).join(', ') });
    return;
  }

  const { fcmToken } = parsedData.data;

  const user = await User.findById(req.user?._id);

  if (user) {
    if (!user.fcmTokens?.includes(fcmToken)) {
      user.fcmTokens?.push(fcmToken);
      await user.save();
    }
    res.json({ message: 'FCM token saved successfully' });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
};
