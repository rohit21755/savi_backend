import express from 'express';
import { isUserAuthenticated } from '../middlewares/user';
import { addToWishlist, viewWishlist, removeFromWishlist } from '../controllers/userWishlistController';
import { AuthenticatedRequest } from '../types/User';

const router = express.Router();

router.post('/', isUserAuthenticated, async (req, res) => {
    await addToWishlist(req as AuthenticatedRequest, res);
});

router.get('/', isUserAuthenticated, async (req, res) => {
    await viewWishlist(req as AuthenticatedRequest, res);
});

router.delete('/', isUserAuthenticated, async (req, res) => {
    await removeFromWishlist(req as AuthenticatedRequest, res);
});

export default router;