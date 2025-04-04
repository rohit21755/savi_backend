import express, { Request, Response } from 'express';
import { createAdmin, loginAdmin, deleteProduct, deleteVariant, updateProductSale, updateProductPrice, updateProductChangeStatus, getOrdersByState, updateOrderState } from '../controllers/adminController';
import { isAdminAuthenticated } from "../middlewares/admin";
import { z } from 'zod';
const router = express.Router();
router.post('/signup', createAdmin); 
router.post('/signin', loginAdmin);
router.delete("/product/:id",  deleteProduct);
router.delete("/variant/:id",  deleteVariant);
router.put("/product/sale/:id",  updateProductSale);
router.put("/product/price/:id",  updateProductPrice);
router.put("/product/change/:id", updateProductChangeStatus);
router.get('/orders',  getOrdersByState);
router.put('/order/:id/state',  updateOrderState);

export default router;