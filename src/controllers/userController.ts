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
            include: { address: true, }
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
                address: updatedUser.address.map((addr: { address: string }) => addr.address)
            }
        });
    } catch (error) {
        res.status(400).json({
            message: "Profile update failed",
            error: error instanceof Error ? error.message : "An unknown error occurred on backend"
        });
    }
};