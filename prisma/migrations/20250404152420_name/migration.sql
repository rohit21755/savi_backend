-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "returnRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "returnedAt" TIMESTAMP(3);
