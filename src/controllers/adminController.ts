import { Request, Response } from 'express';
import prisma from '../prisma-client';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../utils/aws';
import { generateUniqueId } from '../utils/random';
const adminSchema = z.object({
    name: z.string().min(3).max(30),
    email: z.string().email(),
    password: z.string().min(8),
    phoneNumber: z.string()
});

export const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_BUCKET_NAME as string,
      acl: "public-read",
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `variants/${Date.now()}-${file.originalname}`);
      },
    }),
  });
export const createAdmin = async (req: Request, res: Response) => {
    const { name, email, password, phoneNumber } = adminSchema.parse(req.body);
    console.log( name, email, password, phoneNumber );

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phoneNumber,
                isAdmin: true
            }
        })

        res.status(200).json({
            message: 'Admin created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                isAdmin: user.isAdmin
            }
        })
    }
    catch (error) {
        res.status(400).json({
            message: 'Admin creation failed',
            error
        })
    }
}

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        })

        if(!user) {
            res.status(404).json({
                message: 'Admin not found'
            })
        }else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if(isPasswordValid) {
                const token = jwt.sign({ id: user.id, email: user.email}, "secret");
                res.status(200).json({
                    message: 'Admin login successful',
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phoneNumber: user.phoneNumber
                    }
                })
            } else {
                res.status(400).json({
                    message: 'Incorrect email/password'
                })
            }
        }
    }
    catch (error) {
        res.status(400).json({
            message: 'Admin login failed',
            error
        })
    }
}
export const addProduct = async (req: Request, res: Response) => {
    try{
        const {
            name,
            type,
            newProduct,
            sale,
            originalPrice,
            sold,
            quantity,
            sizes,
            description,
            price,
            stock,
            salePrice,
            categoryId,
            category,
            variants,
          } = req.body;
      
          // Generate Unique Product ID
          const productId = generateUniqueId(name);
          const parsedSizes = JSON.parse(sizes);
          const parsedVariants = JSON.parse(variants);
      
          // Attach images to variants
          if (req.files) {
            let fileIndex = 0; // Track files uploaded for correct mapping
            //@ts-ignore
            req.files.forEach((file: Express.MulterS3.File) => {
              const variantIndex = Math.floor(fileIndex / 3); // Assuming 3 images per variant
              if (parsedVariants[variantIndex]) {
                if (!parsedVariants[variantIndex].image) {
                  parsedVariants[variantIndex].image = [];
                }
                parsedVariants[variantIndex].image.push(file.location);
              }
              fileIndex++;
            });
          }
      
          // Add Unique IDs to Variants
          const variantData = parsedVariants.map((variant: any) => ({
            uuid: generateUniqueId(name, variant.color),
            color: variant.color,
            image: variant.image || [],
          }));
      
          // Create Product in DB
          const product = await prisma.product.create({
            data: {
            
              name,
              type,
              new: JSON.parse(newProduct),
              sale: JSON.parse(sale),
              originalPrice: parseFloat(originalPrice),
              sold: parseInt(sold),
              quantity: parseInt(quantity),
              sizes: parsedSizes,
              description,
              price: parseFloat(price),
              stock: parseInt(stock),
              salePrice: parseFloat(salePrice),
              category,
              variants: {
                create: variantData,
              },
            },
            include: { variants: true },
          });
      
          res.status(201).json({ message: "Product created successfully", product });
    }
    catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}