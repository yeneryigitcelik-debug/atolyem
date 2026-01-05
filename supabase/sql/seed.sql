-- ============================================================================
-- atolyem.net Seed Data
-- ============================================================================
-- 
-- Run this SQL to seed initial categories.
-- Execute after Prisma migrations have been applied.
--
-- ============================================================================

-- Seed categories for a handmade art/craft marketplace
INSERT INTO category (id, slug, name, created_at, updated_at) VALUES
  (gen_random_uuid(), 'seramik', 'Seramik & Çömlek', NOW(), NOW()),
  (gen_random_uuid(), 'takı', 'Takı & Aksesuar', NOW(), NOW()),
  (gen_random_uuid(), 'tekstil', 'Tekstil & El Dokuma', NOW(), NOW()),
  (gen_random_uuid(), 'ahsap', 'Ahşap İşleri', NOW(), NOW()),
  (gen_random_uuid(), 'resim', 'Resim & İllüstrasyon', NOW(), NOW()),
  (gen_random_uuid(), 'heykel', 'Heykel', NOW(), NOW()),
  (gen_random_uuid(), 'cam', 'Cam İşleri', NOW(), NOW()),
  (gen_random_uuid(), 'deri', 'Deri İşleri', NOW(), NOW()),
  (gen_random_uuid(), 'mumlar', 'Mumlar & Kokular', NOW(), NOW()),
  (gen_random_uuid(), 'kagit', 'Kağıt Sanatı', NOW(), NOW()),
  (gen_random_uuid(), 'orgu', 'Örgü & Tığ İşi', NOW(), NOW()),
  (gen_random_uuid(), 'nakis', 'Nakış & Dantel', NOW(), NOW()),
  (gen_random_uuid(), 'mozaik', 'Mozaik', NOW(), NOW()),
  (gen_random_uuid(), 'ebru', 'Ebru Sanatı', NOW(), NOW()),
  (gen_random_uuid(), 'hat', 'Hat Sanatı', NOW(), NOW()),
  (gen_random_uuid(), 'minyatur', 'Minyatür', NOW(), NOW()),
  (gen_random_uuid(), 'cini', 'Çini', NOW(), NOW()),
  (gen_random_uuid(), 'bakir', 'Bakırcılık', NOW(), NOW()),
  (gen_random_uuid(), 'diger', 'Diğer El Sanatları', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Verify seed
SELECT slug, name FROM category ORDER BY name;

