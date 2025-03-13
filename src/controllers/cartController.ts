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

        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { cartItems: true },
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId },
                include: { cartItems: true },
            });
        }

        if (!cart) {
            return res.status(500).json({ message: "Failed to create cart" });
        }

        const existingItem = await prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId, size, color },
        });

        if (existingItem) {
            await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity, size, color },
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

        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: { cartItems: true },
        });

        if (!cart || cart.cartItems.length === 0) {
            return res.status(404).json({ message: "Cart is empty" });
        }

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

        const cartItemId = parseInt(req.params.id, 10);
        if (isNaN(cartItemId)) {
            return res.status(400).json({ message: "Invalid cart item ID" });
        }

        const cartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true },
        });

        if (!cartItem || cartItem.cart.userId !== userId) {
            return res.status(403).json({ message: "Unauthorized to remove this item" });
        }

        await prisma.cartItem.delete({
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