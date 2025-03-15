import express, {Request} from "express";
import { addProduct, addProductVariant, getAllReviews, getAllProducts } from "../controllers/productController";
import { isAdminAuthenticated } from "../middlewares/admin";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3"; 
import s3 from "../utils/aws";
import { generateUniqueId } from "../utils/random";
const router = express.Router();
let imageCounter = 1; // Counter to keep track of image numbers

const upload = multer({
  storage: multerS3({
    s3: s3 as unknown as S3,
    bucket: process.env.AWS_BUCKET_NAME as string,
    metadata: (req, file, cb) => {
      const { variantIndex } = (req as Request).body as { variantIndex?: string };
      cb(null, { fieldName: file.fieldname, variantIndex: variantIndex || "0" });
    },
    key: (req, file, cb) => {
      const { productId, productName, variantColor } = (req as Request).body as { productId: string; productName: string; variantColor: string };
      
      const productFolder = `${productName}-${productId}`;
      const fileExtension = file.originalname.split(".").pop();
      const uniqueFileName = `${imageCounter++}.${fileExtension}`; // Sequential naming

      console.log("Uploading to:", `${productFolder}/${variantColor}/${uniqueFileName}`);

      cb(null, `${productFolder}/${variantColor}/${uniqueFileName}`);
    },
  }),
});

  
  
router.post("/add", addProduct);
router.post("/add-variant",upload.array("variants", 5), addProductVariant);
router.get("/all", getAllProducts);
router.get("/reviews", getAllReviews);


export default router;