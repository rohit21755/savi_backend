import { generateUniqueId } from '../utils/random';
import e, { Request, Response } from 'express';
import prisma from '../prisma-client';
export const addProduct = async (req: Request, res: Response) => {
    try {
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
        category,
      } = req.body;
  
    //   const productId = generateUniqueId(name);
    //   const parsedSizes = JSON.parse(sizes || "[]");
    //   const parsedVariants = JSON.parse(variants || "[]");
  
    //   const variantImagesMap = new Map<number, string[]>();
  
    //   if (req.files) {
    //     (req.files as Express.MulterS3.File[]).forEach((file) => {
    //       const variantIndex = parseInt(file.metadata?.variantIndex) || 0;
    //       const currentImages = variantImagesMap.get(variantIndex) || [];
    //       currentImages.push(file.location);
    //       variantImagesMap.set(variantIndex, currentImages);
    //     });
    //   }
  
    //   parsedVariants.forEach((variant: any, index: number) => {
    //     variant.images = variantImagesMap.get(index) || [];
    //   });
  
    //   const variantData = parsedVariants.map((variant: any) => ({
    //     color: variant.color,
    //     images: variant.images || [],
    //   }));
  
      const product = await prisma.product.create({
        data: {
          name,
          type,
          new: newProduct,
          sale: sale,
          originalPrice: parseFloat(originalPrice) || 0,
          sold: parseInt(sold) || 0,
          quantity: parseInt(quantity) || 0,
          sizes: sizes,
          description,
          price: parseFloat(price) || 0,
          stock: parseInt(stock) || 0,
          salePrice: parseFloat(salePrice) || 0,
          category,
    
        },
        include: { variants: true },
      });
  
      res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  export const addProductVariant = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, variantColor, material } = req.body;
  
      if (!req.files || (req.files as Express.MulterS3.File[]).length === 0) {
        res.status(400).json({ message: "No files uploaded" });
        return;
      }
  
      const uploadedImages = (req.files as Express.MulterS3.File[]).map((file) => file.location);
  
      await prisma.variant.create({
        data: {
          color: variantColor,
          material: material || "Unknown",
          images: uploadedImages,
          productId: Number(productId),
        },
      });
  
      console.log("Uploaded Image URLs:", uploadedImages);
  
      res.status(200).json({
        message: "Variant added successfully",
        productId,
        variantColor,
        images: uploadedImages,
      });
    } catch (error) {
      console.error("Error in addProductVariant:", error);
      res.status(500).json({ message: "Server error", error });
    }
  };

  export const getAllProducts = async (req: Request, res: Response) => {
    try {
      console.log("getAllProducts");

      const products = await prisma.product.findMany({
        include: { variants: true, reviews: true },
      });
    
      res.status(200).json({ products });
    } catch (error) {
      res.status(500).json({ error: error});
    }
  };

  export const getAllReviews = async (req: Request, res: Response) => {
    try {
      const productId = req.body.productId;
      const reviews = await prisma.review.findMany({
        where: {
          productId: Number(productId),
        },
      });
      res.status(200).json({ reviews });
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }


  export const deleteProduct = async (req: Request, res: Response) => {
    try {
      const productId = req.body.productId;
      await prisma.variant.deleteMany({
        where: { productId: Number(productId) },
      });
      await prisma.product.delete({
        where: { id: Number(productId) },
      }); 
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error});
    }
  }
  
