import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from "pg-sdk-node";
dotenv.config();
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET;
const clientVersion = process.env.CLIENT_VERSION;
const env = Env.PRODUCTION;
console.log(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_VERSION)
//@ts-ignore
const client = StandardCheckoutClient.getInstance(clientId, clientSecret,Number(clientVersion), env)
export const createOrder = async (req: Request, res: Response): Promise<void> => {
    try {
        
        const { phoneNumber, amount, currency } = req.body;
        const merhcartOrderId = crypto.randomUUID();

        const redirectUrl = `${process.env.DEV_URL_WEB}/payment/check`;
        const requestPay = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merhcartOrderId)
        .amount(amount)
        .redirectUrl(redirectUrl)
        .build()

        const response = await client.pay(requestPay)

             res.status(200).json({
            checkoutPageUrl: response.redirectUrl,
        });

    } catch (error) {
        console.error("Error in payment initiation:", error);
        
     
    }
};

export const getPaymentStatus = async (req: Request, res: Response): Promise<void> => {
    try {

        const {merchantOrderId} = req.query

        if (!merchantOrderId || typeof merchantOrderId !== 'string') {
          res.status(400).send("MerchantOrderId is required and must be a string");
        }

        const response = await client.getOrderStatus(merchantOrderId as string)

        const status = response.state

        if(status === "COMPLETED"){
            return res.redirect(`${process.env.DEV_URL_WEB}/payment/success`)
        } else {
            return res.redirect(`${process.env.DEV_URL_WEB}/payment/failure`)
        }

        
    } catch (error) {
        console.error("error creating order" + error)
        res.status(500).send("Error getting status")
    }
}