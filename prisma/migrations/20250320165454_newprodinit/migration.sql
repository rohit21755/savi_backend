/*
  Warnings:

  - The `category` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
ADD COLUMN     "category" TEXT[];

-- CreateTable
CREATE TABLE "Token" (
    "id" SERIAL NOT NULL,
    "Token" TEXT NOT NULL,
    "EncryptedToken" TEXT NOT NULL,
    "issuedAt" BIGINT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "sessionExpiredAt" BIGINT NOT NULL,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);
