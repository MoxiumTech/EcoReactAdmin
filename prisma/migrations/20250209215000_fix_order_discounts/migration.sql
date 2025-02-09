-- AlterTable
ALTER TABLE "Order" DROP COLUMN IF EXISTS "emailDiscount";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "customerDiscount";
ALTER TABLE "Order" DROP COLUMN IF EXISTS "couponDiscount";

-- Add all discount columns
ALTER TABLE "Order" ADD COLUMN "emailDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "customerDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "Order" ADD COLUMN "couponDiscount" DECIMAL(65,30) NOT NULL DEFAULT 0;
