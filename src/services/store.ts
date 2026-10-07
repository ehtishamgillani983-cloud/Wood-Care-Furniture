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
  MEDIA: 'woodcare_media'
};

// In-memory runtime cache to guarantee that data updates and persists across UI actions
// even if localStorage quota is tight or disabled in certain sandbox environments
const memoryCache: Record<string, unknown> = {};

function getLocal<T>(key: string, fallback: T): T {
  if (memoryCache[key] !== undefined) {
    return memoryCache[key] as T;
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
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // If quota exceeded, data is still safe in memoryCache
    console.warn(`Storage quota notice for ${key}, operating from runtime memory cache.`, err);
  }
  window.dispatchEvent(new CustomEvent('woodcare_store_updated', { detail: { key } }));
}

export const Store = {
  // --- Settings ---
  getSettings(): SiteSettings {
    const loaded = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, initialSettings);
    const merged: SiteSettings = {
      ...initialSettings,
      ...loaded,
      hero_images: loaded.hero_images && loaded.hero_images.length > 0 ? loaded.hero_images : initialSettings.hero_images,
      brand_name: loaded.brand_name || 'Wood Care Furniture',
      logo_url: loaded.logo_url || '/wood_care_logo.svg',
      favicon_url: loaded.favicon_url || '/wood_care_logo.svg'
    };
    return merged;
  },

  updateSettings(settings: Partial<SiteSettings>): SiteSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setLocal(STORAGE_KEYS.SETTINGS, updated);

    // Sync to Supabase if available
    if (isSupabaseConfigured && supabase) {
      supabase.from('site_settings').upsert([updated]).then();
    }
    return updated;
  },

  // --- Categories ---
  getCategories(): Category[] {
    return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  },

  saveCategory(cat: Category): void {
    const list = [...this.getCategories()];
    const index = list.findIndex(c => c.id === cat.id);
    if (index >= 0) {
      list[index] = { ...list[index], ...cat };
    } else {
      list.push(cat);
    }
    setLocal(STORAGE_KEYS.CATEGORIES, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('categories').upsert([cat]).then();
    }
  },

  deleteCategory(id: string): void {
    const list = this.getCategories().filter(c => c.id !== id);
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
  },

  deleteSubcategory(id: string): void {
    const list = this.getSubcategories().filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SUBCATEGORIES, list);
  },

  // --- Products (NO PRICES - Inquiry Based) ---
  getProducts(): Product[] {
    const list = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    // Guarantee no price is ever displayed
    return list.map(p => ({
      ...p,
      price: null,
      price_visible: false,
      quote_only: true
    }));
  },

  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug || p.id === slug);
  },

  saveProduct(prod: Product): void {
    const sanitizedProd: Product = {
      ...prod,
      price: null,
      price_visible: false,
      quote_only: true
    };
    const list = [...this.getProducts()];
    const index = list.findIndex(p => p.id === sanitizedProd.id);
    if (index >= 0) {
      list[index] = sanitizedProd;
    } else {
      list.unshift(sanitizedProd);
    }
    setLocal(STORAGE_KEYS.PRODUCTS, list);
    if (isSupabaseConfigured && supabase) {
      supabase.from('products').upsert([sanitizedProd]).then();
    }
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
  },

  deleteService(id: string): void {
    const list = this.getServices().filter(s => s.id !== id);
    setLocal(STORAGE_KEYS.SERVICES, list);
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
    return newRev;
  },

  updateReview(review: Review): void {
    const list = [...this.getReviews()];
    const index = list.findIndex(r => r.id === review.id);
    if (index >= 0) {
      list[index] = review;
      setLocal(STORAGE_KEYS.REVIEWS, list);
    }
  },

  deleteReview(id: string): void {
    const list = this.getReviews().filter(r => r.id !== id);
    setLocal(STORAGE_KEYS.REVIEWS, list);
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
  },

  deleteBlogPost(id: string): void {
    const list = this.getBlogPosts().filter(b => b.id !== id);
    setLocal(STORAGE_KEYS.BLOG, list);
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
  },

  deleteFAQ(id: string): void {
    const list = this.getFAQs().filter(f => f.id !== id);
    setLocal(STORAGE_KEYS.FAQS, list);
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
    }
  },

  deleteLead(id: string): void {
    const list = this.getLeads().filter(l => l.id !== id);
    setLocal(STORAGE_KEYS.LEADS, list);
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
    list.unshift({
      id: 'med-' + Date.now(),
      name,
      url,
      date: new Date().toISOString().split('T')[0]
    });
    setLocal(STORAGE_KEYS.MEDIA, list);
  },

  deleteMedia(id: string): void {
    const list = this.getMedia().filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MEDIA, list);
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
      email: session?.email || settings.email || 'admin@woodgearfurniture.pk',
      timestamp: session?.timestamp || Date.now(),
      provider: isSupabaseConfigured ? 'Supabase Authentication' : 'Local Admin Session'
    };
  },

  async adminLogin(password: string, email?: string): Promise<{ success: boolean; error?: string }> {
    const cleanPass = password.trim();
    if (!cleanPass) {
      return { success: false, error: 'Password cannot be empty.' };
    }

    const adminEmail = email?.trim() || this.getSettings().email || 'admin@woodgearfurniture.pk';

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: cleanPass
        });
        if (error) {
          return { success: false, error: error.message };
        }
        setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
          authenticated: true, 
          email: data.user?.email || adminEmail,
          provider: 'Supabase Authentication',
          timestamp: Date.now() 
        });
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Authentication failed' };
      }
    }

    // Secure fallback when Supabase keys are pending in environment
    const storedHash = getLocal<string | null>('woodcare_admin_passhash', null);
    if (storedHash) {
      if (btoa(cleanPass) === storedHash) {
        setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
          authenticated: true, 
          email: adminEmail,
          provider: 'Local Admin Session',
          timestamp: Date.now() 
        });
        return { success: true };
      }
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Initial setup if no password set yet
    if (cleanPass.length >= 6) {
      setLocal('woodcare_admin_passhash', btoa(cleanPass));
      setLocal(STORAGE_KEYS.ADMIN_AUTH, { 
        authenticated: true, 
        email: adminEmail,
        provider: 'Local Admin Session',
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
          // Verify current password first
          const { error: verifyErr } = await supabase.auth.signInWithPassword({
            email: userEmail,
            password: cur
          });
          if (verifyErr) {
            return { success: false, error: 'Current password is incorrect. Please check and try again.' };
          }
        }

        // Update user password via Supabase Auth
        const { error } = await supabase.auth.updateUser({
          password: next
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, message: 'Password updated successfully in Supabase Authentication!' };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Failed to update password with Supabase' };
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
