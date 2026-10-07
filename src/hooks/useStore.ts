import { useState, useEffect, useCallback } from 'react';
import { Store } from '../services/store';
import { SiteSettings } from '../types';

export function useStoreData() {
  const [version, setVersion] = useState(0);

  const refresh = useCallback(() => {
    setVersion(v => v + 1);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setVersion(v => v + 1);
    };
    window.addEventListener('woodcare_store_updated', handleUpdate);
    return () => window.removeEventListener('woodcare_store_updated', handleUpdate);
  }, []);

  return {
    version,
    refresh,
    settings: Store.getSettings(),
    categories: Store.getCategories(),
    subcategories: Store.getSubcategories(),
    products: Store.getProducts(),
    gallery: Store.getGallery(),
    services: Store.getServices(),
    reviews: Store.getReviews(),
    approvedReviews: Store.getApprovedReviews(),
    blogPosts: Store.getBlogPosts(),
    faqs: Store.getFAQs(),
    videos: Store.getVideos(),
    leads: Store.getLeads(),
    wishlist: Store.getWishlist(),
    media: Store.getMedia(),
    isAdmin: Store.isAdminAuthenticated()
  };
}

export function useSettings(): [SiteSettings, (newSettings: Partial<SiteSettings>) => void] {
  const [settings, setSettings] = useState<SiteSettings>(Store.getSettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(Store.getSettings());
    };
    window.addEventListener('woodcare_store_updated', handleUpdate);
    return () => window.removeEventListener('woodcare_store_updated', handleUpdate);
  }, []);

  const update = (newSettings: Partial<SiteSettings>) => {
    const updated = Store.updateSettings(newSettings);
    setSettings(updated);
  };

  return [settings, update];
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>(Store.getWishlist());

  useEffect(() => {
    const handleUpdate = () => {
      setWishlist(Store.getWishlist());
    };
    window.addEventListener('woodcare_store_updated', handleUpdate);
    return () => window.removeEventListener('woodcare_store_updated', handleUpdate);
  }, []);

  const toggle = (productId: string) => {
    Store.toggleWishlist(productId);
    setWishlist(Store.getWishlist());
  };

  const isSaved = (productId: string) => wishlist.includes(productId);

  return { wishlist, toggle, isSaved, count: wishlist.length };
}
