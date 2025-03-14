import express, { Request, Response } from 'express';
import { createAdmin, loginAdmin } from '../controllers/adminController';
import { z } from 'zod';
const router = express.Router();
import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3"; // Import S3 type from AWS SDK v3
import s3 from "../utils/aws";
import { generateUniqueId } from "../utils/random";

const upload = multer({
    storage: multerS3({
      s3: s3 as unknown as S3,
      bucket: process.env.AWS_BUCKET_NAME as string,
      acl: "public-read",
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        const { productName, variantColor } = (req as Request).body;
        const productId = generateUniqueId(productName); 
        const variantId = generateUniqueId(productName, variantColor); 
        const fileExtension = file.originalname.split(".").pop(); 
  
        cb(null, `${productId}/${variantId}/${Date.now()}.${fileExtension}`); 
      },
    }),
  });




router.post('/signup', createAdmin); 
router.post('/signin', loginAdmin);

export default router;