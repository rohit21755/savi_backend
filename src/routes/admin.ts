import express from 'express';
import { createAdmin, loginAdmin } from '../controllers/adminController';

const router = express.Router();

router.post('/signup', createAdmin); 
router.post('/signin', loginAdmin);

export default router;