-- Badge System Seed Data
-- Run this after the initial schema migration

INSERT INTO badge (id, type, name, description, icon_name, color, sort_order, is_active, created_at)
VALUES
  (gen_random_uuid(), 'FIRST_PURCHASE', 'İlk Alışveriş', 'İlk alışverişini tamamladı', 'shopping_bag', '#10B981', 1, true, NOW()),
  (gen_random_uuid(), 'ART_LOVER', 'Sanatsever', '5 veya daha fazla eser satın aldı', 'favorite', '#EC4899', 2, true, NOW()),
  (gen_random_uuid(), 'COLLECTOR', 'Koleksiyoner', '20 veya daha fazla eser satın aldı', 'collections', '#8B5CF6', 3, true, NOW()),
  (gen_random_uuid(), 'CONNOISSEUR', 'Meraklı', '50 veya daha fazla eser satın aldı', 'diamond', '#F59E0B', 4, true, NOW()),
  (gen_random_uuid(), 'PATRON', 'Patron', '100 veya daha fazla eser satın aldı', 'workspace_premium', '#EF4444', 5, true, NOW()),
  (gen_random_uuid(), 'EARLY_SUPPORTER', 'Erken Destekçi', 'İlk 1000 üyeden biri', 'rocket_launch', '#06B6D4', 6, true, NOW()),
  (gen_random_uuid(), 'REVIEWER', 'Yorumcu', '10 veya daha fazla yorum yaptı', 'rate_review', '#84CC16', 7, true, NOW()),
  (gen_random_uuid(), 'SUPER_REVIEWER', 'Süper Yorumcu', '50 veya daha fazla yorum yaptı', 'star', '#FBBF24', 8, true, NOW()),
  (gen_random_uuid(), 'TRENDSETTER', 'Trend Belirleyici', 'Toplulukta etkili kullanıcı', 'trending_up', '#A855F7', 9, true, NOW()),
  (gen_random_uuid(), 'COMMUNITY_MEMBER', 'Topluluk Üyesi', 'Aktif topluluk katılımcısı', 'groups', '#3B82F6', 10, true, NOW()),
  (gen_random_uuid(), 'VERIFIED', 'Doğrulanmış', 'Kimliği doğrulanmış kullanıcı', 'verified', '#22C55E', 11, true, NOW()),
  (gen_random_uuid(), 'ANNIVERSARY_1', '1 Yıllık Üye', '1 yıldır platformda', 'celebration', '#F472B6', 12, true, NOW()),
  (gen_random_uuid(), 'ANNIVERSARY_3', '3 Yıllık Üye', '3 yıldır platformda', 'emoji_events', '#FB923C', 13, true, NOW()),
  (gen_random_uuid(), 'ANNIVERSARY_5', '5 Yıllık Üye', '5 yıldır platformda', 'military_tech', '#FACC15', 14, true, NOW())
ON CONFLICT (type) DO NOTHING;



