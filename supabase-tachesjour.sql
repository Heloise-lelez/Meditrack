-- ============================================
-- TABLE tachesjour — Tâches médicales journalières
-- ============================================
-- À coller dans Supabase Studio -> SQL Editor -> Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- Enums ----

CREATE TYPE type_tache_medicale AS ENUM (
  'prise_medicaments',
  'chimio',
  'irm',
  'scanner',
  'prise_de_sang',
  'consultation',
  'radiotherapie',
  'soins_infirmiers'
);

CREATE TYPE statut_tache AS ENUM (
  'a_faire',
  'fait',
  'ratee'
);

-- ---- Table ----

CREATE TABLE IF NOT EXISTS tachesjour (
  id_tache      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_tache     type_tache_medicale NOT NULL,
  commentaire   TEXT,
  statut        statut_tache NOT NULL DEFAULT 'a_faire',
  heure         TIME,
  date_tache    DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- RLS ----

ALTER TABLE tachesjour ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tachesjour_select_own"
ON tachesjour FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "tachesjour_insert_own"
ON tachesjour FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tachesjour_update_own"
ON tachesjour FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tachesjour_delete_own"
ON tachesjour FOR DELETE TO authenticated
USING (auth.uid() = user_id);
