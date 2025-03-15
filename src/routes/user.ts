import express from 'express';
import { createUser, loginUser, addReview } from '../controllers/userController';
import { AuthenticatedRequest } from '../types/User';
const router = express.Router();

router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/review', (req,res) => addReview(req as AuthenticatedRequest, res));
export default router;