# Admin System Setup Instructions

## Database Setup Required

The admin system is fully implemented but needs the `admin_settings` table created in your Supabase database.

### Step 1: Create the admin_settings table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create admin_settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    device_cache_enabled BOOLEAN DEFAULT true,
    require_cashier_for_all_actions BOOLEAN DEFAULT false,
    require_admin_for_product_actions BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT admin_settings_owner_user_id_unique UNIQUE (owner_user_id)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only access their own admin settings" 
ON public.admin_settings 
FOR ALL 
USING (auth.uid() = owner_user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER handle_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant permissions
GRANT ALL ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;

-- Create OTP codes table for PIN reset functionality
CREATE TABLE IF NOT EXISTS public.otp_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'pin_reset',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT otp_codes_type_check CHECK (type IN ('pin_reset', 'email_verification'))
);

-- Enable RLS for OTP codes
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for OTP codes
CREATE POLICY "Users can only access their own OTP codes" 
ON public.otp_codes 
FOR ALL 
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_otp_codes_user_email 
ON public.otp_codes(user_id, email, code, expires_at) 
WHERE used = false;

-- Grant permissions for OTP codes
GRANT ALL ON public.otp_codes TO authenticated;
GRANT ALL ON public.otp_codes TO service_role;
```

### Step 1.5: Add Missing Column (If you already ran the above SQL)

If you already created the table, run this additional SQL to add the missing column:

```sql
-- Add the missing require_admin_for_product_actions column
ALTER TABLE public.admin_settings 
ADD COLUMN IF NOT EXISTS require_admin_for_product_actions BOOLEAN DEFAULT false;
```

### Step 2: Test the Admin System

1. Go to Settings page
2. Click "Setup Admin Access" 
3. Enter admin email and PIN (4+ digits)
4. The system will now be fully functional

## Features Available

✅ **Admin Setup**: First-time configuration with email and PIN
✅ **Admin Sign In**: PIN-based authentication with 30-minute sessions
✅ **PIN Reset**: Email OTP fallback for forgotten PINs
✅ **Cashier Management**: Toggle requirement for cashier names on transactions
✅ **Session Management**: Auto-logout after 30 minutes
✅ **Audit Logging**: All admin activities are logged
✅ **Cashier Name Caching**: Quick-select for frequently used cashier names

## Security Features

- PIN hashing with bcrypt (cost 12)
- Row Level Security (RLS) policies
- Session token expiration
- Failed login attempt logging
- User isolation (each user has their own admin settings)

## Edge Functions

The following edge functions are already deployed:
- `admin-setup`: Creates admin settings
- `admin-verify`: Verifies PIN and creates session
- `admin-reset-pin`: Resets PIN via email OTP
- `send-otp`: Generates and sends OTP codes for PIN reset
- `verify-otp`: Verifies OTP codes before allowing PIN reset
- `send-email`: Email service integration (configure with your preferred provider)

Once you run the SQL above, the entire admin system will be fully operational!