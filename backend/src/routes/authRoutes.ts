import express from 'express';
import { registerUser, loginUser, saveFCMToken } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/fcm-token', protect, saveFCMToken);

export default router;
