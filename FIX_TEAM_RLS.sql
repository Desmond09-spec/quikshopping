-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO FIX TEAM PERMISSIONS

-- 1. Ensure the helper function exists and works securely
CREATE OR REPLACE FUNCTION public.is_store_member(_user_id UUID, _store_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND store_id = _store_id AND is_active = true
  )
$$;

-- 2. User Roles RLS Fix
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view all roles in their stores" ON public.user_roles;
CREATE POLICY "Team members can view all roles in their stores"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR public.is_store_member(auth.uid(), store_id)
);

-- 3. Stores RLS Fix
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view stores" ON public.stores;
CREATE POLICY "Team members can view stores"
ON public.stores FOR SELECT
TO authenticated
USING (
  owner_user_id = auth.uid() OR public.is_store_member(auth.uid(), id)
);

-- 4. Products RLS Fix
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view products" ON public.products;
CREATE POLICY "Team members can view products"
ON public.products FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

-- 5. Categories RLS Fix
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view categories" ON public.categories;
CREATE POLICY "Team members can view categories"
ON public.categories FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

-- 6. Transactions RLS Fix
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view transactions" ON public.transactions;
CREATE POLICY "Team members can view transactions"
ON public.transactions FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));

-- 7. Activities RLS Fix
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team members can view activities" ON public.activities;
CREATE POLICY "Team members can view activities"
ON public.activities FOR SELECT
TO authenticated
USING (public.is_store_member(auth.uid(), store_id));


-- Note: Management (Insert/Update/Delete) RLS policies for Team Members
-- should also be added if Cashiers/Managers need to modify data.
-- If they currently get "permission denied" when scanning or checking out,
-- it means they lack INSERT/UPDATE policies.

DROP POLICY IF EXISTS "Team members can insert transactions" ON public.transactions;
CREATE POLICY "Team members can insert transactions"
ON public.transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_store_member(auth.uid(), store_id));

DROP POLICY IF EXISTS "Team members can insert activities" ON public.activities;
CREATE POLICY "Team members can insert activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (public.is_store_member(auth.uid(), store_id));
