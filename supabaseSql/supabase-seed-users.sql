-- ============================================
-- SEED : 4 utilisateurs de test + rendez-vous
-- ============================================
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Mot de passe commun : Test1234!

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  user1_id UUID := gen_random_uuid();
  user2_id UUID := gen_random_uuid();
  user3_id UUID := gen_random_uuid();
  user4_id UUID := gen_random_uuid();
BEGIN

  -- ---- Utilisateurs ----
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, raw_app_meta_data,
    aud, role, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
    (
      user1_id, '00000000-0000-0000-0000-000000000000',
      'jean.dupont@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Dupont","prenom":"Jean","tel":"0612345678"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    ),
    (
      user2_id, '00000000-0000-0000-0000-000000000000',
      'marie.martin@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Martin","prenom":"Marie"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    ),
    (
      user3_id, '00000000-0000-0000-0000-000000000000',
      'pierre.bernard@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Bernard","prenom":"Pierre","tel":"0698765432"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    ),
    (
      user4_id, '00000000-0000-0000-0000-000000000000',
      'sophie.leroy@test.com', crypt('Test1234!', gen_salt('bf')),
      now(), '{"nom":"Leroy","prenom":"Sophie"}', '{"provider":"email","providers":["email"]}',
      'authenticated', 'authenticated', now(), now(), '', '', '', ''
    );

  -- ---- Profils (si la table profiles existe) ----
  INSERT INTO profiles (id, nom, prenom, tel) VALUES
    (user1_id, 'Dupont', 'Jean', '0612345678'),
    (user2_id, 'Martin', 'Marie', NULL),
    (user3_id, 'Bernard', 'Pierre', '0698765432'),
    (user4_id, 'Leroy', 'Sophie', NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ---- Rendez-vous : Jean Dupont (prothèse de hanche) ----
  INSERT INTO rendezvous (id_rendezvous, user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (gen_random_uuid(), user1_id, 'François', 'Moreau', 'Chirurgien orthopédique', 'Consultation pré-opératoire', '12 Rue de la Paix, 75001 Paris', now() + interval '7 days'),
    (gen_random_uuid(), user1_id, 'Claire', 'Petit', 'Anesthésiste', 'Bilan pré-anesthésique', '12 Rue de la Paix, 75001 Paris', now() + interval '14 days'),
    (gen_random_uuid(), user1_id, 'François', 'Moreau', 'Chirurgien orthopédique', 'Prothèse totale de hanche', '12 Rue de la Paix, 75001 Paris', now() + interval '30 days'),
    (gen_random_uuid(), user1_id, 'Claire', 'Petit', 'Anesthésiste', 'Visite post-opératoire', '12 Rue de la Paix, 75001 Paris', now() - interval '60 days');

  -- ---- Rendez-vous : Marie Martin (pontage coronarien) ----
  INSERT INTO rendezvous (id_rendezvous, user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (gen_random_uuid(), user2_id, 'Antoine', 'Lefebvre', 'Cardiologue', 'Bilan cardiaque', '5 Avenue Montaigne, 75008 Paris', now() - interval '14 days'),
    (gen_random_uuid(), user2_id, 'Sophie', 'Durand', 'Chirurgien cardiaque', 'Pontage coronarien', '5 Avenue Montaigne, 75008 Paris', now() + interval '21 days'),
    (gen_random_uuid(), user2_id, 'Antoine', 'Lefebvre', 'Cardiologue', 'Contrôle post-opératoire', '5 Avenue Montaigne, 75008 Paris', now() + interval '60 days');

  -- ---- Rendez-vous : Pierre Bernard (chirurgie cataracte) ----
  INSERT INTO rendezvous (id_rendezvous, user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (gen_random_uuid(), user3_id, 'Marc', 'Rousseau', 'Ophtalmologue', 'Consultation initiale', '8 Boulevard Haussmann, 75009 Paris', now() - interval '30 days'),
    (gen_random_uuid(), user3_id, 'Marc', 'Rousseau', 'Ophtalmologue', 'Chirurgie de la cataracte (œil droit)', '8 Boulevard Haussmann, 75009 Paris', now() - interval '10 days'),
    (gen_random_uuid(), user3_id, 'Marc', 'Rousseau', 'Ophtalmologue', 'Chirurgie de la cataracte (œil gauche)', '8 Boulevard Haussmann, 75009 Paris', now() + interval '5 days');

  -- ---- Rendez-vous : Sophie Leroy (appendicectomie) ----
  INSERT INTO rendezvous (id_rendezvous, user_id, doctor_first_name, doctor_last_name, profession, operation, address, starts_at) VALUES
    (gen_random_uuid(), user4_id, 'Nicolas', 'Simon', 'Chirurgien digestif', 'Consultation urgences', '3 Rue du Faubourg Saint-Antoine, 75011 Paris', now() - interval '45 days'),
    (gen_random_uuid(), user4_id, 'Nicolas', 'Simon', 'Chirurgien digestif', 'Appendicectomie', '3 Rue du Faubourg Saint-Antoine, 75011 Paris', now() - interval '40 days'),
    (gen_random_uuid(), user4_id, 'Pauline', 'Lambert', 'Gastro-entérologue', 'Contrôle post-opératoire', '3 Rue du Faubourg Saint-Antoine, 75011 Paris', now() + interval '15 days');

END $$;
