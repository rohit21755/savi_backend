import express from 'express';

import { createOrder, getPaymentStatus } from '../controllers/paymentController'; 

const router = express.Router(); 
//@ts-ignore
router.post('/create-order', createOrder);
router.get('/get-payment-status', getPaymentStatus);
export default router;
