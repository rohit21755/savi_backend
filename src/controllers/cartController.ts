import { Response } from "express";
import prisma from "../prisma-client";
import { AuthenticatedRequest } from "../types/User";
import { z } from "zod";

const cartSchema = z.object({
    productId: z.number(),
    quantity: z.number().optional().default(1),
    size: z.string().optional(),
    color: z.string().optional(),
});

export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const { productId, quantity, size, color } = cartSchema.parse(req.body);

        const existingItem = await prisma.cart.findFirst({
            where: { userId, productId, size },
        });

        if (existingItem) {
            await prisma.cart.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.cart.create({
                data: { userId, productId, quantity, size },
            });
        }

        res.status(200).json({ message: "Cart updated successfully" });
    } catch (error) {
        res.status(400).json({ 
            message: "Failed to update cart", 
            error: error instanceof Error ? error.message : "An unknown error occurred" 
        });
    }
};

export const viewCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const cart = await prisma.cart.findMany({
            where: { userId },
            select: {
                id: true,
                productId: true,
                quantity: true,
                size: true,

            },
         
        });

        res.status(200).json({ cart });
    } catch (error) {
        res.status(400).json({ 
            message: "Failed to fetch cart", 
            error: error instanceof Error ? error.message : "An unknown error occurred" 
        });
    }
};

export const removeFromCart = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const cartItemId = req.body.cartItemId;
        if (isNaN(cartItemId)) {
            return res.status(400).json({ message: "Invalid cart item ID" });
        }

        const cartItem = await prisma.cart.findUnique({
            where: { id: cartItemId },
        });

        if (!cartItem || cartItem.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to remove this item" });
        }

        await prisma.cart.delete({
            where: { id: cartItemId },
        });

        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (error) {
        res.status(400).json({ 
            message: "Failed to remove item from cart", 
            error: error instanceof Error ? error.message : "An unknown error occurred" 
        });
    }
};
