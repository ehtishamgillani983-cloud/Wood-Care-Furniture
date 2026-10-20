-- ====================================================================
-- WOOD CARE FURNITURE - SUPABASE PRODUCTION DATABASE SCHEMA & RLS MIGRATION
-- Target Database: PostgreSQL / Supabase
-- Target Project ID: qhqahlykekweryenrnli
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Admin Users Allowlist / Role Table
-- Securely defines authorized administrators without hardcoding credentials in client code.
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users
    WHERE (user_id = auth.uid() OR lower(email) = lower(auth.jwt() ->> 'email'))
      AND role IN ('admin', 'super_admin')
  ) OR (
    (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
  );
$$;

-- Authenticated admins can view their own record in admin_users
DROP POLICY IF EXISTS "Admin view own profile" ON admin_users;
CREATE POLICY "Admin view own profile" ON admin_users
  FOR SELECT TO authenticated
  USING (is_admin());

-- Authenticated admins can update their user_id association in admin_users
DROP POLICY IF EXISTS "Admin update own profile" ON admin_users;
CREATE POLICY "Admin update own profile" ON admin_users
  FOR UPDATE TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Site Settings & Branding
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  brand_name TEXT NOT NULL DEFAULT 'Wood Care Furniture',
  tagline TEXT DEFAULT 'Premium Furniture Manufacturer & Wholesaler',
  logo_url TEXT DEFAULT '',
  favicon_url TEXT DEFAULT '',
  phone TEXT NOT NULL DEFAULT '+92 332 5099930',
  whatsapp TEXT NOT NULL DEFAULT '+92 332 5099930',
  email TEXT NOT NULL DEFAULT 'imranshah1984@gmail.com',
  address TEXT NOT NULL DEFAULT 'M33J+C6H, Shamsabad, Rawalpindi, Pakistan',
  postal_code TEXT DEFAULT '46000',
  opening_hours TEXT DEFAULT '9:00 AM – 9:00 PM',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/wood_care_furniture/',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/share/1DvHhN2692/',
  google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=Shamsabad+Rawalpindi',
  hero_heading TEXT DEFAULT 'Furniture Designed for Beautiful Living',
  hero_subheading TEXT DEFAULT 'Thoughtfully crafted solid wood furniture for homes, offices, and signature spaces in Rawalpindi & Islamabad.',
  hero_media_url TEXT DEFAULT '',
  hero_video_url TEXT DEFAULT '',
  hero_video_overlay NUMERIC(3, 2) DEFAULT 0.38,
  hero_videos TEXT[] DEFAULT '{}',
  hero_images TEXT[] DEFAULT '{}',
  hero_cta_text TEXT DEFAULT 'Explore Furniture',
  hero_cta_link TEXT DEFAULT '/furniture',
  hero_interval_seconds INTEGER DEFAULT 6,
  footer_description TEXT DEFAULT 'Wood Care Furniture is a premier solid wood furniture manufacturer and wholesaler in Shamsabad, Rawalpindi.',
  copyright_text TEXT DEFAULT '© 2026 Wood Care Furniture. All rights reserved.',
  seo_title TEXT DEFAULT 'Wood Care Furniture | Luxury Solid Wood Furniture in Rawalpindi & Islamabad',
  seo_description TEXT DEFAULT 'Premier furniture manufacturer and wholesaler in Rawalpindi & Islamabad.',
  seo_keywords TEXT DEFAULT 'furniture rawalpindi, furniture islamabad, wooden beds, custom sofas',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all dynamic hero & interval columns exist if table was already created earlier
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_video_url') THEN
    ALTER TABLE site_settings ADD COLUMN hero_video_url TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_video_overlay') THEN
    ALTER TABLE site_settings ADD COLUMN hero_video_overlay NUMERIC(3, 2) DEFAULT 0.38;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_videos') THEN
    ALTER TABLE site_settings ADD COLUMN hero_videos TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_images') THEN
    ALTER TABLE site_settings ADD COLUMN hero_images TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'site_settings' AND column_name = 'hero_interval_seconds') THEN
    ALTER TABLE site_settings ADD COLUMN hero_interval_seconds INTEGER DEFAULT 6;
  END IF;
END $$;

-- 4. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id TEXT REFERENCES subcategories(id) ON DELETE SET NULL,
  main_image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  description TEXT NOT NULL,
  short_description TEXT,
  material TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  finish TEXT NOT NULL,
  availability TEXT DEFAULT 'made_to_order',
  customizable BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  price NUMERIC(12, 2),
  price_visible BOOLEAN DEFAULT TRUE,
  quote_only BOOLEAN DEFAULT FALSE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure all required columns exist if products or categories table was created earlier
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'order_index') THEN
    ALTER TABLE products ADD COLUMN order_index INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'updated_at') THEN
    ALTER TABLE categories ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Performance and relationship indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

-- 7. Gallery Items
CREATE TABLE IF NOT EXISTS gallery (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT NOT NULL,
  category_name TEXT NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  aspect_ratio TEXT DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  image TEXT DEFAULT '',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  details TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  author_name TEXT NOT NULL,
  location TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  photo_url TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image TEXT NOT NULL,
  category TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT 'Wood Care Team',
  published_at DATE DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT TRUE,
  read_time TEXT DEFAULT '5 min read',
  seo_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Contact Messages & Leads
CREATE TABLE IF NOT EXISTS contact_messages (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  interest TEXT,
  message TEXT NOT NULL,
  source_page TEXT DEFAULT 'contact',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Make sure default ID generator is set for contact_messages if table already existed without default
ALTER TABLE contact_messages ALTER COLUMN id SET DEFAULT uuid_generate_v4()::TEXT;

-- 13. Media Items
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;

-- Drop obsolete or permissive legacy policies
DROP POLICY IF EXISTS "Public can view settings" ON site_settings;
DROP POLICY IF EXISTS "Admin full access settings" ON site_settings;
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Admin full access categories" ON categories;
DROP POLICY IF EXISTS "Public can view active subcategories" ON subcategories;
DROP POLICY IF EXISTS "Admin full access subcategories" ON subcategories;
DROP POLICY IF EXISTS "Public can view products" ON products;
DROP POLICY IF EXISTS "Admin full access products" ON products;
DROP POLICY IF EXISTS "Public can view active gallery items" ON gallery;
DROP POLICY IF EXISTS "Admin full access gallery" ON gallery;
DROP POLICY IF EXISTS "Public can view active services" ON services;
DROP POLICY IF EXISTS "Admin full access services" ON services;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public can submit customer review" ON reviews;
DROP POLICY IF EXISTS "Admin full access reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Admin full access blog_posts" ON blog_posts;
DROP POLICY IF EXISTS "Public can view active faqs" ON faqs;
DROP POLICY IF EXISTS "Admin full access faqs" ON faqs;
DROP POLICY IF EXISTS "Public can submit contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin full access contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "Public can view contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin full access media_items" ON media_items;

-- --------------------------------------------------
-- A. PUBLIC READ POLICIES (Showroom Visitors)
-- --------------------------------------------------
-- Visitors can read public site settings
CREATE POLICY "Public can view settings" ON site_settings
  FOR SELECT TO public
  USING (true);

-- Visitors can read active categories & subcategories
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT TO public
  USING (is_active = true OR is_admin());

CREATE POLICY "Public can view active subcategories" ON subcategories
  FOR SELECT TO public
  USING (is_active = true OR is_admin());

-- Visitors can view products
CREATE POLICY "Public can view products" ON products
  FOR SELECT TO public
  USING (true);

-- Visitors can view active gallery items
CREATE POLICY "Public can view active gallery items" ON gallery
  FOR SELECT TO public
  USING (is_active = true OR is_admin());

-- Visitors can view active services
CREATE POLICY "Public can view active services" ON services
  FOR SELECT TO public
  USING (is_active = true OR is_admin());

-- Visitors can view published blog posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
  FOR SELECT TO public
  USING (is_published = true OR is_admin());

-- Visitors can view active faqs
CREATE POLICY "Public can view active faqs" ON faqs
  FOR SELECT TO public
  USING (is_active = true OR is_admin());

-- Visitors can ONLY view approved reviews
CREATE POLICY "Public can view approved reviews" ON reviews
  FOR SELECT TO public
  USING (is_approved = true OR is_admin());

-- --------------------------------------------------
-- B. PUBLIC SUBMISSION POLICIES (Leads & Reviews)
-- --------------------------------------------------
-- Visitors can submit quote requests / inquiries (INSERT ONLY, NO SELECT OR DELETE)
CREATE POLICY "Public can submit contact messages" ON contact_messages
  FOR INSERT TO public
  WITH CHECK (true);

-- Visitors can submit new reviews (unapproved by default)
CREATE POLICY "Public can submit customer review" ON reviews
  FOR INSERT TO public
  WITH CHECK (is_approved = false);

-- --------------------------------------------------
-- C. AUTHORIZED ADMIN CRUD POLICIES
-- Verified by is_admin() function (matches admin_users allowlist)
-- --------------------------------------------------
CREATE POLICY "Admin write settings" ON site_settings
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage categories" ON categories
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage subcategories" ON subcategories
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage products" ON products
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage gallery" ON gallery
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage services" ON services
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage reviews" ON reviews
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage blog_posts" ON blog_posts
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage faqs" ON faqs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage contact_messages" ON contact_messages
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin manage media_items" ON media_items
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- --------------------------------------------------
-- D. Initial Admin User Seeding Helper
-- Seed the showroom owner email into admin_users allowlist
-- --------------------------------------------------
INSERT INTO admin_users (email, role)
VALUES 
  ('webstudionova1@gmail.com', 'super_admin'),
  ('imranshah1984@gmail.com', 'super_admin')
ON CONFLICT (email) DO UPDATE SET role = 'super_admin';

-- --------------------------------------------------
-- E. Supabase Storage Bucket Configuration
-- Public 'media' bucket for showroom photos, videos, and logos
-- --------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  20971520, -- 20MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Row Level Security Policies
DROP POLICY IF EXISTS "Public read media objects" ON storage.objects;
CREATE POLICY "Public read media objects"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Admin upload media objects" ON storage.objects;
CREATE POLICY "Admin upload media objects"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND is_admin());

DROP POLICY IF EXISTS "Admin update media objects" ON storage.objects;
CREATE POLICY "Admin update media objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND is_admin())
WITH CHECK (bucket_id = 'media' AND is_admin());

DROP POLICY IF EXISTS "Admin delete media objects" ON storage.objects;
CREATE POLICY "Admin delete media objects"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND is_admin());

