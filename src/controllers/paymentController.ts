import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import phonePeTokenManager from '../utils/phonePeTokenManager';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        const token = await phonePeTokenManager.getToken();
        console.log('Authorization token obtained', token);

        const paymentPayloadUat = {
            "merchantOrderId": "TX123456asdfdsafasdfdsfasdfasdf",
            "amount": 100,
            "expireAfter": 1200,
            
            "paymentFlow": {
                "type": "PG_CHECKOUT",
                "message": "Payment message used for collect requests",
                "merchantUrls": {
                    "redirectUrl": ""
                },
                
                "paymentModeConfig": {
                    "enabledPaymentModes": [
                        {
                            "type": "UPI_INTENT"
                        },
                        {
                            "type": "UPI_COLLECT"
                        },
                        {
                            "type": "UPI_QR"
                        },
                        {
                            "type": "NET_BANKING"
                        },
                        {
                            "type": "CARD",
                            "cardTypes": [
                                "DEBIT_CARD",
                                "CREDIT_CARD"
                            ]
                        }
                    ]
                }
            }
        };
        if(!token){
            throw new Error("Token is not defined");
        }
        const response = await axios.post("https://api.phonepe.com/apis/pg/checkout/v2/pay", paymentPayloadUat, {
            headers: {
                "Authorization": `O-Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        console.log(response.data);

        // const payload = Buffer.from(JSON.stringify(paymentPayloadUat)).toString('base64');
        
        // const MERCHANT_KEY = process.env.PHONEPE_MERCHANT_KEY;
        // if (!MERCHANT_KEY) {
        //     throw new Error("PHONEPE_MERCHANT_KEY is not defined");
        // }

        // const string = payload + '/pg/v1/pay' + MERCHANT_KEY;
        // const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        // const checksum = sha256 + '###' + 1;

        // const options = {
        //     method: 'POST',
        //     url: "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay",
        //     headers: {
        //         accept: 'application/json',
        //         'Content-Type': 'application/json',
        //         'X-VERIFY': checksum,
        //         'Authorization': `Bearer ${token}`
        //     },
        //     data: {
        //         request: payload
        //     }
        // };

        // const response = await axios.request(options);
        
        // res.status(200).json({
        //     msg: "Payment initiation successful", 
        //     url: response.data.data.instrumentResponse.redirectInfo.url
        // });
        res.json(response.data)

    } catch (error) {
        console.error("Error in payment initiation:", error);
        
        // if (axios.isAxiosError(error)) {
        //     res.status(error.response?.status || 500).json({
        //         error: 'Failed to initiate payment',
        //         details: error.response?.data || error.message
        //     });
        // } else {
        //     res.status(500).json({
        //         error: 'Unexpected error in payment initiation',
        //         details: error instanceof Error ? error.message : 'Unknown error'
        //     });
        // }
    }
};