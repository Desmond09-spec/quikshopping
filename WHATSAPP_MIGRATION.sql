-- ================================================================
-- WHATSAPP OTP MIGRATION FOR SUPABASE
-- ================================================================
-- Run this SQL in your Supabase SQL Editor to enable WhatsApp OTP functionality

-- 1. Add whatsapp_number column to admin_settings table
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 2. Update the otp_codes table to support WhatsApp numbers
ALTER TABLE public.otp_codes 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 3. Update the constraint to allow email OR whatsapp_number to be null (but not both)
-- First, remove the existing constraint if it exists
ALTER TABLE public.otp_codes 
DROP CONSTRAINT IF EXISTS otp_codes_contact_check;

-- Add new constraint to ensure either email OR whatsapp_number is provided
ALTER TABLE public.otp_codes 
ADD CONSTRAINT otp_codes_contact_check 
CHECK (
  (email IS NOT NULL AND email != '' AND whatsapp_number IS NULL) OR 
  (whatsapp_number IS NOT NULL AND whatsapp_number != '' AND email IS NULL) OR
  (email IS NULL AND whatsapp_number IS NOT NULL) OR
  (email IS NOT NULL AND whatsapp_number IS NULL)
);

-- 4. Update the index to include whatsapp_number for better performance
DROP INDEX IF EXISTS idx_otp_codes_user_email;

-- Create new composite indexes
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_email 
ON public.otp_codes(user_id, email, code, expires_at) 
WHERE used = false AND email IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_otp_codes_user_whatsapp 
ON public.otp_codes(user_id, whatsapp_number, code, expires_at) 
WHERE used = false AND whatsapp_number IS NOT NULL;

-- 5. Add index on admin_settings for whatsapp_number lookups
CREATE INDEX IF NOT EXISTS idx_admin_settings_whatsapp 
ON public.admin_settings(whatsapp_number) 
WHERE whatsapp_number IS NOT NULL;

-- 6. Grant necessary permissions (should already exist, but ensuring)
GRANT ALL ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;
GRANT ALL ON public.otp_codes TO authenticated;
GRANT ALL ON public.otp_codes TO service_role;

-- ================================================================
-- VERIFICATION QUERIES (Optional - run these to verify the changes)
-- ================================================================

-- Check if whatsapp_number column was added to admin_settings
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'admin_settings' AND column_name = 'whatsapp_number';

-- Check if whatsapp_number column was added to otp_codes
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'otp_codes' AND column_name = 'whatsapp_number';

-- Check constraints
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'otp_codes_contact_check';

-- Check indexes
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename IN ('admin_settings', 'otp_codes') 
-- AND indexname LIKE '%whatsapp%';

-- ================================================================
-- COMPLETION MESSAGE
-- ================================================================
-- Migration completed successfully!
-- Your database now supports WhatsApp OTP functionality.
-- 
-- Next steps:
-- 1. Integrate a real WhatsApp API service (Twilio, etc.)
-- 2. Update the WhatsApp API credentials in your environment
-- 3. Test the PIN reset flow with WhatsApp numbers
-- ================================================================