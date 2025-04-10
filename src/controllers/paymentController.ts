import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import prisma from '../prisma-client';
import { AuthenticatedRequest } from '../types/User';
import { StandardCheckoutClient, Env, StandardCheckoutPayRequest, RefundRequest } from "pg-sdk-node";
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
        const amount = 1 * 100;
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
        const { merchantOrderId } = req.query;

        if (!merchantOrderId || typeof merchantOrderId !== 'string') {
            res.status(400).send("MerchantOrderId is required and must be a string");
            return;
        }

        const response = await client.getOrderStatus(merchantOrderId);
        const status = response.state;

        if (status === "COMPLETED") {
            const tempOrder = await prisma.tempOrders.findFirst({
                where: {
                    merchantOrderId: String(merchantOrderId)
                },
                include: {
                    tempOrderItems: true
                }
            });

            if (!tempOrder || !tempOrder.tempOrderItems || tempOrder.userId === undefined) {
                throw new Error("Invalid temporary order data");
            }

            // Create a separate Order for each product
            for (const item of tempOrder.tempOrderItems) {
                const singleProductOrder = await prisma.order.create({
                    data: {
                        userId: tempOrder.userId,
                        address: tempOrder.address,
                        state: "pending",
                        paid: true,
                        totalAmount: item.price * item.quantity,
                        merchantOrderId: `${merchantOrderId}-${item.id}`, // Unique per item
                    }
                });

                await prisma.orderItem.create({
                    data: {
                        orderId: singleProductOrder.id,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        size: item.size,
                    }
                });
            }

            // Clean up temp order (cascade will delete items)
            await prisma.tempOrders.delete({
                where: {
                    merchantOrderId: String(merchantOrderId)
                }
            });

            res.status(200).json({
                status: status,
                message: "Individual orders created per product"
            });

        } else {
            // Payment not completed - clean up
            await prisma.tempOrders.delete({
                where: {
                    merchantOrderId: String(merchantOrderId)
                }
            });

            res.status(401).json({
                status: status,
                message: "Payment not completed"
            });
        }

    } catch (error) {
        console.error("Error creating orders from payment:", error);
        res.status(500).send("Error getting status");
    }
};


export const refundOrder = async (req: Request, res: Response): Promise<void> => {
    const { orderId, merchantOrderId, refundOrderId } = req.body;
    if (!orderId || !merchantOrderId) {
        res.status(400).json({ message: "Order ID and Merchant Order ID are required" });
        return;
    }
    
    try{
        const order = await prisma.order.findUnique({
            where: {
                id: Number(orderId),
                merchantOrderId: merchantOrderId
            }
        });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return;
        }
        if(order.state !== "cancelled" && order.state !== "returned"){
            res.status(400).json({ message: "Order is not eligible for refund" });
            return;
        }
        
        
     
            await prisma.refundedOrders.update({
                where: {
                    id: Number(orderId),
                    merchantOrderId: merchantOrderId
                },
                data: {
                    state: "PENDING",
                    merchantRefundId: refundOrderId,
                }
            })
            
      
        
        res.status(200).json({
            message: "Refund in Process",
        })
            

    }
    catch (error) {
        res.status(500).json({ message: "Error processing refund", error });
    }

}

export const getRefundStatus = async (req: Request, res: Response): Promise<void> => {
    const {merchantOrderId} = req.query;
    if (!merchantOrderId || typeof merchantOrderId !== 'string') {
        res.status(400).send("MerchantOrderId is required and must be a string");
        return;
    }
    const refundOrder = await prisma.refundedOrders.findUnique({
        where: {
            merchantOrderId: String(merchantOrderId)
        }
    })
    if (!refundOrder) {
        res.status(404).json({ message: "Refund not found" });
        return;
    }
    try{
        const response = await client.getRefundStatus(String(refundOrder.merchantRefundId));
        const status = response.state;
        if (status === "COMPLETED") {
            await prisma.refundedOrders.update({
                where: {
                    id: refundOrder.id,
                    merchantOrderId: String(merchantOrderId)
                },
                data: {
                    state: status,
                    refundedAt: new Date()
                }
            })
            res.status(200).json({
                status: status,
                message: "Refund completed"
            })
        }
        else if (status === "PENDING") {
            res.status(200).json({
                status: status,
                message: "Refund pending"
            })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error getting refund status", error });
    }
}
