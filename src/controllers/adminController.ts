import { Request, Response } from 'express';
import prisma from '../prisma-client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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