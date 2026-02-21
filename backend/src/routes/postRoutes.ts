import express from 'express';
import { createPost, getPosts, likePost, commentOnPost } from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createPost as express.RequestHandler);
router.get('/', protect, getPosts as express.RequestHandler);
router.post('/:id/like', protect, likePost as express.RequestHandler);
router.post('/:id/comment', protect, commentOnPost as express.RequestHandler);

export default router;
