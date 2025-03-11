import express from 'express';
import { Request, Response } from 'express';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router(); // ✅ Correct Express Router Usage
//@ts-ignore
router.post('/create-order', async (req: Request, res: Response) => {
    try {
        const { name, amount, mobile } = req.body;
        console.log(name, amount, mobile);

        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const orderID = uuidv4();

        const paymentPayload = {
            merchantId: "M22W0J3H2JX3F",
            merchantOrderId: orderID,
            amount: amount ,
            expireAfter: 1200,
            metaInfo: {
                udf1: "additional-information-1",
            },
            paymentFlow: {
                type: "PG_CHECKOUT",
                message: "Payment message used for collect requests",
                merchantUrls: {
                    redirectUrl: "https://www.google.com",
                    callbackUrl: "https://www.google.com",
                },
                paymentModeConfig: {
                    enabledPaymentModes: [
                        { type: "UPI_INTENT" },
                        { type: "UPI_COLLECT" },
                        { type: "UPI_QR" },
                        { type: "NET_BANKING" },
                        {
                            type: "CARD",
                            cardTypes: ["DEBIT_CARD", "CREDIT_CARD"],
                        },
                    ],
                },
            },
        };

        // if (!process.env.PAYMENT_URL || !process.env.PAYMENT_TOKEN) {
        //     return res.status(500).json({ error: 'Payment URL or Token is not defined' });
        // }

        const response = await axios.post("https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay", paymentPayload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'O-Bearer 008b4553-0e1b-407a-acaf-9ef0cc39ca0f'
            },
        });

       

        return res.json({
            message: 'Order created successfully',
            paymentResponse: response.data,
        });

    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ error: 'Failed to create order' });
    }
});

export default router;
