import jwt from "jsonwebtoken";
import prisma from "../prisma-client";
import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/User";
export const isUserAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    if (token) {
        try{
            const decoded = jwt.verify(token, "secret");
            req.userDetials = decoded;
            next();
        }
        catch (error) {
            res.status(401).json({
                message: "User not authenticated",
            });
        }
        
    } else {
        res.status(401).json({
            message: "User not authenticated",
        });
    }
};