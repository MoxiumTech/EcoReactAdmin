-- Migration to document the addition of 'shipped' status
-- Note: This is a documentation update only as the status field is a string
COMMENT ON COLUMN "Order"."status" IS 'cart, processing, shipped, completed, cancelled';

-- Add stored function to validate order status
CREATE OR REPLACE FUNCTION validate_order_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('cart', 'processing', 'shipped', 'completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid order status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to enforce valid order status values
DROP TRIGGER IF EXISTS check_order_status ON "Order";
CREATE TRIGGER check_order_status
  BEFORE INSERT OR UPDATE ON "Order"
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_status();
