/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `TempOrders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "TempOrders" DROP COLUMN "updatedAt";
