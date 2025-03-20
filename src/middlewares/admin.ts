import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/User";
import prisma from "../prisma-client";

export const isAdminAuthenticated = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            res.status(401).json({ message: "Unauthorized: No token provided" });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number };

        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user || !user.isAdmin) {
            res.status(403).json({ message: "Forbidden: Admin access required" });
            return;
        }

        (req as AuthenticatedRequest).userDetails = { id: user.id, isAdmin: user.isAdmin };
        next();
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
        return;
    }
};