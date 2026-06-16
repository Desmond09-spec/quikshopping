# Multi-Tenant Authentication System - Database Migration

**IMPORTANT**: Run this SQL in the Supabase SQL Editor (Cloud tab → Database → SQL Editor)

This migration creates the complete infrastructure for secure role-based multi-tenant authentication.

```sql
-- Step 1: Create app_role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'manager', 'cashier');

-- Step 2: Create stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_name TEXT NOT NULL,
  store_email TEXT,
  whatsapp_number TEXT,
  admin_pin_hash TEXT,
  security_question TEXT,
  security_answer_hash TEXT,
  disable_cashier_dialog BOOLEAN DEFAULT false,
  require_admin_for_product_actions BOOLEAN DEFAULT false,
  cashier_sign_in_mode TEXT DEFAULT 'dropdown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Step 3: Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, store_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create store_invitations table
CREATE TABLE public.store_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role public.app_role NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  invitation_token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.store_invitations ENABLE ROW LEVEL SECURITY;

-- Step 5: Add store_id to existing tables
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS cashier_user_id UUID REFERENCES auth.users(id);

ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

-- Step 6: Create security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _store_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND store_id = _store_id
      AND role = _role
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_store_member(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND store_id = _store_id
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID, _store_id UUID)
RETURNS public.app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND store_id = _store_id
    AND is_active = true
  LIMIT 1
$$;

-- Step 7: RLS Policies for stores
CREATE POLICY "Store owners can manage their stores"
ON public.stores FOR ALL
TO authenticated
USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Store members can view stores"
ON public.stores FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), id));

-- Step 8: RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Store owners can view all roles in their stores"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = user_roles.store_id
    AND owner_user_id = auth.uid()
  )
);

CREATE POLICY "Store owners can manage roles in their stores"
ON public.user_roles FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = user_roles.store_id
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = user_roles.store_id
    AND owner_user_id = auth.uid()
  )
);

-- Step 9: RLS Policies for store_invitations
CREATE POLICY "Store owners can manage invitations"
ON public.store_invitations FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = store_invitations.store_id
    AND owner_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE id = store_invitations.store_id
    AND owner_user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view their own invitations by email"
ON public.store_invitations FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Step 10: Update RLS for existing tables
CREATE POLICY "Store members can view products"
ON public.products FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Owners and managers can manage products"
ON public.products FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), store_id, 'owner') OR
  public.has_role(auth.uid(), store_id, 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), store_id, 'owner') OR
  public.has_role(auth.uid(), store_id, 'manager')
);

CREATE POLICY "Store members can view transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Cashiers can create transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Owners and managers can manage transactions"
ON public.transactions FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), store_id, 'owner') OR
  public.has_role(auth.uid(), store_id, 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), store_id, 'owner') OR
  public.has_role(auth.uid(), store_id, 'manager')
);

CREATE POLICY "Store members can view activities"
ON public.activities FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Store members can create activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Store members can view categories"
ON public.categories FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Owners and managers can manage categories"
ON public.categories FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), store_id, 'owner') OR
  public.has_role(auth.uid(), store_id, 'manager')
)
WITH CHECK (
  public.has_role(auth.uid(), store_id, 'owner') OR
  public.has_role(auth.uid(), store_id, 'manager')
);

-- Step 11: Create indexes
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_store_id ON public.user_roles(store_id);
CREATE INDEX idx_store_invitations_token ON public.store_invitations(invitation_token);
CREATE INDEX idx_store_invitations_email ON public.store_invitations(email);
CREATE INDEX idx_products_store_id ON public.products(store_id);
CREATE INDEX idx_transactions_store_id ON public.transactions(store_id);
CREATE INDEX idx_activities_store_id ON public.activities(store_id);
CREATE INDEX idx_categories_store_id ON public.categories(store_id);
```

## After Running the Migration

1. The database schema will be updated with new tables
2. You'll need to configure Google OAuth in Supabase Auth settings
3. Existing users will need to be migrated (create stores and user_roles for them)
4. Make sure to add the RESEND_API_KEY secret for email invitations
