-- ============================================================
-- TICKET 2 : POLICIES RLS POUR LE RÔLE AIDE (lecture seule)
-- ============================================================
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Dépend de : supabase-aide.sql, supabase-tachesjour.sql, supabase-etape.sql, supabase-migration-user-id.sql

-- ── 1. L'aide peut LIRE les tâches du jour de ses patients ──

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

-- ── 2. L'aide peut LIRE les étapes de ses patients ──────────

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

-- ── 3. L'aide peut LIRE les RDV de ses patients ─────────────

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

-- ── 4. L'aide ne peut PAS accéder aux documents ─────────────
-- (Pas besoin d'ajouter une policy — l'absence de policy SELECT
--  pour l'aide sur la table document suffit à bloquer l'accès.
--  Les policies existantes n'autorisent que auth.uid() = user_id.)

-- ── 5. Signup : permettre la création de profil avec rôle AIDE ──
-- Le trigger handle_new_user crée un profil avec role='PATIENT' par défaut.
-- Pour créer un aide, un ASSISTANT ou SUPER_ADMIN doit mettre à jour le rôle.
-- Alternative : passer le rôle dans les metadata au signup.

-- Mise à jour du trigger pour supporter le rôle dans les metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, tel, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'tel',
    COALESCE(
      NULLIF(new.raw_user_meta_data->>'role', ''),
      'PATIENT'
    )
  );
  RETURN new;
END;
$$;
