
-- Create group-images storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('group-images', 'group-images', true);

-- Allow authenticated users to upload group images
CREATE POLICY "Authenticated users can upload group images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'group-images');

-- Allow public read access
CREATE POLICY "Public read access for group images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'group-images');

-- Allow group admins to delete group images
CREATE POLICY "Authenticated users can delete group images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'group-images');

-- Allow updating group images
CREATE POLICY "Authenticated users can update group images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'group-images');
