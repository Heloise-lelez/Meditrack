-- ============================================================
-- ROLE AIDE + TABLE AIDE_PATIENT (relation Many-to-Many)
-- ============================================================
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Dépend de : supabase-profiles.sql, supabase-roles.sql

-- ── 1. Ajouter 'AIDE' au CHECK constraint du rôle ──────────

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('PATIENT', 'ASSISTANT', 'DOCTOR', 'SUPER_ADMIN', 'AIDE'));

-- ── 2. Table aide_patient ──────────────────────────────────

CREATE TABLE IF NOT EXISTS aide_patient (
  aide_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (aide_id, patient_id)
);

ALTER TABLE aide_patient ENABLE ROW LEVEL SECURITY;

-- ── 3. Politiques RLS ──────────────────────────────────────

-- Les patients peuvent voir leurs aides assignées
DROP POLICY IF EXISTS "ap_patient_sees_own" ON aide_patient;
CREATE POLICY "ap_patient_sees_own"
  ON aide_patient FOR SELECT
  USING (auth.uid() = patient_id);

-- Les aides peuvent voir leurs propres patients
DROP POLICY IF EXISTS "ap_aide_sees_own" ON aide_patient;
CREATE POLICY "ap_aide_sees_own"
  ON aide_patient FOR SELECT
  USING (auth.uid() = aide_id);

-- Les assistants peuvent gérer (INSERT/DELETE) les assignations aide ↔ patient
DROP POLICY IF EXISTS "ap_assistant_manage" ON aide_patient;
CREATE POLICY "ap_assistant_manage"
  ON aide_patient FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ASSISTANT'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ASSISTANT'
    )
  );

-- Les docteurs peuvent voir les aides de leurs patients
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

-- ── 4. Seed : aides + assignations ────────────────────────
-- Dépend de : supabase-seed-full.sql (patients déjà créés)
-- Mot de passe commun : Test1234!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  aide1_id UUID := gen_random_uuid();
  aide2_id UUID := gen_random_uuid();
  aide3_id UUID := gen_random_uuid();
  aide4_id UUID := gen_random_uuid();

  pat1_id  UUID;
  pat2_id  UUID;
  pat3_id  UUID;
  pat4_id  UUID;
  pat5_id  UUID;
  pat6_id  UUID;
  pat7_id  UUID;
  pat8_id  UUID;
  pat9_id  UUID;
  pat10_id UUID;
BEGIN

  -- Récupération des IDs patients créés dans supabase-seed-full.sql
  SELECT id INTO pat1_id  FROM auth.users WHERE email = 'alice.thomas@test.com'   LIMIT 1;
  SELECT id INTO pat2_id  FROM auth.users WHERE email = 'marc.robert@test.com'    LIMIT 1;
  SELECT id INTO pat3_id  FROM auth.users WHERE email = 'lucie.petit@test.com'    LIMIT 1;
  SELECT id INTO pat4_id  FROM auth.users WHERE email = 'antoine.dumont@test.com' LIMIT 1;
  SELECT id INTO pat5_id  FROM auth.users WHERE email = 'emma.richard@test.com'   LIMIT 1;
  SELECT id INTO pat6_id  FROM auth.users WHERE email = 'paul.simon@test.com'     LIMIT 1;
  SELECT id INTO pat7_id  FROM auth.users WHERE email = 'julie.laurent@test.com'  LIMIT 1;
  SELECT id INTO pat8_id  FROM auth.users WHERE email = 'theo.michel@test.com'    LIMIT 1;
  SELECT id INTO pat9_id  FROM auth.users WHERE email = 'sarah.mercier@test.com'  LIMIT 1;
  SELECT id INTO pat10_id FROM auth.users WHERE email = 'hugo.garcia@test.com'    LIMIT 1;

  -- Comptes auth.users
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    (aide1_id, '00000000-0000-0000-0000-000000000000',
     'camille.roy@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Roy","prenom":"Camille","tel":"0644000001"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (aide2_id, '00000000-0000-0000-0000-000000000000',
     'thomas.vidal@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Vidal","prenom":"Thomas","tel":"0644000002"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (aide3_id, '00000000-0000-0000-0000-000000000000',
     'lea.morin@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Morin","prenom":"Léa","tel":"0644000003"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (aide4_id, '00000000-0000-0000-0000-000000000000',
     'kevin.perrin@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Perrin","prenom":"Kévin","tel":"0644000004"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '');

  -- Profils avec rôle AIDE
  INSERT INTO profiles (id, nom, prenom, tel, role) VALUES
    (aide1_id, 'Roy',    'Camille', '0644000001', 'AIDE'),
    (aide2_id, 'Vidal',  'Thomas',  '0644000002', 'AIDE'),
    (aide3_id, 'Morin',  'Léa',     '0644000003', 'AIDE'),
    (aide4_id, 'Perrin', 'Kévin',   '0644000004', 'AIDE')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- Assignations aide ↔ patient
  -- Camille Roy   → Alice Thomas, Marc Robert, Lucie Petit
  -- Thomas Vidal  → Antoine Dumont, Emma Richard, Paul Simon
  -- Léa Morin     → Julie Laurent, Théo Michel
  -- Kévin Perrin  → Sarah Mercier, Hugo Garcia
  -- Alice Thomas et Marc Robert ont aussi Léa Morin (many-to-many)
  INSERT INTO aide_patient (aide_id, patient_id) VALUES
    (aide1_id, pat1_id),
    (aide1_id, pat2_id),
    (aide1_id, pat3_id),
    (aide2_id, pat4_id),
    (aide2_id, pat5_id),
    (aide2_id, pat6_id),
    (aide3_id, pat7_id),
    (aide3_id, pat8_id),
    (aide3_id, pat1_id),  -- Alice a aussi Léa
    (aide3_id, pat2_id),  -- Marc a aussi Léa
    (aide4_id, pat9_id),
    (aide4_id, pat10_id)
  ON CONFLICT DO NOTHING;

END $$;
