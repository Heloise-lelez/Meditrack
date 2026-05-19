-- ============================================================
-- SEED : médecins + assistant + assignations patients/médecins
-- ============================================================
-- Dépend de : supabase-seed-users.sql (patients déjà créés)
--             supabase-roles.sql (colonne role dans profiles)
--             supabase-doctor-patient.sql (table doctor_patient)
-- Mot de passe commun : Test1234!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  doc1_id   UUID := gen_random_uuid();
  doc2_id   UUID := gen_random_uuid();
  assist_id UUID := gen_random_uuid();

  patient1_id UUID;
  patient2_id UUID;
  patient3_id UUID;
  patient4_id UUID;
BEGIN

  -- ── Récupération des IDs des patients existants ────────────
  SELECT id INTO patient1_id FROM auth.users WHERE email = 'jean.dupont@test.com'    LIMIT 1;
  SELECT id INTO patient2_id FROM auth.users WHERE email = 'marie.martin@test.com'   LIMIT 1;
  SELECT id INTO patient3_id FROM auth.users WHERE email = 'pierre.bernard@test.com' LIMIT 1;
  SELECT id INTO patient4_id FROM auth.users WHERE email = 'sophie.leroy@test.com'   LIMIT 1;

  -- ── Comptes auth.users ─────────────────────────────────────

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    -- Médecin 1 : François Moreau, chirurgien orthopédique
    (
      doc1_id, '00000000-0000-0000-0000-000000000000',
      'dr.moreau@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Moreau","prenom":"François","tel":"0611223344"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    ),
    -- Médecin 2 : Antoine Lefebvre, cardiologue
    (
      doc2_id, '00000000-0000-0000-0000-000000000000',
      'dr.lefebvre@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Lefebvre","prenom":"Antoine","tel":"0622334455"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    ),
    -- Assistant : Isabelle Roux
    (
      assist_id, '00000000-0000-0000-0000-000000000000',
      'isabelle.roux@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Roux","prenom":"Isabelle"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    );

  -- ── Profils avec rôles ─────────────────────────────────────

  INSERT INTO profiles (id, nom, prenom, tel, role) VALUES
    (doc1_id,   'Moreau',   'François', '0611223344', 'DOCTOR'),
    (doc2_id,   'Lefebvre', 'Antoine',  '0622334455', 'DOCTOR'),
    (assist_id, 'Roux',     'Isabelle', NULL,          'ASSISTANT')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

  -- ── Assignations doctor ↔ patient ─────────────────────────
  -- Dr. Moreau suit Jean Dupont et Pierre Bernard
  -- Dr. Lefebvre suit Marie Martin et Sophie Leroy

  INSERT INTO doctor_patient (doctor_id, patient_id) VALUES
    (doc1_id, patient1_id),   -- Moreau → Dupont
    (doc1_id, patient3_id),   -- Moreau → Bernard
    (doc2_id, patient2_id),   -- Lefebvre → Martin
    (doc2_id, patient4_id)    -- Lefebvre → Leroy
  ON CONFLICT DO NOTHING;

END $$;
