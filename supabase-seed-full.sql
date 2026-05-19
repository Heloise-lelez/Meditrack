-- ============================================================
-- SEED : 4 assistants + 4 médecins + 10 patients
-- ============================================================
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Mot de passe commun : Test1234!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- Assistants
  assist1_id UUID := gen_random_uuid();
  assist2_id UUID := gen_random_uuid();
  assist3_id UUID := gen_random_uuid();
  assist4_id UUID := gen_random_uuid();

  -- Médecins
  doc1_id UUID := gen_random_uuid();
  doc2_id UUID := gen_random_uuid();
  doc3_id UUID := gen_random_uuid();
  doc4_id UUID := gen_random_uuid();

  -- Patients
  pat1_id  UUID := gen_random_uuid();
  pat2_id  UUID := gen_random_uuid();
  pat3_id  UUID := gen_random_uuid();
  pat4_id  UUID := gen_random_uuid();
  pat5_id  UUID := gen_random_uuid();
  pat6_id  UUID := gen_random_uuid();
  pat7_id  UUID := gen_random_uuid();
  pat8_id  UUID := gen_random_uuid();
  pat9_id  UUID := gen_random_uuid();
  pat10_id UUID := gen_random_uuid();
BEGIN

  -- ── Comptes auth.users ─────────────────────────────────────

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    -- Assistants
    (assist1_id, '00000000-0000-0000-0000-000000000000',
     'emma.dubois@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Dubois","prenom":"Emma","tel":"0611000001"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (assist2_id, '00000000-0000-0000-0000-000000000000',
     'lucas.garnier@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Garnier","prenom":"Lucas","tel":"0611000002"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (assist3_id, '00000000-0000-0000-0000-000000000000',
     'chloe.blanc@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Blanc","prenom":"Chloé","tel":"0611000003"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (assist4_id, '00000000-0000-0000-0000-000000000000',
     'nicolas.faure@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Faure","prenom":"Nicolas","tel":"0611000004"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    -- Médecins
    (doc1_id, '00000000-0000-0000-0000-000000000000',
     'dr.lambert@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Lambert","prenom":"Pierre","tel":"0622000001"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (doc2_id, '00000000-0000-0000-0000-000000000000',
     'dr.dupuis@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Dupuis","prenom":"Claire","tel":"0622000002"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (doc3_id, '00000000-0000-0000-0000-000000000000',
     'dr.aubert@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Aubert","prenom":"Jean","tel":"0622000003"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (doc4_id, '00000000-0000-0000-0000-000000000000',
     'dr.girard@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Girard","prenom":"Hélène","tel":"0622000004"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    -- Patients
    (pat1_id, '00000000-0000-0000-0000-000000000000',
     'alice.thomas@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Thomas","prenom":"Alice","tel":"0633000001"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat2_id, '00000000-0000-0000-0000-000000000000',
     'marc.robert@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Robert","prenom":"Marc","tel":"0633000002"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat3_id, '00000000-0000-0000-0000-000000000000',
     'lucie.petit@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Petit","prenom":"Lucie","tel":"0633000003"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat4_id, '00000000-0000-0000-0000-000000000000',
     'antoine.dumont@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Dumont","prenom":"Antoine","tel":"0633000004"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat5_id, '00000000-0000-0000-0000-000000000000',
     'emma.richard@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Richard","prenom":"Emma","tel":"0633000005"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat6_id, '00000000-0000-0000-0000-000000000000',
     'paul.simon@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Simon","prenom":"Paul","tel":"0633000006"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat7_id, '00000000-0000-0000-0000-000000000000',
     'julie.laurent@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Laurent","prenom":"Julie","tel":"0633000007"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat8_id, '00000000-0000-0000-0000-000000000000',
     'theo.michel@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Michel","prenom":"Théo","tel":"0633000008"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat9_id, '00000000-0000-0000-0000-000000000000',
     'sarah.mercier@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Mercier","prenom":"Sarah","tel":"0633000009"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),
    (pat10_id, '00000000-0000-0000-0000-000000000000',
     'hugo.garcia@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Garcia","prenom":"Hugo","tel":"0633000010"}', '{"provider":"email","providers":["email"]}',
     'authenticated', 'authenticated', now(), now(), '', '', '', '');

  -- ── Profils ────────────────────────────────────────────────

  INSERT INTO profiles (id, nom, prenom, tel, role) VALUES
    -- Assistants
    (assist1_id, 'Dubois',  'Emma',    '0611000001', 'ASSISTANT'),
    (assist2_id, 'Garnier', 'Lucas',   '0611000002', 'ASSISTANT'),
    (assist3_id, 'Blanc',   'Chloé',   '0611000003', 'ASSISTANT'),
    (assist4_id, 'Faure',   'Nicolas', '0611000004', 'ASSISTANT'),
    -- Médecins
    (doc1_id, 'Lambert', 'Pierre',  '0622000001', 'DOCTOR'),
    (doc2_id, 'Dupuis',  'Claire',  '0622000002', 'DOCTOR'),
    (doc3_id, 'Aubert',  'Jean',    '0622000003', 'DOCTOR'),
    (doc4_id, 'Girard',  'Hélène',  '0622000004', 'DOCTOR'),
    -- Patients
    (pat1_id,  'Thomas',  'Alice',   '0633000001', 'PATIENT'),
    (pat2_id,  'Robert',  'Marc',    '0633000002', 'PATIENT'),
    (pat3_id,  'Petit',   'Lucie',   '0633000003', 'PATIENT'),
    (pat4_id,  'Dumont',  'Antoine', '0633000004', 'PATIENT'),
    (pat5_id,  'Richard', 'Emma',    '0633000005', 'PATIENT'),
    (pat6_id,  'Simon',   'Paul',    '0633000006', 'PATIENT'),
    (pat7_id,  'Laurent', 'Julie',   '0633000007', 'PATIENT'),
    (pat8_id,  'Michel',  'Théo',    '0633000008', 'PATIENT'),
    (pat9_id,  'Mercier', 'Sarah',   '0633000009', 'PATIENT'),
    (pat10_id, 'Garcia',  'Hugo',    '0633000010', 'PATIENT')
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;

END $$;
