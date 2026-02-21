import mongoose, { Schema } from 'mongoose';
import type { IPost } from '../types/index.js';

const CommentSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const PostSchema: Schema = new Schema(
    {
        content: { type: String, required: true, trim: true },
        author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        comments: [CommentSchema],
    },
    {
        timestamps: true,
    },
);


PostSchema.index({ createdAt: -1 });
PostSchema.index({ author: 1 });

const Post = mongoose.model<IPost>('Post', PostSchema);

export default Post;
