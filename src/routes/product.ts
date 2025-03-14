import express, {Request} from "express";
import { addProduct, addProductVariant } from "../controllers/productController";
import { isAdminAuthenticated } from "../middlewares/admin";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3"; 
import s3 from "../utils/aws";
import { generateUniqueId } from "../utils/random";
const router = express.Router();
const upload = multer({
    storage: multerS3({
      s3: s3 as unknown as S3,
      bucket: process.env.AWS_BUCKET_NAME as string,
      metadata: (req, file, cb) => {
        const { variantIndex } = (req as Request).body;
        cb(null, { fieldName: file.fieldname, variantIndex: variantIndex || "0" }); 
      },
      key: (req, file, cb) => {
        const { productName, variantColor } = (req as Request).body;
        console.log(productName, variantColor);
        const uniqueFolderName = generateUniqueId(productName);
        const uniqueFolderVariantName = generateUniqueId(productName, variantColor);
        console.log(uniqueFolderName, uniqueFolderVariantName);
        const fileExtension = file.originalname.split(".").pop()
        cb(null, `${uniqueFolderName}/${variantColor}/${uniqueFolderVariantName}.${fileExtension}`);
      },
    }),
  });
  
router.post("/add", addProduct);
router.post("/add-variant",upload.array("variants", 5), addProductVariant);

export default router;