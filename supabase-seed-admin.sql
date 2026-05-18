-- ============================================
-- BOOTSTRAP : Créer le premier SUPER_ADMIN
-- ============================================
-- 1. Remplacer <EMAIL> par l'email de l'utilisateur existant à promouvoir
-- 2. Coller dans Supabase Studio -> SQL Editor -> Run

UPDATE profiles
SET role = 'SUPER_ADMIN'
WHERE id = (
  SELECT id FROM auth.users WHERE email = '<EMAIL>' LIMIT 1
);
