/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileStickyBar } from './components/MobileStickyBar';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { FurnitureCatalogPage } from './pages/FurnitureCatalogPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { CustomFurniturePage } from './pages/CustomFurniturePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { VideosPage } from './pages/VideosPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPortal } from './admin/AdminPortal';
import { useStoreData } from './hooks/useStore';

export default function App() {
  const { settings, products } = useStoreData();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync route on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState(null, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openProduct = (slug: string) => {
    navigate(`/product/${slug}`);
  };

  const openPost = (slug: string) => {
    navigate(`/blog/${slug}`);
  };

  // Dynamic document title updater for SEO
  useEffect(() => {
    if (currentPath === '/') {
      document.title = `${settings.brand_name} | Premium Furniture Manufacturer Rawalpindi & Islamabad`;
    } else if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      const prod = products.find(p => p.slug === slug || p.id === slug);
      document.title = prod 
        ? `${prod.name} | ${settings.brand_name} Rawalpindi`
        : `Furniture Piece | ${settings.brand_name}`;
    } else if (currentPath.startsWith('/category/')) {
      const catSlug = currentPath.replace('/category/', '');
      const catName = catSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      document.title = `${catName} Furniture | ${settings.brand_name}`;
    } else if (currentPath === '/gallery') {
      document.title = `Showroom Gallery & Completed Spaces | ${settings.brand_name}`;
    } else if (currentPath === '/custom') {
      document.title = `Custom Furniture Manufacturing Rawalpindi & Islamabad | ${settings.brand_name}`;
    } else if (currentPath === '/wishlist') {
      document.title = `Saved Furniture Wishlist | ${settings.brand_name}`;
    } else if (currentPath === '/contact') {
      document.title = `Contact & Showroom Visit Shamsabad | ${settings.brand_name}`;
    } else if (currentPath === '/admin') {
      document.title = `Admin Management Console | ${settings.brand_name}`;
    } else {
      document.title = `${settings.brand_name} | Solid Wood Furniture Rawalpindi`;
    }
  }, [currentPath, settings, products]);

  // If in admin mode, show full admin dashboard
  if (currentPath === '/admin') {
    return <AdminPortal onNavigateHome={() => navigate('/')} />;
  }

  // Parse route parameters
  const renderCurrentView = () => {
    if (currentPath === '/' || currentPath === '') {
      return <HomePage onNavigate={navigate} onOpenProduct={openProduct} />;
    }

    if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      return (
        <ProductDetailPage 
          slug={slug} 
          onNavigate={navigate} 
          onOpenProduct={openProduct} 
        />
      );
    }

    if (currentPath.startsWith('/category/')) {
      const categorySlug = currentPath.replace('/category/', '');
      return (
        <FurnitureCatalogPage 
          initialCategorySlug={categorySlug}
          onNavigate={navigate} 
          onOpenProduct={openProduct} 
        />
      );
    }

    if (currentPath.startsWith('/furniture')) {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryParam = urlParams.get('category') || undefined;
      const subcategoryParam = urlParams.get('subcategory') || undefined;
      return (
        <FurnitureCatalogPage 
          initialCategorySlug={categoryParam}
          initialSubcategoryId={subcategoryParam}
          onNavigate={navigate} 
          onOpenProduct={openProduct} 
        />
      );
    }

    if (currentPath === '/gallery') {
      return <GalleryPage onNavigate={navigate} />;
    }

    if (currentPath === '/custom') {
      return <CustomFurniturePage onNavigate={navigate} />;
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (currentPath === '/services') {
      return <ServicesPage onNavigate={navigate} />;
    }

    if (currentPath === '/videos' || currentPath === '/inspiration') {
      return <VideosPage onNavigate={navigate} />;
    }

    if (currentPath === '/reviews') {
      return <ReviewsPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      return (
        <BlogPostPage 
          slug={slug} 
          onNavigate={navigate} 
          onOpenPost={openPost} 
        />
      );
    }

    if (currentPath === '/blog') {
      return <BlogPage onNavigate={navigate} onOpenPost={openPost} />;
    }

    if (currentPath === '/faq') {
      return <FAQPage onNavigate={navigate} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage onNavigate={navigate} />;
    }

    if (currentPath === '/wishlist') {
      return <WishlistPage onNavigate={navigate} onOpenProduct={openProduct} />;
    }

    // Default Fallback
    return <HomePage onNavigate={navigate} onOpenProduct={openProduct} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#2D241E]">
      {/* Sticky Header with Navigation & Dropdown */}
      <Header 
        currentPath={currentPath} 
        onNavigate={navigate} 
        onOpenSearch={() => setIsSearchOpen(true)} 
      />

      {/* Main Content View */}
      <main className="flex-1 pb-16 md:pb-0">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigate} />

      {/* Mobile Sticky Bar (respects <= 15% mobile sticky limit) */}
      <MobileStickyBar />

      {/* Global Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onNavigate={navigate} 
      />
    </div>
  );
}
