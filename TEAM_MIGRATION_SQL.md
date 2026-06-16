-- Multi-Tenant Team Management - Security Definer Function & Schema Updates
-- IMPORTANT: Run this SQL in the Supabase SQL Editor

-- 1. Alter store_invitations to support phone numbers
ALTER TABLE public.store_invitations ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.store_invitations ALTER COLUMN email DROP NOT NULL;

-- Ensure that at least one of email or phone_number is provided
ALTER TABLE public.store_invitations DROP CONSTRAINT IF EXISTS store_invitations_contact_check;
ALTER TABLE public.store_invitations ADD CONSTRAINT store_invitations_contact_check CHECK (
  email IS NOT NULL OR phone_number IS NOT NULL
);

-- 2. Create or replace the secure view for team members
-- This function allows the app to fetch the emails, phone numbers, and names of team members securely
-- Without exposing the entire auth.users table to the public

CREATE OR REPLACE FUNCTION get_store_team(p_store_id UUID)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  role public.app_role,
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN,
  user_email TEXT,
  user_phone TEXT,
  user_name TEXT
) 
LANGUAGE SQL SECURITY DEFINER AS $$
  SELECT 
    ur.id,
    ur.user_id,
    ur.role,
    ur.accepted_at,
    ur.is_active,
    u.email::TEXT AS user_email,
    u.phone::TEXT AS user_phone,
    (u.raw_user_meta_data->>'full_name')::TEXT AS user_name
  FROM public.user_roles ur
  JOIN auth.users u ON ur.user_id = u.id
  WHERE ur.store_id = p_store_id
    AND ur.is_active = true;
$$;

-- 3. Fix broken RLS policy on store_invitations
-- The original policy "Anyone can view their own invitations by email" tried to query auth.users directly, 
-- which caused a 403 Forbidden / permission denied error.
DROP POLICY IF EXISTS "Anyone can view their own invitations by email" ON public.store_invitations;

CREATE POLICY "Anyone can view their own invitations"
ON public.store_invitations FOR SELECT
TO authenticated
USING (
  email = (auth.jwt() ->> 'email') OR 
  phone_number = (auth.jwt() ->> 'phone')
);
