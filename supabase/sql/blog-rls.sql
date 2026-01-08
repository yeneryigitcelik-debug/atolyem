-- ============================================================================
-- Blog System RLS Policies
-- ============================================================================
-- 
-- IMPORTANT: Run this SQL in the Supabase SQL Editor after applying Prisma migrations.
-- These policies enforce data access rules at the database level for blog system.
--
-- ============================================================================

-- Enable RLS on blog tables
ALTER TABLE blog_post ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comment ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- BLOG_POST POLICIES
-- ============================================================================

-- Anyone can read PUBLISHED blog posts
CREATE POLICY "Public can read published blog_posts"
ON blog_post FOR SELECT
USING (status = 'PUBLISHED');

-- Authors can read their own posts (any status including drafts)
CREATE POLICY "Authors can read own blog_posts"
ON blog_post FOR SELECT
USING (author_user_id = auth.uid());

-- Authors can insert their own blog posts
CREATE POLICY "Authors can insert own blog_posts"
ON blog_post FOR INSERT
WITH CHECK (author_user_id = auth.uid());

-- Authors can update their own blog posts
CREATE POLICY "Authors can update own blog_posts"
ON blog_post FOR UPDATE
USING (author_user_id = auth.uid())
WITH CHECK (author_user_id = auth.uid());

-- Authors can delete their own blog posts
CREATE POLICY "Authors can delete own blog_posts"
ON blog_post FOR DELETE
USING (author_user_id = auth.uid());

-- ============================================================================
-- BLOG_COMMENT POLICIES
-- ============================================================================

-- Anyone can read comments on published posts
CREATE POLICY "Public can read blog_comments on published posts"
ON blog_comment FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM blog_post 
    WHERE blog_post.id = blog_comment.post_id 
    AND blog_post.status = 'PUBLISHED'
  )
);

-- Authors can also see comments on their own posts (including draft posts)
CREATE POLICY "Post authors can read comments on their posts"
ON blog_comment FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM blog_post 
    WHERE blog_post.id = blog_comment.post_id 
    AND blog_post.author_user_id = auth.uid()
  )
);

-- Comment authors can read their own comments
CREATE POLICY "Comment authors can read own comments"
ON blog_comment FOR SELECT
USING (author_user_id = auth.uid());

-- Logged-in users can insert comments on PUBLISHED posts only
CREATE POLICY "Logged-in users can insert comments on published posts"
ON blog_comment FOR INSERT
WITH CHECK (
  author_user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM blog_post 
    WHERE blog_post.id = blog_comment.post_id 
    AND blog_post.status = 'PUBLISHED'
  )
);

-- Comment authors can update their own comments
CREATE POLICY "Comment authors can update own comments"
ON blog_comment FOR UPDATE
USING (author_user_id = auth.uid())
WITH CHECK (author_user_id = auth.uid());

-- Comment authors can delete their own comments
CREATE POLICY "Comment authors can delete own comments"
ON blog_comment FOR DELETE
USING (author_user_id = auth.uid());

-- Post authors can delete any comment on their posts (moderation)
CREATE POLICY "Post authors can delete comments on their posts"
ON blog_comment FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM blog_post 
    WHERE blog_post.id = blog_comment.post_id 
    AND blog_post.author_user_id = auth.uid()
  )
);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
/*
After applying these policies, verify with the following scenarios:

1. Unauthenticated user:
   - Can see only PUBLISHED blog posts
   - Can see comments on PUBLISHED posts
   - Cannot create/update/delete anything

2. Authenticated user (non-author):
   - Can see only PUBLISHED blog posts
   - Can add comments to PUBLISHED posts
   - Can update/delete their own comments
   - Cannot see draft posts from other authors

3. Blog post author:
   - Can see all their posts (draft and published)
   - Can create new posts
   - Can update their posts
   - Can delete their posts
   - Can delete comments on their posts (moderation)
*/



