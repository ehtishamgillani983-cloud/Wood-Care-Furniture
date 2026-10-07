export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  subcategory_id?: string;
  main_image: string;
  images: string[];
  video_url?: string;
  description: string;
  short_description: string;
  material: string;
  dimensions: string;
  finish: string;
  availability: 'in_stock' | 'made_to_order' | 'custom_only';
  customizable: boolean;
  featured: boolean;
  is_new: boolean;
  is_bestseller: boolean;
  tags: string[];
  price: number | null;
  price_visible: boolean;
  quote_only: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order_index: number;
  is_active: boolean;
  is_featured: boolean;
  seo_title?: string;
  seo_description?: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  order_index: number;
  is_active: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category_name?: string;
  category?: string;
  featured: boolean;
  order_index: number;
  is_active: boolean;
  aspect_ratio?: string;
}

export interface Service {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  image?: string;
  icon?: string;
  features?: string[];
  order_index?: number;
  is_active?: boolean;
  details?: string[];
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail: string;
  category: string;
  is_featured: boolean;
  order_index: number;
}

export interface Review {
  id: string;
  author_name: string;
  location: string;
  rating: number;
  review_text: string;
  photo_url?: string;
  is_approved: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  category: string;
  author: string;
  published_at: string;
  is_published: boolean;
  read_time: string;
  seo_title?: string;
  meta_description?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email: string;
  interest: string;
  message: string;
  source_page: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  created_at: string;
}

export interface SiteSettings {
  brand_name: string;
  tagline: string;
  logo_url: string;
  favicon_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  postal_code: string;
  opening_hours: string;
  instagram_url: string;
  facebook_url: string;
  google_maps_url: string;
  hero_heading: string;
  hero_subheading: string;
  hero_media_url: string;
  hero_images?: string[];
  hero_cta_text: string;
  hero_cta_link: string;
  footer_description: string;
  copyright_text: string;
  // SEO
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}
