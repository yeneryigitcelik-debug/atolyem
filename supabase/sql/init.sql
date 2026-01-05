-- ============================================================================
-- atolyem.net Database Initialization
-- ============================================================================
-- 
-- Run this SQL in Supabase SQL Editor BEFORE applying Prisma migrations.
-- This enables required extensions and sets up auth helpers.
--
-- ============================================================================

-- Enable UUID extension (usually already enabled in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Notes on Auth Integration
-- ============================================================================
/*
Supabase Auth automatically manages the auth.users table.
Our app_user table links to auth.users via the id field (UUID).

The auth.uid() function returns the currently authenticated user's ID.
We use this in RLS policies to restrict data access.

The service role key bypasses RLS, so server-side operations that need
full access (like upserting app_user on first login) should use
the admin client.
*/

