import { 
  SiteSettings, 
  Category, 
  Subcategory, 
  Product, 
  GalleryItem, 
  Service, 
  Review, 
  BlogPost, 
  FAQ, 
  Lead,
  VideoItem
} from '../types';
import { 
  initialSettings, 
  initialCategories, 
  initialSubcategories, 
  initialProducts, 
  initialGalleryItems, 
  initialServices, 
  initialReviews, 
  initialBlogPosts, 
  initialFAQs,
  initialVideos
} from '../data/initialData';
import { supabase, isSupabaseConfigured } from './supabase';
import { getIdb, setIdb } from './idb';

const STORAGE_KEYS = {
  SETTINGS: 'woodcare_settings',
  CATEGORIES: 'woodcare_categories',
  SUBCATEGORIES: 'woodcare_subcategories',
  PRODUCTS: 'woodcare_products',
  GALLERY: 'woodcare_gallery',
  SERVICES: 'woodcare_services',
  REVIEWS: 'woodcare_reviews',
  BLOG: 'woodcare_blog',
  FAQS: 'woodcare_faqs',
  VIDEOS: 'woodcare_videos',
  LEADS: 'woodcare_leads',
  WISHLIST: 'woodcare_wishlist',
  ADMIN_AUTH: 'woodcare_admin_session',
  MEDIA: 'woodcare_media',
  INITIAL_SEEDED: 'woodcare_supabase_seeded_v1'
};

// Fixed single ID for singleton site_settings row in Supabase
const SETTINGS_ROW_ID = '00000000-0000-0000-0000-000000000001';

// In-memory runtime cache to guarantee that data updates and persists across UI actions
const memoryCache: Record<string, unknown> = {};

// Asynchronously hydrate keys from IndexedDB into memoryCache and localStorage on app load
if (typeof window !== 'undefined') {
  Object.values(STORAGE_KEYS).forEach((key) => {
    getIdb(key).then((val) => {
      if (val !== null && val !== undefined) {
        memoryCache[key] = val;
        try {
          localStorage.setItem(key, JSON.stringify(val));
        } catch {
          // ignore quota
        }
        window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key } }));
      }
    });
  });

  // Pull remote data from Supabase centrally and sync into local store
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const verifyAndStoreAdminSession = async (userEmail: string, userId: string, appRole?: string) => {
      try {
        const isAppAdmin = appRole === 'admin' || appRole === 'super_admin';
        const cleanEmail = userEmail.toLowerCase();
        const { data: adminRecord } = await client
          .from('admin_users')
          .select('role')
          .or(`user_id.eq.${userId},email.eq.${cleanEmail}`)
          .maybeSingle();

        const role = adminRecord?.role || (isAppAdmin ? (appRole as string) : null);

        if (role === 'admin' || role === 'super_admin') {
          setLocal(STORAGE_KEYS.ADMIN_AUTH, {
            authenticated: true,
            email: userEmail,
            role,
            provider: 'Supabase Authentication',
            timestamp: Date.now()
          });
          return true;
        } else {
          // User is not in admin allowlist
          delete memoryCache[STORAGE_KEYS.ADMIN_AUTH];
          try {
            localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
          } catch {}
          window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key: STORAGE_KEYS.ADMIN_AUTH } }));
          return false;
        }
      } catch {
        return false;
      }
    };

    // Check existing active Supabase session
    client.auth.getSession().then(async ({ data }) => {
      if (data?.session?.user?.email) {
        await verifyAndStoreAdminSession(
          data.session.user.email, 
          data.session.user.id,
          (data.session.user.app_metadata?.role as string)
        );
      } else {
        delete memoryCache[STORAGE_KEYS.ADMIN_AUTH];
        try {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        } catch {}
      }
      syncRemoteFromSupabase();
    }).catch(() => {
      syncRemoteFromSupabase();
    });

    // Listen to real-time auth changes
    client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        await verifyAndStoreAdminSession(
          session.user.email, 
          session.user.id,
          (session.user.app_metadata?.role as string)
        );
        syncRemoteFromSupabase();
      } else if (_event === 'SIGNED_OUT') {
        delete memoryCache[STORAGE_KEYS.ADMIN_AUTH];
        try {
          localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        } catch {}
        window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key: STORAGE_KEYS.ADMIN_AUTH } }));
      }
    });
  }
}

async function syncRemoteFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // 1. Fetch site_settings
    const { data: settingsData } = await supabase.from('site_settings').select('*').limit(1);
    if (settingsData && settingsData.length > 0) {
      const remoteSet = settingsData[0];
      const cur = Store.getSettings();
      const merged: SiteSettings = {
        ...cur,
        ...remoteSet
      };
      setLocal(STORAGE_KEYS.SETTINGS, merged);
    }

    // 2. Fetch categories
    const { data: catData } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (catData && catData.length > 0) {
      setLocal(STORAGE_KEYS.CATEGORIES, catData as Category[]);
    }

    // 2b. Fetch subcategories
    try {
      const { data: subData } = await supabase.from('subcategories').select('*').order('order_index', { ascending: true });
      if (subData && subData.length > 0) {
        setLocal(STORAGE_KEYS.SUBCATEGORIES, subData as Subcategory[]);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 3. Fetch products
    const { data: prodData } = await supabase.from('products').select('*');
    if (prodData && prodData.length > 0) {
      const sanitized: Product[] = (prodData as any[]).map(p => ({
        ...p,
        images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.main_image],
        customizable: p.customizable ?? true,
        featured: p.featured ?? true,
        price: null,
        price_visible: false,
        quote_only: true
      }));
      setLocal(STORAGE_KEYS.PRODUCTS, sanitized);
    }

    // 4. Fetch services
    try {
      const { data: srvData } = await supabase.from('services').select('*').order('order_index', { ascending: true });
      if (srvData && srvData.length > 0) {
        setLocal(STORAGE_KEYS.SERVICES, srvData as Service[]);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 5. Fetch reviews
    try {
      const { data: revData } = await supabase.from('reviews').select('*');
      if (revData && revData.length > 0) {
        setLocal(STORAGE_KEYS.REVIEWS, revData as Review[]);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 6. Fetch blog posts
    try {
      const { data: blogData } = await supabase.from('blog_posts').select('*');
      if (blogData && blogData.length > 0) {
        setLocal(STORAGE_KEYS.BLOG, blogData as BlogPost[]);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 7. Fetch FAQs
    try {
      const { data: faqData } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
      if (faqData && faqData.length > 0) {
        setLocal(STORAGE_KEYS.FAQS, faqData as FAQ[]);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 8. Fetch Gallery
    try {
      const { data: galData } = await supabase.from('gallery').select('*').order('order_index', { ascending: true });
      if (galData && galData.length > 0) {
        setLocal(STORAGE_KEYS.GALLERY, galData as GalleryItem[]);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 9. Fetch Media items
    try {
      const { data: mediaData } = await supabase.from('media_items').select('*').order('created_at', { ascending: false });
      if (mediaData && mediaData.length > 0) {
        const formatted = mediaData.map((m: any) => ({
          id: m.id,
          name: m.file_name,
          url: m.file_url,
          date: m.created_at ? m.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
        }));
        setLocal(STORAGE_KEYS.MEDIA, formatted);
      }
    } catch {
      // Table may be pending creation in migration
    }

    // 10. Fetch Leads (only when authenticated as admin)
    if (Store.isAdminAuthenticated()) {
      try {
        const { data: leadsData } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (leadsData && leadsData.length > 0) {
          setLocal(STORAGE_KEYS.LEADS, leadsData as Lead[]);
        }
      } catch {
        // Table may be pending creation in migration
      }
    }

    // Notify UI components of updated data
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key: 'all' } }));
    }
  } catch (err) {
    console.warn('Notice: Background Supabase synchronization check:', err);
  }
}

function getLocal<T>(key: string, fallback: T): T {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key] as T;
  }
  if (typeof localStorage === 'undefined') {
    memoryCache[key] = fallback;
    return fallback;
  }
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      memoryCache[key] = fallback;
      return fallback;
    }
    const parsed = JSON.parse(item) as T;
    memoryCache[key] = parsed;
    return parsed;
  } catch {
    memoryCache[key] = fallback;
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  // Always update in-memory cache first for instant synchronous consistency
  memoryCache[key] = value;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`Storage quota notice for ${key}, operating from IndexedDB.`, err);
    }
  }
  // Always persist in IndexedDB asynchronously
  setIdb(key, value).catch(() => {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key } }));
  }
}

// --- Database Schema Sanitizers to prevent 400 column errors ---
function sanitizeSettingsForSupabase(s: SiteSettings) {
  return {
    id: SETTINGS_ROW_ID,
    brand_name: s.brand_name || 'Wood Care Furniture',
    tagline: s.tagline || '',
    logo_url: s.logo_url || '',
    favicon_url: s.favicon_url || '',
    phone: s.phone || '+92 332 5099930',
    whatsapp: s.whatsapp || '+92 332 5099930',
    email: s.email || 'imranshah1984@gmail.com',
    address: s.address || 'M33J+C6H, Shamsabad, Rawalpindi, Pakistan',
    postal_code: s.postal_code || '46000',
    opening_hours: s.opening_hours || '9:00 AM – 9:00 PM',
    instagram_url: s.instagram_url || '',
    facebook_url: s.facebook_url || '',
    google_maps_url: s.google_maps_url || '',
    hero_heading: s.hero_heading || '',
    hero_subheading: s.hero_subheading || '',
    hero_media_url: s.hero_media_url || '',
    hero_video_url: s.hero_video_url || '',
    hero_video_overlay: typeof s.hero_video_overlay === 'number' ? s.hero_video_overlay : 0.38,
    hero_videos: Array.isArray(s.hero_videos) ? s.hero_videos : [],
    hero_images: Array.isArray(s.hero_images) ? s.hero_images : [],
    hero_cta_text: s.hero_cta_text || 'Explore Furniture',
    hero_cta_link: s.hero_cta_link || '/furniture',
    hero_interval_seconds: typeof s.hero_interval_seconds === 'number' ? s.hero_interval_seconds : 6,
    footer_description: s.footer_description || '',
    copyright_text: s.copyright_text || '',
    seo_title: s.seo_title || '',
    seo_description: s.seo_description || '',
    seo_keywords: s.seo_keywords || '',
    updated_at: new Date().toISOString()
  };
}

function sanitizeCategoryForSupabase(c: Category) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    image: c.image || '',
    order_index: typeof c.order_index === 'number' ? c.order_index : 0,
    is_active: c.is_active ?? true,
    is_featured: c.is_featured ?? false,
    seo_title: c.seo_title || null,
    seo_description: c.seo_description || null
  };
}

function sanitizeProductForSupabase(p: Product) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id || null,
    subcategory_id: p.subcategory_id || null,
    main_image: p.main_image,
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.main_image],
    video_url: p.video_url || null,
    description: p.description || '',
    short_description: p.short_description || '',
    material: p.material || '',
    dimensions: p.dimensions || '',
    finish: p.finish || '',
    availability: p.availability || 'made_to_order',
    customizable: p.customizable ?? true,
    featured: p.featured ?? true,
    is_new: p.is_new ?? false,
    is_bestseller: p.is_bestseller ?? false,
    tags: Array.isArray(p.tags) ? p.tags : [],
    price: null,
    price_visible: false,
    quote_only: true,
    order_index: typeof p.order_index === 'number' ? p.order_index : 0,
    created_at: p.created_at || new Date().toISOString()
  };
}

function sanitizeGalleryForSupabase(g: GalleryItem) {
  return {
    id: g.id,
    title: g.title,
    description: g.description || '',
    image: g.image,
    category_name: g.category_name || (g as any).category || 'Living Room',
    featured: g.featured ?? false,
    order_index: typeof g.order_index === 'number' ? g.order_index : 0,
    is_active: g.is_active ?? true,
    aspect_ratio: g.aspect_ratio || 'standard'
  };
}

export const Store = {
  // --- Check Supabase Configuration Status ---
  isSupabaseConnected(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  },

  async manualSyncSupabase(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }
    try {
      await syncRemoteFromSupabase();
      return { success: true, message: 'Successfully synced with Supabase cloud database!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Sync failed.' };
    }
  },

  async seedAllToSupabase(): Promise<{ success: boolean; message: string; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }
    try {
      // 1. Push settings
      const settings = this.getSettings();
      const payloadSettings = sanitizeSettingsForSupabase(settings);
      const { error: setErr } = await supabase.from('site_settings').upsert([payloadSettings]);
      if (setErr) throw setErr;

      // 2. Push categories
      const cats = this.getCategories();
      if (cats.length > 0) {
        const payloadCats = cats.map(sanitizeCategoryForSupabase);
        const { error: catErr } = await supabase.from('categories').upsert(payloadCats);
        if (catErr) throw catErr;
      }

      // 2b. Push subcategories
      try {
        const subcats = this.getSubcategories();
        if (subcats.length > 0) {
          await supabase.from('subcategories').upsert(subcats);
        }
      } catch {
        // subcategories table may be pending creation
      }

      // 3. Push products
      const prods = this.getProducts();
      if (prods.length > 0) {
        const payloadProds = prods.map(sanitizeProductForSupabase);
        const { error: prodErr } = await supabase.from('products').upsert(payloadProds);
        if (prodErr) throw prodErr;
      }

      // 4. Push gallery
      const gals = this.getGallery();
      if (gals.length > 0) {
        const payloadGals = gals.map(sanitizeGalleryForSupabase);
        await supabase.from('gallery').upsert(payloadGals).then();
      }

      // 5. Push services
      const srvs = this.getServices();
      if (srvs.length > 0) {
        await supabase.from('services').upsert(srvs).then();
      }

      // 6. Push FAQs
      const faqs = this.getFAQs();
      if (faqs.length > 0) {
        await supabase.from('faqs').upsert(faqs).then();
      }

      // 7. Push Blog posts
      const blogs = this.getBlogPosts();
      if (blogs.length > 0) {
        await supabase.from('blog_posts').upsert(blogs).then();
      }

      // 8. Push Reviews
      const revs = this.getReviews();
      if (revs.length > 0) {
        await supabase.from('reviews').upsert(revs).then();
      }

      return { success: true, message: 'Showroom products, categories, gallery, and settings saved to Supabase cloud!' };
    } catch (err: any) {
      const errMsg = err?.message || 'Database write rejected by policy.';
      return { success: false, message: `Cloud upload error: ${errMsg}`, error: errMsg };
    }
  },

  // --- Settings ---
  getSettings(): SiteSettings {
    const loaded = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
    const brandName = (loaded.brand_name && !loaded.brand_name.toLowerCase().includes('woodgear')) 
      ? loaded.brand_name 
      : 'Wood Care Furniture';
    const logoUrl = (loaded.logo_url && !loaded.logo_url.includes('woodgear')) 
      ? loaded.logo_url 
      : '/wood_care_logo.svg';

    const rawHeroVideos = loaded.hero_videos && loaded.hero_videos.length > 0 ? loaded.hero_videos : initialSettings.hero_videos;
    const heroVideos = rawHeroVideos?.map(v => v.includes('dQw4w9WgXcQ') ? 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80' : v);

    const merged: SiteSettings = {
      ...initialSettings,
      ...loaded,
      hero_images: loaded.hero_images && loaded.hero_images.length > 0 ? loaded.hero_images : initialSettings.hero_images,
      hero_videos: heroVideos,
      hero_video_url: loaded.hero_video_url && !loaded.hero_video_url.includes('dQw4w9WgXcQ') ? loaded.hero_video_url : initialSettings.hero_video_url,
      hero_video_overlay: typeof loaded.hero_video_overlay === 'number' ? loaded.hero_video_overlay : (initialSettings.hero_video_overlay ?? 0.38),
      hero_interval_seconds: typeof loaded.hero_interval_seconds === 'number' && loaded.hero_interval_seconds >= 2 && loaded.hero_interval_seconds <= 60 
        ? loaded.hero_interval_seconds 
        : (initialSettings.hero_interval_seconds ?? 6),
      brand_name: brandName,
      logo_url: logoUrl,
      favicon_url: loaded.favicon_url || '/wood_care_logo.svg'
    };
    return merged;
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<{ success: boolean; data: SiteSettings; error?: string }> {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setLocal(STORAGE_KEYS.SETTINGS, updated);

    // Sync to Supabase cloud database
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = sanitizeSettingsForSupabase(updated);
        const { error } = await supabase.from('site_settings').upsert([payload]);
        if (error) {
          console.error('Supabase site_settings upsert error:', error);
          return { success: false, data: updated, error: error.message };
        }
      } catch (err: any) {
        console.error('Supabase site_settings network error:', err);
        return { success: false, data: updated, error: err?.message || 'Network error' };
      }
    }
    return { success: true, data: updated };
  },

  // --- Categories ---
  getCategories(): Category[] {
    const list = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const seen = new Set<string>();
    const seenSlugs = new Set<string>();
    const uniqueList: Category[] = [];
    for (const c of list) {
      if (c && c.id && !seen.has(c.id) && (!c.slug || !seenSlugs.has(c.slug.toLowerCase()))) {
        seen.add(c.id);
        if (c.slug) seenSlugs.add(c.slug.toLowerCase());
        uniqueList.push(c);
      }
    }
    return uniqueList.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  },

  async saveCategory(cat: Category): Promise<{ success: boolean; error?: string }> {
    const current = this.getCategories().filter(c => c.id !== cat.id && c.slug.toLowerCase() !== cat.slug.toLowerCase());
    const list = [...current, cat];
    setLocal(STORAGE_KEYS.CATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = sanitizeCategoryForSupabase(cat);
        const { error } = await supabase.from('categories').upsert([payload]);
        if (error) {
          console.error('Supabase categories upsert error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  async reorderCategories(orderedIds: string[]): Promise<{ success: boolean; error?: string }> {
    const current = this.getCategories();
    const updated = current.map(cat => {
      const idx = orderedIds.indexOf(cat.id);
      return {
        ...cat,
        order_index: idx >= 0 ? idx + 1 : cat.order_index
      };
    }).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    setLocal(STORAGE_KEYS.CATEGORIES, updated);
    if (isSupabaseConfigured && supabase) {
      try {
        const payloads = updated.map(sanitizeCategoryForSupabase);
        const { error } = await supabase.from('categories').upsert(payloads);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  async deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getCategories().filter(c => c.id !== id && c.slug !== id);
    setLocal(STORAGE_KEYS.CATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      try {
        // Disassociate products referencing this category to avoid foreign key failure
        await supabase.from('products').update({ category_id: null }).eq('category_id', id);
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  // --- Subcategories ---
  getSubcategories(): Subcategory[] {
    return getLocal<Subcategory[]>(STORAGE_KEYS.SUBCATEGORIES, initialSubcategories);
  },

  async saveSubcategory(sub: Subcategory): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getSubcategories()];
    const index = list.findIndex(s => s.id === sub.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...sub };
    } else {
      list.push(sub);
    }
    setLocal(STORAGE_KEYS.SUBCATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('subcategories').upsert([sub]);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  async deleteSubcategory(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getSubcategories().filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('subcategories').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Products (NO PRICES - Inquiry Based) ---
  getProducts(): Product[] {
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const seen = new Set<string>();
    const seenSlugs = new Set<string>();
    const uniqueList: Product[] = [];
    for (const p of list) {
      if (p && p.id && !seen.has(p.id) && (!p.slug || !seenSlugs.has(p.slug.toLowerCase()))) {
        seen.add(p.id);
        if (p.slug) seenSlugs.add(p.slug.toLowerCase());
        uniqueList.push({
          ...p,
          price: null,
          price_visible: false,
          quote_only: true
        });
      }
    }
    return uniqueList;
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug || p.id === slug);
  },

  getProductsByCategory(categoryIdOrSlug: string): Product[] {
    if (!categoryIdOrSlug || categoryIdOrSlug === 'all') {
      return this.getProducts();
    }
    const cleanTarget = categoryIdOrSlug.trim().toLowerCase();
    const categories = this.getCategories();
    const targetCat = categories.find(c => 
      c.id.toLowerCase() === cleanTarget || 
      c.slug.toLowerCase() === cleanTarget
    );
    return this.getProducts().filter(p => {
      const pCat = (p.category_id || '').toLowerCase();
      if (pCat === cleanTarget) return true;
      if (targetCat) {
        return pCat === targetCat.id.toLowerCase() || pCat === targetCat.slug.toLowerCase();
      }
      return false;
    });
  },

  async saveProduct(prod: Product): Promise<{ success: boolean; error?: string }> {
    const sanitizedProd: Product = {
      ...prod,
      images: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.main_image],
      price: null,
      price_visible: false,
      quote_only: true
    };
    const current = this.getProducts().filter(p => p.id !== sanitizedProd.id && p.slug.toLowerCase() !== sanitizedProd.slug.toLowerCase());
    const list = [sanitizedProd, ...current];
    setLocal(STORAGE_KEYS.PRODUCTS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = sanitizeProductForSupabase(sanitizedProd);
        const { error } = await supabase.from('products').upsert([payload]);
        if (error) {
          console.error('Supabase products upsert error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  reorderProducts(orderedIds: string[]): void {
    const current = this.getProducts();
    const idMap = new Map(current.map(p => [p.id, p]));
    const reordered: Product[] = [];
    orderedIds.forEach(id => {
      const p = idMap.get(id);
      if (p) {
        reordered.push(p);
        idMap.delete(id);
      }
    });
    idMap.forEach(p => reordered.push(p));
    setLocal(STORAGE_KEYS.PRODUCTS, reordered);
  },

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getProducts().filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PRODUCTS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error' };
      }
    }
    return { success: true };
  },

  // --- Gallery Items ---
  getGallery(): GalleryItem[] {
    return getLocal<GalleryItem[]>(STORAGE_KEYS.GALLERY, initialGalleryItems);
  },

  async saveGalleryItem(item: GalleryItem): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getGallery()];
    const index = list.findIndex(g => g.id === item.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...item };
    } else {
      list.unshift(item);
    }
    setLocal(STORAGE_KEYS.GALLERY, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = sanitizeGalleryForSupabase(item);
        const { error } = await supabase.from('gallery').upsert([payload]);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  async deleteGalleryItem(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getGallery().filter(g => g.id !== id);
    setLocal(STORAGE_KEYS.GALLERY, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('gallery').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Services ---
  getServices(): Service[] {
    return getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  },

  async saveService(service: Service): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getServices()];
    const index = list.findIndex(s => s.id === service.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...service };
    } else {
      list.push(service);
    }
    setLocal(STORAGE_KEYS.SERVICES, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('services').upsert([service]);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  async deleteService(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getServices().filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SERVICES, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('services').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Reviews ---
  getReviews(): Review[] {
    return getLocal<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  },

  getApprovedReviews(): Review[] {
    return this.getReviews().filter(r => r.is_approved);
  },

  async submitReview(review: Omit<Review, 'id' | 'is_approved' | 'is_featured' | 'created_at'>): Promise<{ success: boolean; review: Review; error?: string }> {
    const newRev: Review = {
      ...review,
      id: 'rev-' + Date.now(),
      is_approved: false, // Requires admin moderation
      is_featured: false,
      created_at: new Date().toISOString().split('T')[0]
    };
    const list = [...this.getReviews()];
    list.unshift(newRev);
    setLocal(STORAGE_KEYS.REVIEWS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('reviews').insert([{
          ...newRev,
          is_approved: false
        }]);
        if (error) return { success: false, review: newRev, error: error.message };
      } catch (err: any) {
        return { success: false, review: newRev, error: err?.message };
      }
    }
    return { success: true, review: newRev };
  },

  async updateReview(review: Review): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getReviews()];
    const index = list.findIndex(r => r.id === review.id);
    if (index >= 0) {
      list[index] = review;
      setLocal(STORAGE_KEYS.REVIEWS, list);
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('reviews').upsert([review]);
          if (error) return { success: false, error: error.message };
        } catch (err: any) {
          return { success: false, error: err?.message };
        }
      }
    }
    return { success: true };
  },

  async deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getReviews().filter(r => r.id !== id);
    setLocal(STORAGE_KEYS.REVIEWS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('reviews').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Blog ---
  getBlogPosts(): BlogPost[] {
    return getLocal<BlogPost[]>(STORAGE_KEYS.BLOG, initialBlogPosts);
  },

  async saveBlogPost(post: BlogPost): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getBlogPosts()];
    const index = list.findIndex(b => b.id === post.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...post };
    } else {
      list.unshift(post);
    }
    setLocal(STORAGE_KEYS.BLOG, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('blog_posts').upsert([post]);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  async deleteBlogPost(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getBlogPosts().filter(b => b.id !== id);
    setLocal(STORAGE_KEYS.BLOG, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- FAQs ---
  getFAQs(): FAQ[] {
    return getLocal<FAQ[]>(STORAGE_KEYS.FAQS, initialFAQs);
  },

  async saveFAQ(faq: FAQ): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getFAQs()];
    const index = list.findIndex(f => f.id === faq.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...faq };
    } else {
      list.push(faq);
    }
    setLocal(STORAGE_KEYS.FAQS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('faqs').upsert([faq]);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  async deleteFAQ(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getFAQs().filter(f => f.id !== id);
    setLocal(STORAGE_KEYS.FAQS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Videos ---
  getVideos(): VideoItem[] {
    return getLocal<VideoItem[]>(STORAGE_KEYS.VIDEOS, initialVideos);
  },

  saveVideo(video: VideoItem): void {
    const list = [...this.getVideos()];
    const index = list.findIndex(v => v.id === video.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...video };
    } else {
      list.push(video);
    }
    setLocal(STORAGE_KEYS.VIDEOS, list);
  },

  deleteVideo(id: string): void {
    const list = this.getVideos().filter(v => v.id !== id);
    setLocal(STORAGE_KEYS.VIDEOS, list);
  },

  // --- Leads / Inquiries ---
  getLeads(): Lead[] {
    return getLocal<Lead[]>(STORAGE_KEYS.LEADS, [
      {
        id: "lead-1",
        name: "Usman Ghani",
        phone: "+92 300 5544332",
        whatsapp: "+92 300 5544332",
        email: "usman.ghani@example.com",
        interest: "Custom Solid Sheesham Bed Suite",
        message: "Looking for king size solid Sheesham bed with customized floating nightstands for our new home in DHA Phase 2 Islamabad.",
        source_page: "product-detail",
        status: "new",
        created_at: new Date().toISOString()
      },
      {
        id: "lead-2",
        name: "Fatima Noor",
        phone: "+92 333 9876543",
        whatsapp: "+92 333 9876543",
        email: "fatima.noor@example.com",
        interest: "Shamsabad Curved Bouclé Sectional",
        message: "Need quote for 11ft curved sofa in warm ivory bouclé fabric. Can we visit your Shamsabad showroom this Saturday?",
        source_page: "contact",
        status: "contacted",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  },

  async submitLead(lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<{ success: boolean; lead: Lead; error?: string }> {
    const newLead: Lead = {
      ...lead,
      id: 'lead-' + Date.now(),
      status: 'new',
      created_at: new Date().toISOString()
    };
    const list = [...this.getLeads()];
    list.unshift(newLead);
    setLocal(STORAGE_KEYS.LEADS, list);

    if (isSupabaseConfigured && supabase) {
      try {
        // Exclude client-generated text ID so Postgres generates default UUID if column expects uuid
        const { error } = await supabase.from('contact_messages').insert([{
          name: lead.name,
          phone: lead.phone,
          whatsapp: lead.whatsapp || lead.phone,
          email: lead.email || '',
          interest: lead.interest || '',
          message: lead.message,
          source_page: lead.source_page || 'contact',
          status: 'new'
        }]);
        if (error) {
          console.warn('Supabase contact_messages submission error:', error.message);
          return { success: false, lead: newLead, error: error.message };
        }
      } catch (err: any) {
        return { success: false, lead: newLead, error: err?.message };
      }
    }
    return { success: true, lead: newLead };
  },

  async updateLeadStatus(id: string, status: Lead['status']): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getLeads()];
    const index = list.findIndex(l => l.id === id);
    if (index >= 0) {
      list[index].status = status;
      setLocal(STORAGE_KEYS.LEADS, list);
      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('contact_messages').update({ status }).eq('id', id);
          if (error) return { success: false, error: error.message };
        } catch (err: any) {
          return { success: false, error: err?.message };
        }
      }
    }
    return { success: true };
  },

  async deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getLeads().filter(l => l.id !== id);
    setLocal(STORAGE_KEYS.LEADS, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Wishlist ---
  getWishlist(): string[] {
    return getLocal<string[]>(STORAGE_KEYS.WISHLIST, []);
  },

  toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const exists = list.includes(productId);
    const updated = exists ? list.filter(id => id !== productId) : [...list, productId];
    setLocal(STORAGE_KEYS.WISHLIST, updated);
    return !exists;
  },

  isInWishlist(productId: string): boolean {
    return this.getWishlist().includes(productId);
  },

  // --- Media Library ---
  getMedia(): { id: string; name: string; url: string; date: string }[] {
    return getLocal(STORAGE_KEYS.MEDIA, [
      { id: "m1", name: "hero_luxury_living.jpg", url: "/images/hero_luxury_living_1791186963111.jpg", date: "2026-03-20" },
      { id: "m2", name: "cat_living_room.jpg", url: "/images/cat_living_room_1791186977406.jpg", date: "2026-03-20" },
      { id: "m3", name: "cat_bedroom.jpg", url: "/images/cat_bedroom_1791186990246.jpg", date: "2026-03-20" },
      { id: "m4", name: "cat_dining.jpg", url: "/images/cat_dining_1791187001317.jpg", date: "2026-03-20" },
      { id: "m5", name: "cat_custom_chair.jpg", url: "/images/cat_custom_chair_1791187012133.jpg", date: "2026-03-20" }
    ]);
  },

  async addMedia(name: string, url: string): Promise<{ success: boolean; error?: string }> {
    const list = [...this.getMedia()];
    const item = {
      id: 'med-' + Date.now(),
      name,
      url,
      date: new Date().toISOString().split('T')[0]
    };
    list.unshift(item);
    setLocal(STORAGE_KEYS.MEDIA, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('media_items').insert([{
          id: item.id,
          file_name: item.name,
          file_url: item.url,
          file_type: 'image',
          file_size: 0
        }]);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  async deleteMedia(id: string): Promise<{ success: boolean; error?: string }> {
    const list = this.getMedia().filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MEDIA, list);
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('media_items').delete().eq('id', id);
        if (error) return { success: false, error: error.message };
      } catch (err: any) {
        return { success: false, error: err?.message };
      }
    }
    return { success: true };
  },

  // --- Reset All Data Utility ---
  resetToFactoryData(): void {
    Object.values(STORAGE_KEYS).forEach(k => {
      delete memoryCache[k];
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key: 'all' } }));
  },

  // --- Admin Auth & Session Management ---
  isAdminAuthenticated(): boolean {
    const session = getLocal<{ authenticated: boolean; timestamp: number; email?: string } | null>(STORAGE_KEYS.ADMIN_AUTH, null);
    if (!session || !session.authenticated) return false;
    // 14 days session validity
    return Date.now() - session.timestamp < 14 * 24 * 60 * 60 * 1000;
  },

  getAdminSession(): { authenticated: boolean; email: string; timestamp: number; provider: string } {
    const session = getLocal<{ authenticated: boolean; timestamp: number; email?: string; provider?: string } | null>(STORAGE_KEYS.ADMIN_AUTH, null);
    const settings = this.getSettings();
    const isAuth = this.isAdminAuthenticated();
    return {
      authenticated: isAuth,
      email: session?.email || settings.email || 'imranshah1984@gmail.com',
      timestamp: session?.timestamp || Date.now(),
      provider: session?.provider || (isSupabaseConfigured ? 'Supabase Authentication' : 'Local Admin Session')
    };
  },

  async adminLogin(password: string, email?: string): Promise<{ success: boolean; error?: string }> {
    const cleanPass = password.trim();
    if (!cleanPass) {
      return { success: false, error: 'Password cannot be empty.' };
    }

    const adminEmail = email?.trim() || this.getSettings().email || 'imranshah1984@gmail.com';

    // 1. Mandatory Supabase Auth when Supabase is configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: cleanPass
        });
        if (error) {
          return { 
            success: false, 
            error: `Supabase login failed: ${error.message}. Please ensure the user ${adminEmail} is created in Supabase Dashboard → Authentication → Users.` 
          };
        }
        if (data?.user) {
          const userEmail = (data.user.email || adminEmail).toLowerCase();
          
          // Verify role from database-managed admin_users table or auth app_metadata
          const appRole = (data.user.app_metadata?.role as string) || '';
          const isAppAdmin = appRole === 'admin' || appRole === 'super_admin';

          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('role')
            .or(`user_id.eq.${data.user.id},email.eq.${userEmail}`)
            .maybeSingle();

          const activeRole = adminRecord?.role || (isAppAdmin ? appRole : null);

          if (!activeRole || (activeRole !== 'admin' && activeRole !== 'super_admin')) {
            await supabase.auth.signOut();
            return {
              success: false,
              error: `Access Denied: The account "${userEmail}" is authenticated, but is not authorized in the showroom admin allowlist. Please run the migration SQL or contact the showroom owner.`
            };
          }

          // Link user_id if not already mapped
          try {
            await supabase
              .from('admin_users')
              .update({ user_id: data.user.id })
              .eq('email', userEmail);
          } catch {
            // non-fatal
          }

          setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
            authenticated: true, 
            email: userEmail,
            role: activeRole,
            provider: 'Supabase Authentication',
            timestamp: Date.now() 
          });
          // Immediately trigger fresh sync with authenticated credentials
          syncRemoteFromSupabase();
          return { success: true };
        }
      } catch (err: any) {
        return { 
          success: false, 
          error: `Authentication connection error: ${err?.message || 'Check network connection'}` 
        };
      }
    }

    return { 
      success: false, 
      error: 'Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.' 
    };
  },

  async updateAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!this.isAdminAuthenticated()) {
      return { success: false, error: 'You must be authenticated to change password.' };
    }

    const cur = currentPassword.trim();
    const next = newPassword.trim();

    if (!cur) {
      return { success: false, error: 'Please enter your current password.' };
    }
    if (!next || next.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }
    if (cur === next) {
      return { success: false, error: 'New password must be different from current password.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userEmail = sessionData?.session?.user?.email;
        if (userEmail) {
          const { error: verifyErr } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: cur
          });
          if (verifyErr) {
            return { success: false, error: 'Current password is incorrect. Please check and try again.' };
          }

          const { error } = await supabase.auth.updateUser({
            password: next
          });
          if (error) {
            return { success: false, error: error.message };
          }
          return { success: true, message: 'Password updated successfully in Supabase Authentication!' };
        } else {
          // Attempt updateUser directly if session is active
          const { error } = await supabase.auth.updateUser({ password: next });
          if (error) return { success: false, error: error.message };
          return { success: true, message: 'Password updated successfully in Supabase Authentication!' };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update password' };
      }
    }

    return { success: false, error: 'Supabase authentication is not active.' };
  },

  async adminLogout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    delete memoryCache[STORAGE_KEYS.ADMIN_AUTH];
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key: STORAGE_KEYS.ADMIN_AUTH } }));
  }
};
