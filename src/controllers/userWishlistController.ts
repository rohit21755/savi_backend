import { Response } from 'express';
import prisma from '../prisma-client';
import { AuthenticatedRequest } from '../types/User';

/**
 * Add a product to the wishlist
 */
export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Convert IDs to numbers to match Prisma schema
        const numericUserId = Number(userId);
        const numericProductId = Number(productId);

        // Check if the product is already in the wishlist
        const existingWishlistItem = await prisma.wishlist.findFirst({
            where: { userId: numericUserId, productId: numericProductId },
        });

        if (existingWishlistItem) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        // Add product to wishlist
        await prisma.wishlist.create({
            data: { userId: numericUserId, productId: numericProductId },
        });

        res.status(201).json({ message: 'Product added to wishlist successfully' });

    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Failed to add product to wishlist', error: error});
    }
};


export const viewWishlist = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Fetch all wishlist items for the user
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: Number(userId) },
           
        });

        res.status(200).json({ wishlist });

    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Failed to fetch wishlist', error: error});
    }
};

/**
 * Remove a product from the wishlist
 */
export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;
        const { productId } = req.body;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const numericUserId = Number(userId);
        const numericProductId = Number(productId);

        // Check if product exists in wishlist
        const wishlistItem = await prisma.wishlist.findFirst({
            where: { userId: numericUserId, productId: numericProductId },
        });

        if (!wishlistItem) {
            return res.status(404).json({ message: 'Product not found in wishlist' });
        }

        // Remove product from wishlist
        await prisma.wishlist.delete({
            where: { id: wishlistItem.id },
        });

        res.status(200).json({ message: 'Product removed from wishlist successfully' });

    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Failed to remove product from wishlist', error: error });
    }
};
