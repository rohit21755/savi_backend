import { Request, Response } from 'express';
import prisma from '../prisma-client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../utils/aws';
import { generateUniqueId } from '../utils/random';
const adminSchema = z.object({
    name: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string()
});


export const createAdmin = async (req: Request, res: Response) => {
    const { name, email, password, phoneNumber } = adminSchema.parse(req.body);
    console.log( name, email, password, phoneNumber );

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                isAdmin: true
            }
        })

        res.status(200).json({
            message: 'Admin created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isAdmin: user.isAdmin
            }
        })
    }
    catch (error) {
        res.status(400).json({
            message: 'Admin creation failed',
            error
        })
    }
}

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user) {
            res.status(404).json({
                message: 'Admin not found'
            })
        }else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(isPasswordValid) {
                const token = jwt.sign({ id: user.id, email: user.email}, "secret");
                res.status(200).json({
                    message: 'Admin login successful',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber
                    }
                })
            } else {
                res.status(400).json({
                    message: 'Incorrect email/password'
                })
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'Admin login failed',
            error
        })
    }
}

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        await prisma.product.delete({ where: { id: productId } });

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete product", error: error instanceof Error ? error.message : error });
    }
};

export const deleteVariant = async (req: Request, res: Response): Promise<void> => {
    try {
        const variantId = parseInt(req.params.id);

        if (isNaN(variantId)) {
            res.status(400).json({ message: "Invalid variant ID" });
            return;
        }

        const variant = await prisma.variant.findUnique({ where: { id: variantId } });

        if (!variant) {
            res.status(404).json({ message: "Variant not found" });
            return;
        }

        await prisma.variant.delete({ where: { id: variantId } });

        res.status(200).json({ message: "Variant deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete variant", error: error instanceof Error ? error.message : error });
    }
};

const saleSchema = z.object({
    sale: z.boolean(),
    salePrice: z.number().positive()
});

export const updateProductSale = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const validatedData = saleSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ message: "Invalid request data", error: validatedData.error.errors });
            return;
        }

        const { sale, salePrice } = validatedData.data;

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                sale,
                salePrice: sale ? salePrice : undefined
            }
        });

        res.status(200).json({
            message: `Product ${sale ? "put on sale" : "sale removed"} successfully`,
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to update product sale", error: error instanceof Error ? error.message : error });
    }
};

const priceSchema = z.object({
    price: z.number().positive(),
})

export const updateProductPrice = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(req.params.id);

        if(isNaN(productId)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const validatedData = priceSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ message: "Invalid price data", error: validatedData.error.errors });
            return;
        }

        const { price } = validatedData.data;

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { price }
        });

        res.status(200).json({
            message: "Product price updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update product price",
            error: error instanceof Error ? error.message: error
        });
    }
};

const changeStatusSchema = z.object({
    upForChange: z.boolean(),
});

export const updateProductChangeStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const productId = parseInt(req.params.id);

        if (isNaN(productId)) {
            res.status(400).json({ message: "Invalid product ID" });
            return;
        }

        const validatedData = changeStatusSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ message: "Invalid request data", error: validatedData.error.errors });
            return;
        }

        const { upForChange } = validatedData.data;

        const product = await prisma.product.findUnique({ where: { id: productId } });

        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: { upForChange },
        });

        res.status(200).json({
            message: `Product is ${upForChange ? "now" : "no longer"} up for change`,
            product: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update product change status",
            error: error instanceof Error ? error.message : error,
        });
    }
};

export const getOrdersByState = async (req: Request, res: Response): Promise<void> => {
    try {

        const orders = await prisma.order.findMany();

        const groupedOrders = orders.reduce((acc: Record<string, any[]>, order) => {
            if (!acc[order.state]) {
                acc[order.state] = [];
            }
            acc[order.state].push(order);
            return acc;
        }, {});

        res.status(200).json(groupedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error: error instanceof Error ? error.message : error });
    }
};

const orderStateSchema = z.object({
    state: z.enum(["pending", "shipped", "delivered", "canceled"]) // Adjust kr diyo jo jo use karra hai values
});

export const updateOrderState = async (req: Request, res: Response): Promise<void> => {
    try {
        const orderId = parseInt(req.params.id);

        if (isNaN(orderId)) {
            res.status(400).json({ message: "Invalid order ID" });
            return;
        }

        const validatedData = orderStateSchema.safeParse(req.body);
        if (!validatedData.success) {
            res.status(400).json({ message: "Invalid state", error: validatedData.error.errors });
            return;
        }

        const { state } = validatedData.data;

        const order = await prisma.order.findUnique({ where: { id: orderId } });

        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: { state }
        });

        res.status(200).json({
            message: "Order state updated successfully",
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update order state",
            error: error instanceof Error ? error.message : error
        });
    }
};