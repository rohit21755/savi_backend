import express from 'express';
import { createUser, loginUser, addReview,  updateProfile} from '../controllers/userController';
import { AuthenticatedRequest } from '../types/User';
import { isUserAuthenticated } from '../middlewares/user';
const router = express.Router();

router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/review', isUserAuthenticated,(req,res) => addReview(req as AuthenticatedRequest, res));
router.put('/profile', (req, res) => updateProfile(req as AuthenticatedRequest, res));

export default router;