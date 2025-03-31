import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import prisma from '../prisma-client';
import { AuthenticatedRequest } from '../types/User';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from "pg-sdk-node";
dotenv.config();
const clientId = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET;
const clientVersion = process.env.CLIENT_VERSION;
const env = Env.PRODUCTION;
console.log(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.CLIENT_VERSION)
//@ts-ignore
const client = StandardCheckoutClient.getInstance(clientId, clientSecret,Number(clientVersion), env)
export const createOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { address, totalAmount, orderItems } = req.body;
        const amount = 10 * 100;
        const userId   = req.userDetails?.id;
        if (!userId) {
            res.status(401).json({ message: "User not authenticated" });
            return
        }
        const merhcartOrderId = "TXN-Order" + crypto.randomUUID() + "-" + Date.now() + String(userId);
        const tempOrders = await prisma.tempOrders.create({
            data: {
                userId,
                address,
                totalAmount,
                paid: false,
                merchantOrderId: merhcartOrderId
            }
        })
        for (const orderItem of orderItems) {
            await prisma.tempOrdersItem.create({
                data: {
                    tempOrdersId: tempOrders.id,
                    productId: orderItem.productId,
                    quantity: orderItem.quantity,
                    price: orderItem.price,
                    size: orderItem.size,
                }
            })
        }
        const redirectUrl = `${process.env.PROD_URL_WEB}/checkout/${merhcartOrderId}`;
        const requestPay = StandardCheckoutPayRequest.builder()
        .merchantOrderId(merhcartOrderId)
        .amount(amount)
        .redirectUrl(redirectUrl)
        .build()

        const response = await client.pay(requestPay)

             res.status(200).json({
            checkoutPageUrl: response.redirectUrl,
            message: "Order created successfully",
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
            const tempOrder = await prisma.tempOrders.findFirst({
                where: {
                    merchantOrderId: String(merchantOrderId)
                },
                include: {
                    tempOrderItems: true
                }
            })

            if (tempOrder?.userId === undefined) {
                throw new Error("User ID is undefined");
            }

            const newOrder = await prisma.order.create({
                data: {
                    userId: tempOrder.userId,
                    address: String(tempOrder?.address),
                    state: "pending",
                    paid: true,
                    totalAmount: Number(tempOrder?.totalAmount),
                    merchantOrderId: String(merchantOrderId),
                }
            })

            for(const item of tempOrder.tempOrderItems) {
                await prisma.orderItem.create({
                    data: {
                        orderId: newOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size 
                    }
                })
            }

            await prisma.tempOrders.delete({
                where:{
                    merchantOrderId: String(merchantOrderId)
                }
            })

            

        } else {
            await prisma.tempOrders.delete({
                where:{
                    merchantOrderId: String(merchantOrderId)
                }
            })
            res.status(401).json({
                status: status,
                message: "Payment not completed"
            })
            
        }

        res.status(200).json({
            status: status,
            message: "data added to db"
        })

        
    } catch (error) {
        console.error("error creating order" + error)
        res.status(500).send("Error getting status")
    }
}