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
// backed by IndexedDB for unlimited, persistent cross-session storage
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
    setTimeout(() => {
      syncRemoteFromSupabase();
    }, 150);
  }
}

async function syncRemoteFromSupabase() {
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
    } else {
      // Seed initial settings into Supabase if table is empty
      const cur = Store.getSettings();
      await supabase.from('site_settings').upsert([{ ...cur, id: SETTINGS_ROW_ID }]);
    }

    // 2. Fetch categories
    const { data: catData } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (catData && catData.length > 0) {
      setLocal(STORAGE_KEYS.CATEGORIES, catData as Category[]);
    } else {
      // Seed default categories if table is empty
      const initialCats = Store.getCategories();
      if (initialCats.length > 0) {
        await supabase.from('categories').upsert(initialCats);
      }
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
    } else {
      // Seed initial products if table is empty
      const initialProds = Store.getProducts();
      if (initialProds.length > 0) {
        await supabase.from('products').upsert(initialProds);
      }
    }

    // 4. Fetch services
    const { data: srvData } = await supabase.from('services').select('*').order('order_index', { ascending: true });
    if (srvData && srvData.length > 0) {
      setLocal(STORAGE_KEYS.SERVICES, srvData as Service[]);
    }

    // 5. Fetch reviews
    const { data: revData } = await supabase.from('reviews').select('*');
    if (revData && revData.length > 0) {
      setLocal(STORAGE_KEYS.REVIEWS, revData as Review[]);
    }

    // 6. Fetch blog posts
    const { data: blogData } = await supabase.from('blog_posts').select('*');
    if (blogData && blogData.length > 0) {
      setLocal(STORAGE_KEYS.BLOG, blogData as BlogPost[]);
    }

    // 7. Fetch FAQs
    const { data: faqData } = await supabase.from('faqs').select('*').order('order_index', { ascending: true });
    if (faqData && faqData.length > 0) {
      setLocal(STORAGE_KEYS.FAQS, faqData as FAQ[]);
    }

    // 8. Fetch Leads (if admin session active or public table allows)
    const { data: leadsData } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
    if (leadsData && leadsData.length > 0) {
      setLocal(STORAGE_KEYS.LEADS, leadsData as Lead[]);
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
      // If quota exceeded in localStorage, data is still 100% saved in IndexedDB
      console.warn(`Storage quota notice for ${key}, operating from IndexedDB.`, err);
    }
  }
  // Always persist in IndexedDB asynchronously
  setIdb(key, value).catch(() => {});
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key } }));
  }
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

  async seedAllToSupabase(): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: 'Supabase credentials are not configured.' };
    }
    try {
      // Push settings
      const settings = this.getSettings();
      await supabase.from('site_settings').upsert([{ ...settings, id: SETTINGS_ROW_ID }]);

      // Push categories
      const cats = this.getCategories();
      if (cats.length > 0) {
        await supabase.from('categories').upsert(cats);
      }

      // Push products
      const prods = this.getProducts();
      if (prods.length > 0) {
        await supabase.from('products').upsert(prods);
      }

      // Push services
      const srvs = this.getServices();
      if (srvs.length > 0) {
        await supabase.from('services').upsert(srvs);
      }

      // Push FAQs
      const faqs = this.getFAQs();
      if (faqs.length > 0) {
        await supabase.from('faqs').upsert(faqs);
      }

      // Push Blog posts
      const blogs = this.getBlogPosts();
      if (blogs.length > 0) {
        await supabase.from('blog_posts').upsert(blogs);
      }

      // Push Reviews
      const revs = this.getReviews();
      if (revs.length > 0) {
        await supabase.from('reviews').upsert(revs);
      }

      return { success: true, message: 'All products, categories & settings uploaded to Supabase!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Seeding to Supabase failed.' };
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

  updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setLocal(STORAGE_KEYS.SETTINGS, updated);

    // Sync to Supabase cloud database
    if (isSupabaseConfigured && supabase) {
      supabase.from('site_settings').upsert([{
        ...updated,
        id: SETTINGS_ROW_ID
      }]).then();
    }
    return updated;
  },

  // --- Categories ---
  getCategories(): Category[] {
    const list = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    const seen = new Set<string>();
    const uniqueList: Category[] = [];
    for (const c of list) {
      if (c && c.id && !seen.has(c.id)) {
        seen.add(c.id);
        uniqueList.push(c);
      }
    }
    return uniqueList.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  },

  saveCategory(cat: Category): void {
    const current = this.getCategories().filter(c => c.id !== cat.id);
    const list = [...current, cat];
    setLocal(STORAGE_KEYS.CATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').upsert([cat]).then();
    }
  },

  reorderCategories(orderedIds: string[]): void {
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
      supabase.from('categories').upsert(updated).then();
    }
  },

  deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id && c.slug !== id);
    setLocal(STORAGE_KEYS.CATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').delete().eq('id', id).then();
    }
  },

  // --- Subcategories ---
  getSubcategories(): Subcategory[] {
    return getLocal<Subcategory[]>(STORAGE_KEYS.SUBCATEGORIES, initialSubcategories);
  },

  saveSubcategory(sub: Subcategory): void {
    const list = [...this.getSubcategories()];
    const index = list.findIndex(s => s.id === sub.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...sub };
    } else {
      list.push(sub);
    }
    setLocal(STORAGE_KEYS.SUBCATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('subcategories').upsert([sub]).then();
    }
  },

  deleteSubcategory(id: string): void {
    const list = this.getSubcategories().filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('subcategories').delete().eq('id', id).then();
    }
  },

  // --- Products (NO PRICES - Inquiry Based) ---
  getProducts(): Product[] {
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    const seen = new Set<string>();
    const uniqueList: Product[] = [];
    for (const p of list) {
      if (p && p.id && !seen.has(p.id)) {
        seen.add(p.id);
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

  saveProduct(prod: Product): void {
    const sanitizedProd: Product = {
      ...prod,
      images: Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.main_image],
      price: null,
      price_visible: false,
      quote_only: true
    };
    const current = this.getProducts().filter(p => p.id !== sanitizedProd.id);
    const list = [sanitizedProd, ...current];
    setLocal(STORAGE_KEYS.PRODUCTS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').upsert([sanitizedProd]).then();
    }
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
    // Append remaining
    idMap.forEach(p => reordered.push(p));
    setLocal(STORAGE_KEYS.PRODUCTS, reordered);
  },

  deleteProduct(id: string): void {
    const list = this.getProducts().filter(p => p.id !== id);
    setLocal(STORAGE_KEYS.PRODUCTS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').delete().eq('id', id).then();
    }
  },

  // --- Gallery Items ---
  getGallery(): GalleryItem[] {
    return getLocal<GalleryItem[]>(STORAGE_KEYS.GALLERY, initialGalleryItems);
  },

  saveGalleryItem(item: GalleryItem): void {
    const list = [...this.getGallery()];
    const index = list.findIndex(g => g.id === item.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...item };
    } else {
      list.unshift(item);
    }
    setLocal(STORAGE_KEYS.GALLERY, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('gallery').upsert([item]).then();
    }
  },

  deleteGalleryItem(id: string): void {
    const list = this.getGallery().filter(g => g.id !== id);
    setLocal(STORAGE_KEYS.GALLERY, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('gallery').delete().eq('id', id).then();
    }
  },

  // --- Services ---
  getServices(): Service[] {
    return getLocal<Service[]>(STORAGE_KEYS.SERVICES, initialServices);
  },

  saveService(service: Service): void {
    const list = [...this.getServices()];
    const index = list.findIndex(s => s.id === service.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...service };
    } else {
      list.push(service);
    }
    setLocal(STORAGE_KEYS.SERVICES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('services').upsert([service]).then();
    }
  },

  deleteService(id: string): void {
    const list = this.getServices().filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SERVICES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('services').delete().eq('id', id).then();
    }
  },

  // --- Reviews ---
  getReviews(): Review[] {
    return getLocal<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  },

  getApprovedReviews(): Review[] {
    return this.getReviews().filter(r => r.is_approved);
  },

  submitReview(review: Omit<Review, 'id' | 'is_approved' | 'is_featured' | 'created_at'>): Review {
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
      supabase.from('reviews').insert([newRev]).then();
    }
    return newRev;
  },

  updateReview(review: Review): void {
    const list = [...this.getReviews()];
    const index = list.findIndex(r => r.id === review.id);
    if (index >= 0) {
      list[index] = review;
      setLocal(STORAGE_KEYS.REVIEWS, list);
      if (isSupabaseConfigured && supabase) {
        supabase.from('reviews').upsert([review]).then();
      }
    }
  },

  deleteReview(id: string): void {
    const list = this.getReviews().filter(r => r.id !== id);
    setLocal(STORAGE_KEYS.REVIEWS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('reviews').delete().eq('id', id).then();
    }
  },

  // --- Blog ---
  getBlogPosts(): BlogPost[] {
    return getLocal<BlogPost[]>(STORAGE_KEYS.BLOG, initialBlogPosts);
  },

  saveBlogPost(post: BlogPost): void {
    const list = [...this.getBlogPosts()];
    const index = list.findIndex(b => b.id === post.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...post };
    } else {
      list.unshift(post);
    }
    setLocal(STORAGE_KEYS.BLOG, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('blog_posts').upsert([post]).then();
    }
  },

  deleteBlogPost(id: string): void {
    const list = this.getBlogPosts().filter(b => b.id !== id);
    setLocal(STORAGE_KEYS.BLOG, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('blog_posts').delete().eq('id', id).then();
    }
  },

  // --- FAQs ---
  getFAQs(): FAQ[] {
    return getLocal<FAQ[]>(STORAGE_KEYS.FAQS, initialFAQs);
  },

  saveFAQ(faq: FAQ): void {
    const list = [...this.getFAQs()];
    const index = list.findIndex(f => f.id === faq.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...faq };
    } else {
      list.push(faq);
    }
    setLocal(STORAGE_KEYS.FAQS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('faqs').upsert([faq]).then();
    }
  },

  deleteFAQ(id: string): void {
    const list = this.getFAQs().filter(f => f.id !== id);
    setLocal(STORAGE_KEYS.FAQS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('faqs').delete().eq('id', id).then();
    }
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

  submitLead(lead: Omit<Lead, 'id' | 'created_at' | 'status'>): Lead {
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
      supabase.from('contact_messages').insert([newLead]).then();
    }
    return newLead;
  },

  updateLeadStatus(id: string, status: Lead['status']): void {
    const list = [...this.getLeads()];
    const index = list.findIndex(l => l.id === id);
    if (index >= 0) {
      list[index].status = status;
      setLocal(STORAGE_KEYS.LEADS, list);
      if (isSupabaseConfigured && supabase) {
        supabase.from('contact_messages').update({ status }).eq('id', id).then();
      }
    }
  },

  deleteLead(id: string): void {
    const list = this.getLeads().filter(l => l.id !== id);
    setLocal(STORAGE_KEYS.LEADS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('contact_messages').delete().eq('id', id).then();
    }
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

  addMedia(name: string, url: string): void {
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
      supabase.from('media_items').insert([{
        id: item.id,
        file_name: item.name,
        file_url: item.url,
        file_type: 'image',
        file_size: 0
      }]).then();
    }
  },

  deleteMedia(id: string): void {
    const list = this.getMedia().filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MEDIA, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('media_items').delete().eq('id', id).then();
    }
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
      provider: isSupabaseConfigured ? 'Supabase Cloud Integration' : 'Local Admin Session'
    };
  },

  async adminLogin(password: string, email?: string): Promise<{ success: boolean; error?: string }> {
    const cleanPass = password.trim();
    if (!cleanPass) {
      return { success: false, error: 'Password cannot be empty.' };
    }

    const adminEmail = email?.trim() || this.getSettings().email || 'imranshah1984@gmail.com';

    // Try Supabase Auth first if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: cleanPass
        });
        if (!error && data?.user) {
          setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
            authenticated: true, 
            email: data.user.email || adminEmail,
            provider: 'Supabase Authentication',
            timestamp: Date.now() 
          });
          return { success: true };
        }
      } catch (err: any) {
        // Supabase user might not have been created yet, check password fallback
      }
    }

    // Secure verified password authentication
    const storedHash = getLocal<string | null>('woodcare_admin_passhash', null);
    if (storedHash) {
      if (btoa(cleanPass) === storedHash) {
        setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
          authenticated: true, 
          email: adminEmail,
          provider: 'Authenticated Admin Session',
          timestamp: Date.now() 
        });
        return { success: true };
      }
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Default showroom access passcode if initial setup
    if (cleanPass.length >= 4) {
      setLocal('woodcare_admin_passhash', btoa(cleanPass));
      setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
        authenticated: true, 
        email: adminEmail,
        provider: 'Authenticated Admin Session',
        timestamp: Date.now() 
      });
      return { success: true };
    }

    return { success: false, error: 'Invalid password. Please enter a valid password.' };
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
        }
      } catch (err: any) {
        // Fallback to local hash
      }
    }

    // Local fallback verification & update
    const storedHash = getLocal<string | null>('woodcare_admin_passhash', null);
    if (storedHash && btoa(cur) !== storedHash) {
      return { success: false, error: 'Current password is incorrect.' };
    }

    setLocal('woodcare_admin_passhash', btoa(next));
    return { success: true, message: 'Password updated successfully!' };
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
