import { Request, Response } from "express";
import { AuthenticatedRequest } from "../types/User";
import prisma from '../prisma-client';
import { z } from 'zod';

const addressSchema = z.object({
    address: z.string().min(5),
    state: z.string(),
    city: z.string(),
    zip: z.number()
});

export const createAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try { 
        const { address, state, city, zip } = addressSchema.parse(req.body);
        const userId = req.userDetails?.id;

        if (!userId) {
            res.status(401).json({ message: 'UserId invalid/missing' });
            return;
        }

        const newAddress = await prisma.address.create({
            data: { address, state, city, zip, userId },
           
        });

        res.status(201).json({ message: "Address saved successfully", address: newAddress });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "Failed to save address", error });
    }
};

export const getAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userDetails?.id;

        if(!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return 
        }

        const addresses = await prisma.address.findMany({
            where: { userId }
        });

        res.status(200).json({ addresses });
    }
    catch (error) {
        res.status(500).json({
            message: "Failed to fetch address",
            error: error
        })
    }
};

export const updateAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userDetails?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return 
        }

        const { id, address, city, state, zip } = req.body;

        const existingAddress = await prisma.address.findUnique({
            where: { id }
        });

        if(!existingAddress || existingAddress.userId !== userId) {
            res.status(403).json({ message: "Unauthorized to update this address" });
            return 
        }

        const updatedAddress = await prisma.address.update({
            where: { id },
            data: { address, city, state, zip }
        });

        res.status(200).json({ message: "Address updated successfully", address: updatedAddress })
        
    }
    catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Failed to update address",
            error: error
        });
    }
};

export const deleteAddress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userDetails?.id;

        if(!userId) {
            res.status(403).json({ message: "Unauthorized to delete this address" })
            return 
        }

        const { id } = req.body;

        const exisitingAddress = await prisma.address.findUnique({
            where: { id }
        });

        if(!exisitingAddress || exisitingAddress.userId !== userId) {
            res.status(403).json({ message: "Unauthorized to delete this address" });
            return 
        }
        
        await prisma.address.delete({
            where: { id },
        });

        res.status(200).json({ message: "Address deleted successfully" });
    }
    catch (error) {
        res.status(400).json({
            message: "Failed to delete address",
            error: error
        });
    }
};