import { generateUniqueId } from '../utils/random';
import { Request, Response } from 'express';
import prisma from '../prisma-client';
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
