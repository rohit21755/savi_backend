import express from 'express';
import { createUser, loginUser, addReview,  updateProfile, getOrders, cancelOrder, retrunOrder } from '../controllers/userController';
import { AuthenticatedRequest } from '../types/User';
import { isUserAuthenticated } from '../middlewares/user';
const router = express.Router();

router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/review', isUserAuthenticated,(req,res) => addReview(req as AuthenticatedRequest, res));
router.put('/profile', (req, res) => updateProfile(req as AuthenticatedRequest, res));
router.get('/orders', isUserAuthenticated, (req, res) => getOrders(req as AuthenticatedRequest, res));
router.post('/cancel-order', isUserAuthenticated, (req, res) => cancelOrder(req as AuthenticatedRequest, res));
router.post('/return-order', isUserAuthenticated, (req, res) => retrunOrder(req as AuthenticatedRequest, res));

export default router;