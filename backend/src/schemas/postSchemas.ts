import { z } from 'zod';

export const postSchema = z.object({
    content: z.string().min(1, 'Content is required').max(500, 'Content exceeds 500 characters'),
});

export const commentSchema = z.object({
    text: z.string().min(1, 'Comment text is required').max(200, 'Comment exceeds 200 characters'),
});
