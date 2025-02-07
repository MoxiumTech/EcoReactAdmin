-- Drop existing indexes and constraints
DROP INDEX IF EXISTS "StaffInvitation_storeId_idx";
DROP INDEX IF EXISTS "StaffInvitation_roleId_idx";
ALTER TABLE "StaffInvitation" DROP CONSTRAINT IF EXISTS "StaffInvitation_email_storeId_key";

-- Create new indexes
CREATE INDEX IF NOT EXISTS "StaffInvitation_token_idx" ON "StaffInvitation"("token");
CREATE INDEX IF NOT EXISTS "StaffInvitation_email_idx" ON "StaffInvitation"("email");
CREATE INDEX IF NOT EXISTS "StaffInvitation_storeId_idx" ON "StaffInvitation"("storeId");
CREATE INDEX IF NOT EXISTS "StaffInvitation_roleId_idx" ON "StaffInvitation"("roleId");
CREATE INDEX IF NOT EXISTS "StaffInvitation_status_idx" ON "StaffInvitation"("status");

-- Create unique constraint for email, storeId, and status
CREATE UNIQUE INDEX "StaffInvitation_email_storeId_status_key" ON "StaffInvitation"("email", "storeId", "status");

-- Add comment to explain the status field
COMMENT ON COLUMN "StaffInvitation"."status" IS 'Status of the invitation: pending, accepted, or expired';
