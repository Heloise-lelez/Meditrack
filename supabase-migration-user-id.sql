-- ============================================
-- MIGRATION : isolation par utilisateur
-- ============================================
-- À coller dans Supabase Studio -> SQL Editor -> Run

-- Ajouter user_id aux deux tables
ALTER TABLE rendezvous ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE document   ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ---- Rendezvous : remplacer policies anon ----
DROP POLICY IF EXISTS "rendezvous_select_anon" ON rendezvous;
DROP POLICY IF EXISTS "rendezvous_insert_anon" ON rendezvous;
DROP POLICY IF EXISTS "rendezvous_update_anon" ON rendezvous;
DROP POLICY IF EXISTS "rendezvous_delete_anon" ON rendezvous;

CREATE POLICY "rendezvous_select_own" ON rendezvous FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rendezvous_insert_own" ON rendezvous FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rendezvous_delete_own" ON rendezvous FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- Document : remplacer policies anon ----
DROP POLICY IF EXISTS "Permettre lecture documents (anon)" ON document;
DROP POLICY IF EXISTS "Permettre insertion documents (anon)" ON document;

CREATE POLICY "document_select_own" ON document FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "document_insert_own" ON document FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "document_delete_own" ON document FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ---- Storage : remplacer policies anon ----
DROP POLICY IF EXISTS "Permettre upload documents (anon)" ON storage.objects;
DROP POLICY IF EXISTS "Permettre lecture documents storage (anon)" ON storage.objects;

CREATE POLICY "storage_insert_auth" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "storage_select_auth" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "storage_delete_auth" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents');
