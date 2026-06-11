
CREATE TABLE public.cms_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Anyone can read published pages
CREATE POLICY "Published CMS pages viewable by all"
  ON public.cms_pages FOR SELECT
  TO public
  USING (is_published = true);

-- Authenticated users can read all pages (for admin)
CREATE POLICY "Admins can view all CMS pages"
  ON public.cms_pages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert
CREATE POLICY "Admins can create CMS pages"
  ON public.cms_pages FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update CMS pages"
  ON public.cms_pages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete
CREATE POLICY "Admins can delete CMS pages"
  ON public.cms_pages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed default pages
INSERT INTO public.cms_pages (slug, title, content, is_published) VALUES
  ('privacy', 'Privacy Policy', '<h2>Privacy Policy</h2><p>Your privacy is important to us. This policy explains how xBook collects, uses, and protects your personal information.</p><h3>Information We Collect</h3><p>We collect information you provide directly, such as your name, email, and profile details.</p><h3>How We Use Your Information</h3><p>We use your information to provide and improve our services, communicate with you, and ensure platform safety.</p>', true),
  ('terms', 'Terms of Service', '<h2>Terms of Service</h2><p>By using xBook, you agree to these terms. Please read them carefully.</p><h3>Account Responsibilities</h3><p>You are responsible for maintaining the security of your account and all activities under it.</p><h3>Content Guidelines</h3><p>You agree not to post content that is illegal, harmful, or violates others'' rights.</p>', true),
  ('ad-choices', 'Ad Choices', '<h2>Ad Choices</h2><p>Learn about how advertising works on xBook and your choices regarding ads.</p><h3>How Ads Work</h3><p>We show you ads based on your interests and activity on the platform.</p><h3>Your Choices</h3><p>You can adjust your ad preferences in your account settings.</p>', true),
  ('cookies', 'Cookie Policy', '<h2>Cookie Policy</h2><p>xBook uses cookies to enhance your experience on our platform.</p><h3>What Are Cookies</h3><p>Cookies are small text files stored on your device that help us recognize you and remember your preferences.</p><h3>Managing Cookies</h3><p>You can control cookies through your browser settings.</p>', true);
