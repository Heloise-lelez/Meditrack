-- ============================================
-- TABLE DOCTOR_PATIENT (relation Many-to-Many)
-- ============================================
-- À coller dans Supabase Studio -> SQL Editor -> Run
-- Dépend de : supabase-roles.sql

CREATE TABLE IF NOT EXISTS doctor_patient (
  doctor_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (doctor_id, patient_id)
);

ALTER TABLE doctor_patient ENABLE ROW LEVEL SECURITY;

-- Les patients peuvent voir leurs médecins assignés (ex: section profil)
DROP POLICY IF EXISTS "dp_patient_sees_own" ON doctor_patient;
CREATE POLICY "dp_patient_sees_own"
  ON doctor_patient FOR SELECT
  USING (auth.uid() = patient_id);

-- Les médecins peuvent voir leurs propres patients
DROP POLICY IF EXISTS "dp_doctor_sees_own" ON doctor_patient;
CREATE POLICY "dp_doctor_sees_own"
  ON doctor_patient FOR SELECT
  USING (auth.uid() = doctor_id);
