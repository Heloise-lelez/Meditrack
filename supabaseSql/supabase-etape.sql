-- ============================================
-- TABLE etape — Étapes du parcours chirurgical
-- ============================================
-- À coller dans Supabase Studio -> SQL Editor -> Run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---- Table ----

CREATE TABLE IF NOT EXISTS etape (
  id_etape    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre       TEXT        NOT NULL,
  detail      TEXT,

  -- Date unique (date_fin NULL) ou plage de dates (date_fin NOT NULL)
  date_debut  DATE        NOT NULL,
  date_fin    DATE,

  -- Checklist : tableau d'objets {"label": string, "fait": boolean}
  -- Exemple : [{"label":"Signer le consentement","fait":false},{"label":"Prise de sang","fait":true}]
  checklist   JSONB       NOT NULL DEFAULT '[]',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT date_range_valid CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

-- ---- RLS ----

ALTER TABLE etape ENABLE ROW LEVEL SECURITY;

CREATE POLICY "etape_select_own"
ON etape FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "etape_insert_own"
ON etape FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "etape_update_own"
ON etape FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "etape_delete_own"
ON etape FOR DELETE TO authenticated
USING (auth.uid() = user_id);
