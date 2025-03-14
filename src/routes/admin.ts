import express, { Request, Response } from 'express';
import { createAdmin, loginAdmin } from '../controllers/adminController';
import { z } from 'zod';
const router = express.Router();
router.post('/signup', createAdmin); 
router.post('/signin', loginAdmin);

export default router;