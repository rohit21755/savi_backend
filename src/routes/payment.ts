import express from 'express';

import { createOrder, getPaymentStatus, refundOrder } from '../controllers/paymentController'; 
import { isUserAuthenticated } from '../middlewares/user';
import { AuthenticatedRequest } from "../types/User";
const router = express.Router(); 
//@ts-ignore
router.post('/create-order',isUserAuthenticated, async(req,res) => await createOrder(req as AuthenticatedRequest, res));
router.get('/get-payment-status', getPaymentStatus);
router.post('/refund', refundOrder);
router.get('/refund-status', refundOrder);
export default router;
