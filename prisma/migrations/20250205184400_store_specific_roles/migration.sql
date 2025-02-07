-- Remove unique constraint from role name
ALTER TABLE "Role" DROP CONSTRAINT IF EXISTS "Role_name_key";

-- Add storeId to Role table
ALTER TABLE "Role" ADD COLUMN IF NOT EXISTS "storeId" TEXT NOT NULL;

-- Add foreign key constraint
ALTER TABLE "Role" ADD CONSTRAINT "Role_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraint for name within a store
ALTER TABLE "Role" ADD CONSTRAINT "Role_name_storeId_key" UNIQUE ("name", "storeId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "Role_storeId_idx" ON "Role"("storeId");

-- Function to initialize default roles
CREATE OR REPLACE FUNCTION initialize_store_roles()
RETURNS TRIGGER AS $$
DECLARE
  default_roles JSON[];
  role JSON;
  role_id UUID;
  store_id UUID;
BEGIN
  store_id := NEW.id;
  
  default_roles := ARRAY[
    '{"name": "Store Admin", "description": "Full access to manage store operations"}',
    '{"name": "Catalog Manager", "description": "Manage product catalog and inventory"}',
    '{"name": "Order Manager", "description": "Process orders and manage customers"}',
    '{"name": "Content Manager", "description": "Manage content and marketing"}',
    '{"name": "Analytics Viewer", "description": "View store analytics and reports"}'
  ]::JSON[];

  FOREACH role IN ARRAY default_roles
  LOOP
    INSERT INTO "Role" ("id", "name", "description", "storeId", "createdAt", "updatedAt")
    VALUES (
      gen_random_uuid(),
      role->>'name',
      role->>'description',
      store_id,
      NOW(),
      NOW()
    ) RETURNING "id" INTO role_id;
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new stores
DROP TRIGGER IF EXISTS store_roles_trigger ON "Store";
CREATE TRIGGER store_roles_trigger
  AFTER INSERT ON "Store"
  FOR EACH ROW
  EXECUTE FUNCTION initialize_store_roles();
