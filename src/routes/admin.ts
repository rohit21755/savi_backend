import express, { Request, Response } from 'express';
import { createAdmin, loginAdmin, deleteProduct, deleteVariant, updateProductSale, updateProductPrice, updateProductChangeStatus, getOrdersByState, updateOrderState } from '../controllers/adminController';
import { isAdminAuthenticated } from "../middlewares/admin";
import { z } from 'zod';
const router = express.Router();
router.post('/signup', createAdmin); 
router.post('/signin', loginAdmin);
router.delete("/product/:id", isAdminAuthenticated, deleteProduct);
router.delete("/variant/:id", isAdminAuthenticated, deleteVariant);
router.put("/product/sale/:id", isAdminAuthenticated, updateProductSale);
router.put("/product/price/:id", isAdminAuthenticated, updateProductPrice);
router.put("/product/change/:id", isAdminAuthenticated, updateProductChangeStatus);
router.get('/orders-by-state', isAdminAuthenticated, getOrdersByState);
router.put('/order/:id/state', isAdminAuthenticated, updateOrderState);

export default router;