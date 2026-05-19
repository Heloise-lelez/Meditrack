ALTER TABLE document ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permettre lecture documents (anon)"
ON document
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Permettre insertion documents (anon)"
ON document
FOR INSERT
TO anon
WITH CHECK (true);


CREATE POLICY "Permettre upload documents (anon)"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Permettre lecture documents storage (anon)"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'documents');
