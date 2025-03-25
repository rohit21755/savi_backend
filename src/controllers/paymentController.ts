import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import phonePeTokenManager from '../utils/phonePeTokenManager';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = await phonePeTokenManager.getToken();
        console.log('Authorization token obtained');

        const paymentPayloadUat = {
            "merchantId": process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT",
            "merchantTransactionId": uuidv4(),
            "merchantUserId": "MUID123",
            "amount": 10000, 
            "redirectUrl": process.env.PHONEPE_REDIRECT_URL || "https://webhook.site/redirect-url",
            "redirectMode": "REDIRECT",
            "callbackUrl": process.env.PHONEPE_CALLBACK_URL || "https://webhook.site/callback-url",
            "mobileNumber": "9999999999",
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
        };

        const payload = Buffer.from(JSON.stringify(paymentPayloadUat)).toString('base64');
        
        const MERCHANT_KEY = process.env.PHONEPE_MERCHANT_KEY;
        if (!MERCHANT_KEY) {
            throw new Error("PHONEPE_MERCHANT_KEY is not defined");
        }

        const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + 1;

        const options = {
            method: 'POST',
            url: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'Authorization': `Bearer ${token}`
            },
            data: {
                request: payload
            }
        };

        const response = await axios.request(options);
        
        res.status(200).json({
            msg: "Payment initiation successful", 
            url: response.data.data.instrumentResponse.redirectInfo.url
        });

    } catch (error) {
        console.error("Error in payment initiation:", error);
        
        if (axios.isAxiosError(error)) {
            res.status(error.response?.status || 500).json({
                error: 'Failed to initiate payment',
                details: error.response?.data || error.message
            });
        } else {
            res.status(500).json({
                error: 'Unexpected error in payment initiation',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};