import { Request, Response } from 'express';
import prisma from '../prisma-client';
import { AuthenticatedRequest } from '../types/User';

export const addToWishlist = async (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.body;
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const wishlist = await prisma.wishlist.findFirst({
            where: { userId, productId },
        });
        if (!wishlist) {
            await prisma.wishlist.create({
                data: { userId, productId },
            });
        }
        res.status(200).json({ message: 'Product added to wishlist successfully' });
    }
    catch (error) {
        res.status(400).json({
            message: 'Failed to add product to wishlist',
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}

export const viewWishlist = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const wishlist = await prisma.wishlist.findMany({
            where: { userId },
        });
        res.status(200).json({ wishlist });
    }
    catch (error) {
        res.status(400).json({
            message: 'Failed to fetch wishlist',
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}

export const removeFromWishlist = async (req: AuthenticatedRequest, res: Response) => {
    const { productId } = req.body;
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const wishlist = await prisma.wishlist.findFirst({
            where: { userId, productId },
        });
        if (!wishlist) {
            return res.status(404).json({ message: 'Product not found in wishlist' });
        }
        await prisma.wishlist.delete({
            where: { id: wishlist.id },
        });
        res.status(200).json({ message: 'Product removed from wishlist successfully' });
    }
    catch (error) {
        res.status(400).json({
            message: 'Failed to remove product from wishlist',
            error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
    }
}