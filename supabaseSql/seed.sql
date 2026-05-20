-- ============================================================
-- MEDITRACK — SEED COMPLET
-- ============================================================
-- À exécuter APRÈS schema.sql sur un projet Supabase vide.
-- Mot de passe commun pour tous les comptes : Test1234!
--
-- Comptes créés :
--   1 SUPER_ADMIN  : admin@test.com
--   4 ASSISTANT    : emma.dubois, lucas.garnier, chloe.blanc, nicolas.faure @test.com
--   4 DOCTOR       : dr.lambert, dr.dupuis, dr.aubert, dr.girard @test.com
--   4 AIDE         : camille.roy, thomas.vidal, lea.morin, kevin.perrin @test.com
--  10 PATIENT      : alice.thomas, marc.robert, lucie.petit, antoine.dumont,
--                    emma.richard, paul.simon, julie.laurent, theo.michel,
--                    sarah.mercier, hugo.garcia @test.com
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  -- Super admin
  admin_id    UUID := gen_random_uuid();

  -- Assistants
  assist1_id  UUID := gen_random_uuid();
  assist2_id  UUID := gen_random_uuid();
  assist3_id  UUID := gen_random_uuid();
  assist4_id  UUID := gen_random_uuid();

  -- Médecins
  doc1_id     UUID := gen_random_uuid();
  doc2_id     UUID := gen_random_uuid();
  doc3_id     UUID := gen_random_uuid();
  doc4_id     UUID := gen_random_uuid();

  -- Aides
  aide1_id    UUID := gen_random_uuid();
  aide2_id    UUID := gen_random_uuid();
  aide3_id    UUID := gen_random_uuid();
  aide4_id    UUID := gen_random_uuid();

  -- Patients
  pat1_id     UUID := gen_random_uuid();
  pat2_id     UUID := gen_random_uuid();
  pat3_id     UUID := gen_random_uuid();
  pat4_id     UUID := gen_random_uuid();
  pat5_id     UUID := gen_random_uuid();
  pat6_id     UUID := gen_random_uuid();
  pat7_id     UUID := gen_random_uuid();
  pat8_id     UUID := gen_random_uuid();
  pat9_id     UUID := gen_random_uuid();
  pat10_id    UUID := gen_random_uuid();

  -- Établissements
  etab1_id    UUID;
  etab2_id    UUID;

BEGIN

  -- ============================================================
  -- 1. COMPTES AUTH.USERS
  -- ============================================================

  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES

    -- Super Admin
    (admin_id,   '00000000-0000-0000-0000-000000000000',
     'admin@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Admin","prenom":"Super","role":"SUPER_ADMIN"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    -- Assistants
    (assist1_id, '00000000-0000-0000-0000-000000000000',
     'emma.dubois@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Dubois","prenom":"Emma","tel":"0611000001","role":"ASSISTANT"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (assist2_id, '00000000-0000-0000-0000-000000000000',
     'lucas.garnier@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Garnier","prenom":"Lucas","tel":"0611000002","role":"ASSISTANT"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (assist3_id, '00000000-0000-0000-0000-000000000000',
     'chloe.blanc@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Blanc","prenom":"Chloé","tel":"0611000003","role":"ASSISTANT"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (assist4_id, '00000000-0000-0000-0000-000000000000',
     'nicolas.faure@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Faure","prenom":"Nicolas","tel":"0611000004","role":"ASSISTANT"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    -- Médecins
    (doc1_id,    '00000000-0000-0000-0000-000000000000',
     'dr.lambert@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Lambert","prenom":"Pierre","tel":"0622000001","role":"DOCTOR"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (doc2_id,    '00000000-0000-0000-0000-000000000000',
     'dr.dupuis@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Dupuis","prenom":"Claire","tel":"0622000002","role":"DOCTOR"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (doc3_id,    '00000000-0000-0000-0000-000000000000',
     'dr.aubert@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Aubert","prenom":"Jean","tel":"0622000003","role":"DOCTOR"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (doc4_id,    '00000000-0000-0000-0000-000000000000',
     'dr.girard@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Girard","prenom":"Hélène","tel":"0622000004","role":"DOCTOR"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    -- Aides
    (aide1_id,   '00000000-0000-0000-0000-000000000000',
     'camille.roy@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Roy","prenom":"Camille","tel":"0644000001","role":"AIDE"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (aide2_id,   '00000000-0000-0000-0000-000000000000',
     'thomas.vidal@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Vidal","prenom":"Thomas","tel":"0644000002","role":"AIDE"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (aide3_id,   '00000000-0000-0000-0000-000000000000',
     'lea.morin@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Morin","prenom":"Léa","tel":"0644000003","role":"AIDE"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (aide4_id,   '00000000-0000-0000-0000-000000000000',
     'kevin.perrin@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Perrin","prenom":"Kévin","tel":"0644000004","role":"AIDE"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    -- Patients
    (pat1_id,    '00000000-0000-0000-0000-000000000000',
     'alice.thomas@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Thomas","prenom":"Alice","tel":"0633000001"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat2_id,    '00000000-0000-0000-0000-000000000000',
     'marc.robert@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Robert","prenom":"Marc","tel":"0633000002"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat3_id,    '00000000-0000-0000-0000-000000000000',
     'lucie.petit@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Petit","prenom":"Lucie","tel":"0633000003"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat4_id,    '00000000-0000-0000-0000-000000000000',
     'antoine.dumont@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Dumont","prenom":"Antoine","tel":"0633000004"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat5_id,    '00000000-0000-0000-0000-000000000000',
     'emma.richard@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Richard","prenom":"Emma","tel":"0633000005"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat6_id,    '00000000-0000-0000-0000-000000000000',
     'paul.simon@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Simon","prenom":"Paul","tel":"0633000006"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat7_id,    '00000000-0000-0000-0000-000000000000',
     'julie.laurent@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Laurent","prenom":"Julie","tel":"0633000007"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat8_id,    '00000000-0000-0000-0000-000000000000',
     'theo.michel@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Michel","prenom":"Théo","tel":"0633000008"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat9_id,    '00000000-0000-0000-0000-000000000000',
     'sarah.mercier@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Mercier","prenom":"Sarah","tel":"0633000009"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', ''),

    (pat10_id,   '00000000-0000-0000-0000-000000000000',
     'hugo.garcia@test.com', crypt('Test1234!', gen_salt('bf')),
     now(), '{"nom":"Garcia","prenom":"Hugo","tel":"0633000010"}'::jsonb,
     '{"provider":"email","providers":["email"]}'::jsonb,
     'authenticated', 'authenticated', now(), now(), '', '', '', '');

  -- ============================================================
  -- 2. PROFILS
  -- Le trigger handle_new_user() crée automatiquement un profil
  -- avec role=PATIENT dès l'INSERT dans auth.users (via les metadata).
  -- On force ici les rôles non-PATIENT avec ON CONFLICT DO UPDATE.
  -- ============================================================

  INSERT INTO profiles (id, nom, prenom, tel, role) VALUES
    (admin_id,   'Admin',   'Super',   NULL,          'SUPER_ADMIN'),
    (assist1_id, 'Dubois',  'Emma',    '0611000001',  'ASSISTANT'),
    (assist2_id, 'Garnier', 'Lucas',   '0611000002',  'ASSISTANT'),
    (assist3_id, 'Blanc',   'Chloé',   '0611000003',  'ASSISTANT'),
    (assist4_id, 'Faure',   'Nicolas', '0611000004',  'ASSISTANT'),
    (doc1_id,    'Lambert', 'Pierre',  '0622000001',  'DOCTOR'),
    (doc2_id,    'Dupuis',  'Claire',  '0622000002',  'DOCTOR'),
    (doc3_id,    'Aubert',  'Jean',    '0622000003',  'DOCTOR'),
    (doc4_id,    'Girard',  'Hélène',  '0622000004',  'DOCTOR'),
    (aide1_id,   'Roy',     'Camille', '0644000001',  'AIDE'),
    (aide2_id,   'Vidal',   'Thomas',  '0644000002',  'AIDE'),
    (aide3_id,   'Morin',   'Léa',     '0644000003',  'AIDE'),
    (aide4_id,   'Perrin',  'Kévin',   '0644000004',  'AIDE'),
    (pat1_id,    'Thomas',  'Alice',   '0633000001',  'PATIENT'),
    (pat2_id,    'Robert',  'Marc',    '0633000002',  'PATIENT'),
    (pat3_id,    'Petit',   'Lucie',   '0633000003',  'PATIENT'),
    (pat4_id,    'Dumont',  'Antoine', '0633000004',  'PATIENT'),
    (pat5_id,    'Richard', 'Emma',    '0633000005',  'PATIENT'),
    (pat6_id,    'Simon',   'Paul',    '0633000006',  'PATIENT'),
    (pat7_id,    'Laurent', 'Julie',   '0633000007',  'PATIENT'),
    (pat8_id,    'Michel',  'Théo',    '0633000008',  'PATIENT'),
    (pat9_id,    'Mercier', 'Sarah',   '0633000009',  'PATIENT'),
    (pat10_id,   'Garcia',  'Hugo',    '0633000010',  'PATIENT')
  ON CONFLICT (id) DO UPDATE
    SET nom = EXCLUDED.nom,
        prenom = EXCLUDED.prenom,
        tel = EXCLUDED.tel,
        role = EXCLUDED.role;

  -- Spécialités des médecins
  UPDATE profiles SET specialite = 'Chirurgie orthopédique' WHERE id = doc1_id;
  UPDATE profiles SET specialite = 'Cardiologie'            WHERE id = doc2_id;
  UPDATE profiles SET specialite = 'Neurologie'             WHERE id = doc3_id;
  UPDATE profiles SET specialite = 'Oncologie'              WHERE id = doc4_id;

  -- ============================================================
  -- 3. ÉTABLISSEMENTS
  -- ============================================================

  INSERT INTO etablissement (nom, adresse)
    VALUES ('Clinique Saint-Louis', '12 rue de la Paix, Paris 75001')
    RETURNING id INTO etab1_id;

  INSERT INTO etablissement (nom, adresse)
    VALUES ('Hôpital du Centre', '45 avenue Victor Hugo, Lyon 69002')
    RETURNING id INTO etab2_id;

  -- Assignation : Clinique Saint-Louis → Lambert, Dupuis, Dubois, Garnier
  --               Hôpital du Centre   → Aubert, Girard, Blanc, Faure
  UPDATE profiles SET etablissement_id = etab1_id
    WHERE id IN (doc1_id, doc2_id, assist1_id, assist2_id);

  UPDATE profiles SET etablissement_id = etab2_id
    WHERE id IN (doc3_id, doc4_id, assist3_id, assist4_id);

  -- ============================================================
  -- 4. ASSIGNATIONS MÉDECIN ↔ PATIENT
  -- Lambert  → Thomas, Robert, Petit
  -- Dupuis   → Dumont, Richard, Simon
  -- Aubert   → Laurent, Michel, Mercier
  -- Girard   → Garcia, Thomas (Thomas a 2 médecins : many-to-many)
  -- ============================================================

  INSERT INTO doctor_patient (doctor_id, patient_id) VALUES
    (doc1_id, pat1_id),
    (doc1_id, pat2_id),
    (doc1_id, pat3_id),
    (doc2_id, pat4_id),
    (doc2_id, pat5_id),
    (doc2_id, pat6_id),
    (doc3_id, pat7_id),
    (doc3_id, pat8_id),
    (doc3_id, pat9_id),
    (doc4_id, pat10_id),
    (doc4_id, pat1_id)   -- Alice Thomas a aussi Dr. Girard
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- 5. ASSIGNATIONS AIDE ↔ PATIENT
  -- Camille Roy   → Thomas, Robert, Petit
  -- Thomas Vidal  → Dumont, Richard, Simon
  -- Léa Morin     → Laurent, Michel + Thomas, Robert (many-to-many)
  -- Kévin Perrin  → Mercier, Garcia
  -- ============================================================

  INSERT INTO aide_patient (aide_id, patient_id) VALUES
    (aide1_id, pat1_id),
    (aide1_id, pat2_id),
    (aide1_id, pat3_id),
    (aide2_id, pat4_id),
    (aide2_id, pat5_id),
    (aide2_id, pat6_id),
    (aide3_id, pat7_id),
    (aide3_id, pat8_id),
    (aide3_id, pat1_id),  -- Alice a aussi Léa Morin
    (aide3_id, pat2_id),  -- Marc a aussi Léa Morin
    (aide4_id, pat9_id),
    (aide4_id, pat10_id)
  ON CONFLICT DO NOTHING;

  -- ============================================================
  -- 6. RENDEZ-VOUS (2–3 par patient)
  -- ============================================================

  -- Alice Thomas — chirurgie orthopédique (Dr. Lambert)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat1_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Consultation pré-opératoire',         '12 rue de la Paix, Paris 75001',             now() + interval '10 days'),
    (pat1_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Prothèse totale de genou',             '12 rue de la Paix, Paris 75001',             now() + interval '30 days'),
    (pat1_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Contrôle post-opératoire',             '12 rue de la Paix, Paris 75001',             now() + interval '60 days');

  -- Marc Robert — chirurgie orthopédique (Dr. Lambert)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat2_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Bilan pré-opératoire',                 '12 rue de la Paix, Paris 75001',             now() - interval '5 days'),
    (pat2_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Arthroscopie de l''épaule',             '12 rue de la Paix, Paris 75001',             now() + interval '15 days');

  -- Lucie Petit — chirurgie orthopédique (Dr. Lambert)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat3_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Consultation initiale',                 '12 rue de la Paix, Paris 75001',             now() - interval '20 days'),
    (pat3_id, 'Pierre', 'Lambert', 'Chirurgien orthopédique', 'Pose de plaque fracture radiale',       '12 rue de la Paix, Paris 75001',             now() + interval '5 days');

  -- Antoine Dumont — cardiologie (Dr. Dupuis)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat4_id, 'Claire', 'Dupuis',  'Cardiologue',             'Électrocardiogramme de repos',          '45 avenue Victor Hugo, Lyon 69002',          now() - interval '14 days'),
    (pat4_id, 'Claire', 'Dupuis',  'Cardiologue',             'Pose de stent coronarien',              '45 avenue Victor Hugo, Lyon 69002',          now() + interval '21 days'),
    (pat4_id, 'Claire', 'Dupuis',  'Cardiologue',             'Suivi post-interventionnel',             '45 avenue Victor Hugo, Lyon 69002',          now() + interval '50 days');

  -- Emma Richard — cardiologie (Dr. Dupuis)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat5_id, 'Claire', 'Dupuis',  'Cardiologue',             'Échocardiographie',                     '45 avenue Victor Hugo, Lyon 69002',          now() + interval '7 days'),
    (pat5_id, 'Claire', 'Dupuis',  'Cardiologue',             'Ablation par cathéter',                 '45 avenue Victor Hugo, Lyon 69002',          now() + interval '28 days');

  -- Paul Simon — cardiologie (Dr. Dupuis)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat6_id, 'Claire', 'Dupuis',  'Cardiologue',             'Bilan cardiaque complet',               '45 avenue Victor Hugo, Lyon 69002',          now() - interval '7 days'),
    (pat6_id, 'Claire', 'Dupuis',  'Cardiologue',             'Pontage aorto-coronarien',              '45 avenue Victor Hugo, Lyon 69002',          now() + interval '18 days');

  -- Julie Laurent — neurologie (Dr. Aubert)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat7_id, 'Jean',   'Aubert',  'Neurologue',              'IRM cérébrale',                         '8 boulevard Haussmann, Paris 75009',         now() - interval '10 days'),
    (pat7_id, 'Jean',   'Aubert',  'Neurologue',              'Implantation électrodes profondes',      '8 boulevard Haussmann, Paris 75009',         now() + interval '35 days'),
    (pat7_id, 'Jean',   'Aubert',  'Neurologue',              'Contrôle neurologique',                  '8 boulevard Haussmann, Paris 75009',         now() + interval '70 days');

  -- Théo Michel — neurologie (Dr. Aubert)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat8_id, 'Jean',   'Aubert',  'Neurologue',              'Consultation épilepsie',                 '8 boulevard Haussmann, Paris 75009',         now() + interval '3 days'),
    (pat8_id, 'Jean',   'Aubert',  'Neurologue',              'Électroencéphalogramme',                  '8 boulevard Haussmann, Paris 75009',         now() + interval '12 days');

  -- Sarah Mercier — neurologie (Dr. Aubert)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat9_id, 'Jean',   'Aubert',  'Neurologue',              'Biopsie ganglionnaire',                  '8 boulevard Haussmann, Paris 75009',         now() - interval '3 days'),
    (pat9_id, 'Jean',   'Aubert',  'Neurologue',              'Initiation chimiothérapie',               '8 boulevard Haussmann, Paris 75009',         now() + interval '14 days'),
    (pat9_id, 'Jean',   'Aubert',  'Neurologue',              'Contrôle mi-traitement',                  '8 boulevard Haussmann, Paris 75009',         now() + interval '45 days');

  -- Hugo Garcia — oncologie (Dr. Girard)
  INSERT INTO rendezvous (user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (pat10_id, 'Hélène', 'Girard', 'Oncologue',               'Consultation oncologique initiale',      '3 rue du Faubourg Saint-Antoine, Paris 75011', now() - interval '30 days'),
    (pat10_id, 'Hélène', 'Girard', 'Oncologue',               'Cure de chimiothérapie (cycle 1)',       '3 rue du Faubourg Saint-Antoine, Paris 75011', now() - interval '10 days'),
    (pat10_id, 'Hélène', 'Girard', 'Oncologue',               'Cure de chimiothérapie (cycle 2)',       '3 rue du Faubourg Saint-Antoine, Paris 75011', now() + interval '20 days');

END $$;
