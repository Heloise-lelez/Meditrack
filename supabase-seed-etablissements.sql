-- ============================================================
-- SEED : 2 établissements + assignation aléatoire
--        des DOCTOR et ASSISTANT existants
-- Prérequis : supabase-etablissement.sql déjà exécuté
-- ============================================================

DO $$
DECLARE
  etab1_id UUID;
  etab2_id UUID;
BEGIN

  -- ── Créer 2 établissements ─────────────────────────────────

  INSERT INTO etablissement (nom, adresse)
    VALUES ('Clinique Saint-Louis', '12 rue de la Paix, Paris 75001')
    RETURNING id INTO etab1_id;

  INSERT INTO etablissement (nom, adresse)
    VALUES ('Hôpital du Centre', '45 avenue Victor Hugo, Lyon 69002')
    RETURNING id INTO etab2_id;

  -- ── Assigner aléatoirement les DOCTOR et ASSISTANT ────────
  -- ORDER BY random() dans row_number → ordre aléatoire à chaque exécution
  -- rn impair → étab1, rn pair → étab2 (split équitable)

  UPDATE profiles
  SET etablissement_id = CASE
    WHEN ranked.rn % 2 = 1 THEN etab1_id
    ELSE etab2_id
  END
  FROM (
    SELECT id, row_number() OVER (ORDER BY random()) AS rn
    FROM profiles
    WHERE role IN ('DOCTOR', 'ASSISTANT')
  ) ranked
  WHERE profiles.id = ranked.id;

  RAISE NOTICE 'Établissement 1 (%) : %', etab1_id,
    (SELECT count(*) FROM profiles WHERE etablissement_id = etab1_id);
  RAISE NOTICE 'Établissement 2 (%) : %', etab2_id,
    (SELECT count(*) FROM profiles WHERE etablissement_id = etab2_id);

END $$;
