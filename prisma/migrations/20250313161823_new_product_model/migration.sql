/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Variants` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Variants" DROP CONSTRAINT "Variants_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "userId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Variants";

-- CreateTable
CREATE TABLE "Variant" (
    "id" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "images" TEXT[],
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Variant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Variant" ADD CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
