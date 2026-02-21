import type { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const registerSchema = z.object({
    name: z.string().min(3).max(30),
    email: z.email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

//Register
export const registerUser = async (req: Request, res: Response) => {
    const parsedData = registerSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400);
        throw new Error(parsedData.error.issues.map((i) => i.message).join(', '));
    }

    const { name, email, password } = parsedData.data;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User with this email already exists');
    }

    const user = await User.create({
        name,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
};

//Login
export const loginUser = async (req: Request, res: Response) => {
    const parsedData = loginSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400);
        throw new Error(parsedData.error.issues.map((i) => i.message).join(', '));
    }

    const { email, password } = parsedData.data;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
};
