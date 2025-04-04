/*
  Warnings:

  - You are about to drop the column `cancelledBy` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cancelledBy";

-- AlterTable
ALTER TABLE "RefundedOrders" ALTER COLUMN "merchantRefundId" DROP NOT NULL;
