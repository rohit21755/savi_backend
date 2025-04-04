-- CreateTable
CREATE TABLE "RefundedOrders" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "merchantOrderId" TEXT NOT NULL,
    "merchantRefundId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refundedAt" TIMESTAMP(3),
    "cancelled" BOOLEAN NOT NULL DEFAULT false,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "pickedUp" BOOLEAN NOT NULL DEFAULT false,
    "state" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "RefundedOrders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefundedOrders_merchantOrderId_key" ON "RefundedOrders"("merchantOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "RefundedOrders_merchantRefundId_key" ON "RefundedOrders"("merchantRefundId");
