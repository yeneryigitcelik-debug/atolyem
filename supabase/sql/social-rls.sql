-- ============================================================================
-- atolyem.net Social Features Row Level Security (RLS) Policies
-- ============================================================================
-- 
-- Covers: public_profile, user_follow, favorite_listing
--
-- Run this SQL in Supabase SQL Editor after applying Prisma migrations.
-- ============================================================================

-- Enable RLS on social tables
ALTER TABLE public_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follow ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_listing ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_comment ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTION: Check if profile allows public favorites
-- ============================================================================

CREATE OR REPLACE FUNCTION auth.profile_shows_favorites(target_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT show_favorites FROM public_profile WHERE user_id = target_user_id),
    false
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- ============================================================================
-- PUBLIC_PROFILE POLICIES
-- ============================================================================

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Public can read public profiles" ON public_profile;
DROP POLICY IF EXISTS "Users can read own profile" ON public_profile;
DROP POLICY IF EXISTS "Users can insert own profile" ON public_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON public_profile;

-- Public profiles are readable by everyone (if is_public = true)
CREATE POLICY "Public can read public profiles"
ON public_profile FOR SELECT
USING (is_public = true);

-- Users can always read their own profile (even if not public)
CREATE POLICY "Users can read own profile"
ON public_profile FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public_profile FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public_profile FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- USER_FOLLOW POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read user follows" ON user_follow;
DROP POLICY IF EXISTS "Users can follow others" ON user_follow;
DROP POLICY IF EXISTS "Users can unfollow" ON user_follow;

-- Anyone can read follow relationships (for follower counts/lists)
CREATE POLICY "Public can read user follows"
ON user_follow FOR SELECT
USING (true);

-- Users can follow others (must be the follower, cannot follow self)
CREATE POLICY "Users can follow others"
ON user_follow FOR INSERT
WITH CHECK (
  follower_id = auth.uid() 
  AND follower_id != following_id
);

-- Users can only unfollow their own follows
CREATE POLICY "Users can unfollow"
ON user_follow FOR DELETE
USING (follower_id = auth.uid());

-- ============================================================================
-- FAVORITE_LISTING POLICIES  
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own favorites" ON favorite_listing;
DROP POLICY IF EXISTS "Public can read favorites if profile allows" ON favorite_listing;
DROP POLICY IF EXISTS "Users can add favorites" ON favorite_listing;
DROP POLICY IF EXISTS "Users can remove favorites" ON favorite_listing;

-- Users can always read their own favorites
CREATE POLICY "Users can read own favorites"
ON favorite_listing FOR SELECT
USING (user_id = auth.uid());

-- IMPORTANT: For public favorites display, we use server-side API endpoint
-- that checks show_favorites flag. This is safer than RLS with complex joins.
-- The policy below is OPTIONAL - only enable if you want direct DB access for public favorites
-- CREATE POLICY "Public can read favorites if profile allows"
-- ON favorite_listing FOR SELECT
-- USING (auth.profile_shows_favorites(user_id));

-- Users can add favorites (must be owner)
CREATE POLICY "Users can add favorites"
ON favorite_listing FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can remove favorites (must be owner)
CREATE POLICY "Users can remove favorites"
ON favorite_listing FOR DELETE
USING (user_id = auth.uid());

-- ============================================================================
-- PROFILE_COMMENT POLICIES
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can read profile comments" ON profile_comment;
DROP POLICY IF EXISTS "Authenticated users can add comments" ON profile_comment;
DROP POLICY IF EXISTS "Authors can delete own comments" ON profile_comment;
DROP POLICY IF EXISTS "Profile owners can delete comments on their profile" ON profile_comment;

-- Anyone can read profile comments
CREATE POLICY "Public can read profile comments"
ON profile_comment FOR SELECT
USING (true);

-- Authenticated users can add comments (must be the author)
CREATE POLICY "Authenticated users can add comments"
ON profile_comment FOR INSERT
WITH CHECK (author_user_id = auth.uid());

-- Comment authors can delete their own comments
CREATE POLICY "Authors can delete own comments"
ON profile_comment FOR DELETE
USING (author_user_id = auth.uid());

-- Profile owners can also delete comments on their profile (moderation)
CREATE POLICY "Profile owners can delete comments on their profile"
ON profile_comment FOR DELETE
USING (profile_user_id = auth.uid());

-- ============================================================================
-- DATABASE CONSTRAINTS
-- ============================================================================

-- Ensure users cannot follow themselves (DB-level constraint)
-- Note: This may fail if constraint already exists, which is fine
DO $$
BEGIN
  ALTER TABLE user_follow 
    ADD CONSTRAINT user_follow_no_self_follow 
    CHECK (follower_id != following_id);
EXCEPTION
  WHEN duplicate_object THEN 
    NULL; -- Constraint already exists, skip
END $$;

-- Case-insensitive unique username
-- Note: This creates a unique index on lowercased username
DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS public_profile_username_lower_idx 
    ON public_profile (LOWER(username));
EXCEPTION
  WHEN duplicate_table THEN 
    NULL; -- Index already exists, skip
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run manually to test)
-- ============================================================================
/*
-- Test as unauthenticated user:
-- Should see public profiles
SELECT username, display_name FROM public_profile WHERE is_public = true LIMIT 5;

-- Test follow counts
SELECT following_id, COUNT(*) as follower_count 
FROM user_follow 
GROUP BY following_id 
LIMIT 5;

-- As authenticated user (set JWT claim):
-- SET request.jwt.claim.sub = 'your-user-uuid';

-- Should see own favorites
SELECT * FROM favorite_listing LIMIT 5;
*/

