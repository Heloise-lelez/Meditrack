-- Add mime_type column to store original file MIME type for encrypted documents
ALTER TABLE document ADD COLUMN IF NOT EXISTS mime_type TEXT;
