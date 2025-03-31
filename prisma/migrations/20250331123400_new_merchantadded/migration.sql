/*
  Warnings:

  - A unique constraint covering the columns `[merchantOrderId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[merchantOrderId]` on the table `TempOrders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `merchantOrderId` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `merchantOrderId` to the `TempOrders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "merchantOrderId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TempOrders" ADD COLUMN     "merchantOrderId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Order_merchantOrderId_key" ON "Order"("merchantOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "TempOrders_merchantOrderId_key" ON "TempOrders"("merchantOrderId");
