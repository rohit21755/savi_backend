import express, {Request} from "express";
import { addProduct, addProductVariant, getAllReviews, getAllProducts, deleteProduct, getAllProducts2 } from "../controllers/productController";
import { isAdminAuthenticated } from "../middlewares/admin";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3 } from "@aws-sdk/client-s3"; 
import s3 from "../utils/aws";
import { generateUniqueId } from "../utils/random";
const router = express.Router();
let imageCounter = 1; // Counter to keep track of image numbers

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
  storage: multerS3({
    s3: s3 as unknown as S3,
    bucket: process.env.AWS_BUCKET_NAME as string,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const { productId, productName, variantColor } = (req as Request).body as {
        productId: string;
        productName: string;
        variantColor: string;
      };
      const productFolder = `${productName}-${productId}`;
      const fileExtension = file.originalname.split(".").pop();
      const uniqueFileName = `${Date.now()}-${imageCounter++}.${fileExtension}`;
      
      console.log("Uploading to:", `${productFolder}/${variantColor}/${uniqueFileName}`);
      cb(null, `${productFolder}/${variantColor}/${uniqueFileName}`);
    },
  }),
});

  
  
router.post("/add", addProduct);
router.post("/add-variant",upload.array("variants", 5), addProductVariant);
router.get("/all", getAllProducts);
router.get("/all-products", getAllProducts2);
router.post("/reviews", getAllReviews);
router.delete("/delete", deleteProduct);


export default router;
