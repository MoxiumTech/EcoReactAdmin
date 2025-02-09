-- Create OrderStatusHistory table
CREATE TABLE "OrderStatusHistory" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "originatorId" TEXT,
    "originatorType" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- Add relationship between Order and StockMovement
ALTER TABLE "StockMovement" ADD COLUMN "orderId" TEXT;

-- Create indexes
CREATE INDEX "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");
CREATE INDEX "StockMovement_orderId_idx" ON "StockMovement"("orderId");

-- Add foreign key constraints
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
