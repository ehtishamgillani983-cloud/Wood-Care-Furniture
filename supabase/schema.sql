-- ====================================================================
-- WOOD CARE FURNITURE - SUPABASE PRODUCTION DATABASE SCHEMA
-- Target Database: PostgreSQL / Supabase
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Site Settings & Branding
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  hero_cta_text TEXT DEFAULT 'Explore Furniture',
  hero_cta_link TEXT DEFAULT '/furniture',
  footer_description TEXT DEFAULT 'Wood Care Furniture is a premier solid wood furniture manufacturer and wholesaler in Shamsabad, Rawalpindi.',
  copyright_text TEXT DEFAULT '© 2026 Wood Care Furniture. All rights reserved.',
  seo_title TEXT DEFAULT 'Wood Care Furniture | Luxury Solid Wood Furniture in Rawalpindi & Islamabad',
  seo_description TEXT DEFAULT 'Premier furniture manufacturer and wholesaler in Rawalpindi & Islamabad.',
  seo_keywords TEXT DEFAULT 'furniture rawalpindi, furniture islamabad, wooden beds, custom sofas',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Categories Table
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

-- 3. Subcategories Table
CREATE TABLE IF NOT EXISTS subcategories (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Products Table
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

-- 5. Gallery Items
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

-- 6. Services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  details TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Reviews
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

-- 8. Blog Posts
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

-- 9. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Leads / Inquiries
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

-- 11. Media Library
CREATE TABLE IF NOT EXISTS media_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- --------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
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

-- Public READ policies for active / approved content
CREATE POLICY "Public can view settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active subcategories" ON subcategories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Public can view active gallery items" ON gallery FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Public can view published blog posts" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Public can view active faqs" ON faqs FOR SELECT USING (is_active = true);

-- Public INSERT policies for leads & reviews
CREATE POLICY "Public can submit contact messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can submit customer review" ON reviews FOR INSERT WITH CHECK (true);

-- Authenticated Admin full CRUD
CREATE POLICY "Admin full access settings" ON site_settings FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access categories" ON categories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access subcategories" ON subcategories FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access products" ON products FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access gallery" ON gallery FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access services" ON services FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access reviews" ON reviews FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access blog_posts" ON blog_posts FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access faqs" ON faqs FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access contact_messages" ON contact_messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Admin full access media_items" ON media_items FOR ALL TO authenticated USING (true);
