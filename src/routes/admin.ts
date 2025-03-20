import express, { Request, Response } from 'express';
import { createAdmin, loginAdmin, deleteProduct, deleteVariant, updateProductSale } from '../controllers/adminController';
import { isAdminAuthenticated } from "../middlewares/admin";
import { z } from 'zod';
const router = express.Router();
router.post('/signup', createAdmin); 
router.post('/signin', loginAdmin);
router.delete("/product/:id", isAdminAuthenticated, deleteProduct);
router.delete("/variant/:id", isAdminAuthenticated, deleteVariant);
router.put("/product/sale/:id", isAdminAuthenticated, updateProductSale);

export default router;