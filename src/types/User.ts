import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    userDetials: any;
}