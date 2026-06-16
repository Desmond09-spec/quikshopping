-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- !!!                   DANGER ZONE                         !!!
-- !!!          FULL DATA WIPE — IRREVERSIBLE                !!!
-- !!!                                                       !!!
-- !!!  This script permanently deletes ALL user accounts,   !!!
-- !!!  products, transactions, activities, invites, and     !!!
-- !!!  stored images from the Quik Shopping database.       !!!
-- !!!                                                       !!!
-- !!!  WHAT IT KEEPS: Tables, RLS policies, functions,      !!!
-- !!!  storage buckets, and all database structure.         !!!
-- !!!                                                       !!!
-- !!!  WHAT IT DESTROYS: Every row of data. Every user.     !!!
-- !!!  Every product. Every sale. Every activity log.       !!!
-- !!!                                                       !!!
-- !!!  DO NOT RUN THIS ON A LIVE / PRODUCTION DATABASE      !!!
-- !!!  unless you are 100% certain and have a backup.       !!!
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
--
-- PURPOSE: Development reset / clean slate for fresh testing.
-- Run in: Supabase Dashboard → SQL Editor
-- Last used: 2026-06-14
-- ============================================================

-- Disable triggers temporarily so cascades don't fight each other
SET session_replication_role = replica;

-- Wipe all user data tables
TRUNCATE TABLE public.activities          RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.transactions        RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.store_invitations   RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.user_roles          RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.stores              RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.products            RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.categories          RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.profiles            RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.admin_settings      RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.otp_codes           RESTART IDENTITY CASCADE;
TRUNCATE TABLE public.pin_reset_attempts  RESTART IDENTITY CASCADE;

-- Wipe product images from storage (keeps the bucket)
DELETE FROM storage.objects WHERE bucket_id = 'products';

-- Re-enable triggers
SET session_replication_role = DEFAULT;

-- Wipe all auth users (this triggers the cascades in auth.users)
-- IMPORTANT: This deletes ALL user accounts. They will need to sign up again.
DELETE FROM auth.users;
