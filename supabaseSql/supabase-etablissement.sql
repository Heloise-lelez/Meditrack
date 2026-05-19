-- Feature: établissements
-- Run this in Supabase Studio SQL Editor

-- 1. Table établissement
CREATE TABLE etablissement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  adresse TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE etablissement ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read (needed by frontend dropdowns)
CREATE POLICY "Auth read etablissements" ON etablissement
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. FK on profiles for DOCTOR and ASSISTANT (nullable)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS etablissement_id UUID
  REFERENCES etablissement(id) ON DELETE SET NULL;

-- 3. Many-to-many junction: patient ↔ établissement
CREATE TABLE patient_etablissement (
  patient_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etablissement_id UUID NOT NULL REFERENCES etablissement(id) ON DELETE CASCADE,
  enrolled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (patient_id, etablissement_id)
);

ALTER TABLE patient_etablissement ENABLE ROW LEVEL SECURITY;

-- Patients can see their own establishment memberships
CREATE POLICY "Patients see own enrollments" ON patient_etablissement
  FOR SELECT USING (patient_id = auth.uid());
