-- Create avatars storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for the 'avatars' bucket
-- Policy to allow authenticated users to upload their own avatar
CREATE POLICY "Allow authenticated users to upload their own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow authenticated users to view avatars
CREATE POLICY "Allow authenticated users to view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Policy to allow users to update their own avatar
CREATE POLICY "Allow users to update their own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy to allow users to delete their own avatar
CREATE POLICY "Allow users to delete their own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

