-- ============================================
-- AJOUT DU CHAMP ROLE AUX PROFILS UTILISATEURS
-- ============================================
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Dépend de : supabase-profiles.sql (table profiles existante)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'PATIENT'
  CHECK (role IN ('PATIENT', 'ASSISTANT', 'DOCTOR', 'SUPER_ADMIN'));
