import { Request, Response } from "express";
import  prisma  from '../prisma-client';
import { z } from 'zod';
import  jwt  from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { AuthenticatedRequest } from "../types/User";
const userSchemaSignUp = z.object({
    name: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string()
});
export const createUser = async (req: Request, res: Response) => {
    const { name, email, password, phoneNumber } = userSchemaSignUp.parse(req.body);
    console.log(name, email, password, phoneNumber);
    const newPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
        data: {
            name,
            email,
            password : newPassword,
            phoneNumber
        }

    })
    res.status(200).json({
        message: 'User created successfully',

        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber
        }
    });}
    catch (error) {
        res.status(400).json({
            message: 'User creation failed',
            error
        })
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where:{
                email
            },
            include: {
                address: true
            }
        })
        
        if(!user){
            res.status(400).json({
                message: 'User not found',
            })
        }
        else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(isPasswordValid){
                const token = jwt.sign({id: user.id, email:user.email}, "secret");
                res.status(200).json({
                    message: 'User login successful',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        address: user.address
                    }
                })
            }
            else {
                res.status(400).json({
                    message: 'Invalid password',
                })
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'User login failed',
            error
        })
    }
}

export const addReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { title, description, rating,  productId } = req.body;
        const userId   = req.userDetails?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return
        }
        const userName = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                name: true
            }
        })
        const review = await prisma.review.create({
            data: {
                title,
                description,
                rating,
                productId,
                userId,
                userName: userName?.name || ""
            }
        })
        res.status(200).json({ message: "Review added successfully", review });
    }
    catch (error) {
        res.status(400).json({ message: "Failed to add review", error: error instanceof Error ? error.message : "An unknown error occurred" });

    }
}

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userDetails?.id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const updateProfileSchema = z.object({
            name: z.string().min(3).max(30).optional(),
            phoneNumber: z.string().optional(),
            address: z.string().optional()
        });

        const validatedData = updateProfileSchema.parse(req.body);

        const updateObject: any = {
            name: validatedData.name,
            phoneNumber: validatedData.phoneNumber
        };

        if (validatedData.address) {
            updateObject.address = {
                updateMany: {
                    where: { userId },
                    data: { address: validatedData.address }
                }
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateObject,
            include: { address: true }
        });

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                phoneNumber: updatedUser.phoneNumber,
                address: updatedUser.address?.address
            }
        });
    } catch (error) {
        res.status(400).json({
            message: "Profile update failed",
            error: error instanceof Error ? error.message : "An unknown error occurred on backend"
        });
    }
};

export const getOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userDetails?.id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                orderItems: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Fetch product details separately
        const productIds = orders.flatMap(order => order.orderItems.map(item => item.productId));
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            include: {
                variants: true
            }
        });

        // Map product details to order items
        const ordersWithProducts = orders.map(order => ({
            ...order,
            orderItems: order.orderItems.map(item => ({
                ...item,
                productImage: products.find(product => product.id === item.productId)?.variants[0].images[0],
                productName: products.find(product => product.id === item.productId)?.name,
            }))
        }));

        res.status(200).json({ message: "Orders retrieved successfully", orders: ordersWithProducts });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
    }
};


export const emptyCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userDetails?.id;

        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return;
        }

        await prisma.cart.deleteMany({
            where: { userId }
        });

        res.status(200).json({ message: "Cart emptied successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to empty cart",
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
    }
};

export const retrunOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { orderId, merchantOrderId } = req.body;
    const userId = req.userDetails?.id;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const order = await prisma.order.findUnique({
        where: {    
            id: orderId,
            merchantOrderId: String(merchantOrderId),
        }
    });

    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    if(order.state !== "delivered"){
        res.status(400).json({ message: "Order is not eligible for return" });
    }
    try
  {  await prisma.order.update({
        where: { id: orderId },
        data: { state: "returned" }
    });

    await prisma.refundedOrders.create({
        data: {
            orderId: orderId,
            userId: userId,
            merchantOrderId: merchantOrderId,
            amount: order.totalAmount,
            createdAt: new Date(),
            state: "returned"
        }
    });

    res.status(200).json({ message: "Order returned successfully" });}
    catch (error) {
        res.status(500).json({
            message: "Failed to return order",
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
    }   
   
}

export const cancelOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { orderId, merchantOrderId } = req.body;
    const userId = req.userDetails?.id;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }
    const order = await prisma.order.findUnique({
        where: {    
            id: orderId,
            merchantOrderId: String(merchantOrderId),
        }
    });
    
    if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
    }
    try
  {  await prisma.order.update({
        where: { id: orderId },
        data: { state: "cancelled" }
    });

    await prisma.refundedOrders.create({
        data: {
            orderId: orderId,
            userId: userId,
            merchantOrderId: merchantOrderId,
            amount: order.totalAmount,
            createdAt: new Date(),
            state: "cancelled"
        }
    });

    res.status(200).json({ message: "Order cancelled successfully" });}
    catch (error) {
        res.status(500).json({
            message: "Failed to cancel order",
            error: error instanceof Error ? error.message : "An unknown error occurred"
        });
    }
}