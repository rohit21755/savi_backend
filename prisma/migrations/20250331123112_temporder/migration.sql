-- CreateTable
CREATE TABLE "TempOrders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'pending',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TempOrders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempOrdersItem" (
    "id" SERIAL NOT NULL,
    "tempOrdersId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,
    "size" TEXT,

    CONSTRAINT "TempOrdersItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TempOrdersItem" ADD CONSTRAINT "TempOrdersItem_tempOrdersId_fkey" FOREIGN KEY ("tempOrdersId") REFERENCES "TempOrders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
