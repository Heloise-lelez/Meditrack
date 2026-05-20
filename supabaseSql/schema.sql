-- ============================================================
-- MEDITRACK — SCHÉMA COMPLET DE LA BASE DE DONNÉES
-- ============================================================
-- Fichier consolidé à partir des 18 fichiers SQL individuels.
-- À exécuter une seule fois sur un projet Supabase vide.
--
-- PRÉREQUIS : Créer manuellement le bucket Storage "documents"
--   dans Supabase Studio → Storage → New bucket → nom: documents
--   (privé, pas de politique public).
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. ENUMS
-- ============================================================

DO $$ BEGIN
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
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE statut_tache AS ENUM (
    'a_faire',
    'fait',
    'ratee'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 3. TABLES
-- ============================================================

-- ── etablissement ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etablissement (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nom        TEXT        NOT NULL,
  adresse    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── profiles ───────────────────────────────────────────────
-- Colonnes doctor-only (specialite, num_service, horaire_service) sont nullables
CREATE TABLE IF NOT EXISTS profiles (
  id               UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom              TEXT        NOT NULL,
  prenom           TEXT        NOT NULL,
  tel              TEXT,
  role             TEXT        NOT NULL DEFAULT 'PATIENT'
                               CHECK (role IN ('PATIENT', 'ASSISTANT', 'DOCTOR', 'SUPER_ADMIN', 'AIDE')),
  specialite       TEXT,
  num_service      TEXT,
  horaire_service  TEXT,
  etablissement_id UUID        REFERENCES etablissement(id) ON DELETE SET NULL,
  is_accompanied BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── document ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document (
  id_document      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre            TEXT        NOT NULL,
  type             TEXT        NOT NULL,
  publication_date DATE,
  download_link    TEXT,
  size_kb          INTEGER,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mime_type        TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── rendezvous ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rendezvous (
  id_rendezvous      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_first_name  TEXT        NOT NULL,
  doctor_last_name   TEXT        NOT NULL,
  profession         TEXT        NOT NULL,
  operation          TEXT        NOT NULL,
  address            TEXT        NOT NULL,
  profile_picture    TEXT,
  starts_at          TIMESTAMPTZ NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── tachesjour ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tachesjour (
  id_tache    UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID                 NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_tache   type_tache_medicale  NOT NULL,
  commentaire TEXT,
  statut      statut_tache         NOT NULL DEFAULT 'a_faire',
  heure       TIME,
  date_tache  DATE                 NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ          NOT NULL DEFAULT now()
);

-- ── etape ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS etape (
  id_etape   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titre      TEXT        NOT NULL,
  detail     TEXT,
  date_debut DATE        NOT NULL,
  date_fin   DATE,
  checklist  JSONB       NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT date_range_valid CHECK (date_fin IS NULL OR date_fin >= date_debut)
);

-- ── doctor_patient ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS doctor_patient (
  doctor_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (doctor_id, patient_id)
);

-- ── aide_patient ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aide_patient (
  aide_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (aide_id, patient_id)
);

-- ── patient_etablissement ──────────────────────────────────
CREATE TABLE IF NOT EXISTS patient_etablissement (
  patient_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etablissement_id UUID        NOT NULL REFERENCES etablissement(id) ON DELETE CASCADE,
  enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (patient_id, etablissement_id)
);

-- ── chirurgie ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chirurgie (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  titre             TEXT        NOT NULL,
  date_chirurgie    TIMESTAMPTZ NOT NULL,
  doctor_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  salle_anesthesie  BOOLEAN     NOT NULL DEFAULT false,
  salle_operation   BOOLEAN     NOT NULL DEFAULT false,
  salle_reveil      BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── audit_logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          BIGSERIAL   PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type  TEXT,
  action      TEXT,
  outcome     TEXT,
  request_id  TEXT,
  actor_id    TEXT,
  actor_email TEXT,
  actor_role  TEXT,
  method      TEXT,
  path        TEXT,
  route       TEXT,
  status      INTEGER,
  duration_ms INTEGER,
  ip          TEXT,
  user_agent  TEXT,
  request     JSONB       NOT NULL DEFAULT '{}'::JSONB,
  response    JSONB       NOT NULL DEFAULT '{}'::JSONB,
  details     JSONB       NOT NULL DEFAULT '{}'::JSONB,
  error       JSONB,
  raw_event   JSONB       NOT NULL DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx  ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx    ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_actor_email_idx ON public.audit_logs (actor_email);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx      ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_path_idx        ON public.audit_logs (path);
CREATE INDEX IF NOT EXISTS audit_logs_status_idx      ON public.audit_logs (status);

-- ============================================================
-- 4. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE etablissement         ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE document               ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendezvous             ENABLE ROW LEVEL SECURITY;
ALTER TABLE tachesjour             ENABLE ROW LEVEL SECURITY;
ALTER TABLE etape                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_patient         ENABLE ROW LEVEL SECURITY;
ALTER TABLE aide_patient           ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_etablissement  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chirurgie              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. POLICIES
-- ============================================================

-- ── etablissement ──────────────────────────────────────────
DROP POLICY IF EXISTS "Auth read etablissements" ON etablissement;
CREATE POLICY "Auth read etablissements"
  ON etablissement FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── profiles ───────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── document ───────────────────────────────────────────────
DROP POLICY IF EXISTS "document_select_own" ON document;
CREATE POLICY "document_select_own"
  ON document FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "document_insert_own" ON document;
CREATE POLICY "document_insert_own"
  ON document FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "document_delete_own" ON document;
CREATE POLICY "document_delete_own"
  ON document FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── rendezvous ─────────────────────────────────────────────
DROP POLICY IF EXISTS "rendezvous_select_own" ON rendezvous;
CREATE POLICY "rendezvous_select_own"
  ON rendezvous FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rendezvous_insert_own" ON rendezvous;
CREATE POLICY "rendezvous_insert_own"
  ON rendezvous FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "rendezvous_delete_own" ON rendezvous;
CREATE POLICY "rendezvous_delete_own"
  ON rendezvous FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "rendezvous_aide_select" ON rendezvous;
CREATE POLICY "rendezvous_aide_select"
  ON rendezvous FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM aide_patient
      WHERE aide_patient.aide_id = auth.uid()
        AND aide_patient.patient_id = rendezvous.user_id
    )
  );

-- ── tachesjour ─────────────────────────────────────────────
DROP POLICY IF EXISTS "tachesjour_select_own" ON tachesjour;
CREATE POLICY "tachesjour_select_own"
  ON tachesjour FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tachesjour_insert_own" ON tachesjour;
CREATE POLICY "tachesjour_insert_own"
  ON tachesjour FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tachesjour_update_own" ON tachesjour;
CREATE POLICY "tachesjour_update_own"
  ON tachesjour FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "tachesjour_delete_own" ON tachesjour;
CREATE POLICY "tachesjour_delete_own"
  ON tachesjour FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "tachesjour_aide_select" ON tachesjour;
CREATE POLICY "tachesjour_aide_select"
  ON tachesjour FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM aide_patient
      WHERE aide_patient.aide_id = auth.uid()
        AND aide_patient.patient_id = tachesjour.user_id
    )
  );

-- ── etape ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "etape_select_own" ON etape;
CREATE POLICY "etape_select_own"
  ON etape FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "etape_insert_own" ON etape;
CREATE POLICY "etape_insert_own"
  ON etape FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "etape_update_own" ON etape;
CREATE POLICY "etape_update_own"
  ON etape FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "etape_delete_own" ON etape;
CREATE POLICY "etape_delete_own"
  ON etape FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "etape_aide_select" ON etape;
CREATE POLICY "etape_aide_select"
  ON etape FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM aide_patient
      WHERE aide_patient.aide_id = auth.uid()
        AND aide_patient.patient_id = etape.user_id
    )
  );

-- ── doctor_patient ─────────────────────────────────────────
DROP POLICY IF EXISTS "dp_patient_sees_own" ON doctor_patient;
CREATE POLICY "dp_patient_sees_own"
  ON doctor_patient FOR SELECT
  USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "dp_doctor_sees_own" ON doctor_patient;
CREATE POLICY "dp_doctor_sees_own"
  ON doctor_patient FOR SELECT
  USING (auth.uid() = doctor_id);

-- ── aide_patient ───────────────────────────────────────────
DROP POLICY IF EXISTS "ap_patient_sees_own" ON aide_patient;
CREATE POLICY "ap_patient_sees_own"
  ON aide_patient FOR SELECT
  USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "ap_aide_sees_own" ON aide_patient;
CREATE POLICY "ap_aide_sees_own"
  ON aide_patient FOR SELECT
  USING (auth.uid() = aide_id);

DROP POLICY IF EXISTS "ap_assistant_manage" ON aide_patient;
CREATE POLICY "ap_assistant_manage"
  ON aide_patient FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ASSISTANT')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ASSISTANT')
  );

DROP POLICY IF EXISTS "ap_doctor_sees_patient_aides" ON aide_patient;
CREATE POLICY "ap_doctor_sees_patient_aides"
  ON aide_patient FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM doctor_patient
      WHERE doctor_patient.doctor_id = auth.uid()
        AND doctor_patient.patient_id = aide_patient.patient_id
    )
  );

-- ── patient_etablissement ──────────────────────────────────
DROP POLICY IF EXISTS "Patients see own enrollments" ON patient_etablissement;
CREATE POLICY "Patients see own enrollments"
  ON patient_etablissement FOR SELECT
  USING (patient_id = auth.uid());

-- ── chirurgie ──────────────────────────────────────────────
DROP POLICY IF EXISTS "chirurgie_doctor_all" ON chirurgie;
CREATE POLICY "chirurgie_doctor_all"
  ON chirurgie FOR ALL TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

DROP POLICY IF EXISTS "chirurgie_assistant_select" ON chirurgie;
CREATE POLICY "chirurgie_assistant_select"
  ON chirurgie FOR SELECT TO authenticated
  USING (assistant_id = auth.uid());

DROP POLICY IF EXISTS "chirurgie_assistant_update" ON chirurgie;
CREATE POLICY "chirurgie_assistant_update"
  ON chirurgie FOR UPDATE TO authenticated
  USING (assistant_id = auth.uid())
  WITH CHECK (assistant_id = auth.uid());

DROP POLICY IF EXISTS "chirurgie_aide_select" ON chirurgie;
CREATE POLICY "chirurgie_aide_select"
  ON chirurgie FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM aide_patient
      WHERE aide_patient.aide_id = auth.uid()
        AND aide_patient.patient_id = chirurgie.patient_id
    )
  );

-- ── audit_logs ─────────────────────────────────────────────
DROP POLICY IF EXISTS "super admins can read audit logs" ON public.audit_logs;
CREATE POLICY "super admins can read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'SUPER_ADMIN'
    )
  );

-- ── storage.objects ────────────────────────────────────────
DROP POLICY IF EXISTS "storage_insert_auth" ON storage.objects;
CREATE POLICY "storage_insert_auth"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "storage_select_auth" ON storage.objects;
CREATE POLICY "storage_select_auth"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "storage_delete_auth" ON storage.objects;
CREATE POLICY "storage_delete_auth"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents');

-- ============================================================
-- 6. FONCTION + TRIGGER : création automatique du profil
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, tel, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'tel',
    COALESCE(NULLIF(new.raw_user_meta_data->>'role', ''), 'PATIENT')
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();