import type { Response } from 'express';
import Post from '../models/Post.js';
import mongoose from 'mongoose';
import { sendNotification } from '../services/notificationService.js';
import { IComment, AuthRequest } from '../types/index.js';
import { postSchema, commentSchema } from '../schemas/postSchemas.js';

// Create Post
export const createPost = async (req: AuthRequest, res: Response) => {
    const parsedData = postSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ error: parsedData.error.issues.map((i) => i.message).join(', ') });
        return;
    }

    const { content } = parsedData.data;

    if (!req.user) {
        res.status(401).json({ error: 'Not authorized' });
        return;
    }

    const post = await Post.create({
        content,
        author: req.user._id,
    });

    await post.populate('author', 'name email');

    res.status(201).json(post);
};

// Get All Posts
export const getPosts = async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;

    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email')
        .populate('comments.user', 'name email');

    const total = await Post.countDocuments();

    res.json({
        posts,
        page,
        pages: Math.ceil(total / limit),
        total,
    });
};

// Like or unlike a post
export const likePost = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
    }

    const post = await Post.findById(id);

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    if (!req.user) {
        res.status(401).json({ error: 'Not authorized' });
        return;
    }

    const currentUser = req.user!;

    const hasLiked = post.likes.includes(currentUser._id);

    if (hasLiked) {
        post.likes = post.likes.filter((userId) => userId.toString() !== currentUser._id.toString());
    } else {
        post.likes.push(currentUser._id);
        if (post.author.toString() !== currentUser._id.toString()) {
            void sendNotification({
                userId: post.author.toString(),
                title: 'New Like!',
                body: `${currentUser.name} liked your post.`,
                data: { postId: post._id.toString() },
            });
        }
    }

    await post.save();

    res.json({ message: hasLiked ? 'Post unliked' : 'Post liked', likesCount: post.likes.length });
};

// Comment on a post
export const commentOnPost = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
        res.status(400).json({ error: 'Invalid post ID' });
        return;
    }

    const parsedData = commentSchema.safeParse(req.body);

    if (!parsedData.success) {
        res.status(400).json({ error: parsedData.error.issues.map((i) => i.message).join(', ') });
        return;
    }

    const post = await Post.findById(id);

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    if (!req.user) {
        res.status(401).json({ error: 'Not authorized' });
        return;
    }

    const comment = {
        user: req.user._id,
        text: parsedData.data.text,
        createdAt: new Date(),
    };

    post.comments.push(comment as unknown as IComment);
    await post.save();

    const updatedPost = await Post.findById(id).populate('comments.user', 'name email');
    const newComment = updatedPost?.comments[updatedPost.comments.length - 1];

    if (post.author.toString() !== req.user?._id.toString()) {
        void sendNotification({
            userId: post.author.toString(),
            title: 'New Comment!',
            body: `${req.user?.name} commented on your post: "${parsedData.data.text.substring(0, 30)}${parsedData.data.text.length > 30 ? '...' : ''}"`,
            data: { postId: post._id.toString() },
        });
    }

    res.status(201).json(newComment);
};
