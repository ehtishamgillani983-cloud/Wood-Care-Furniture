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
import { updatePageMeta } from './utils/seo';

export default function App() {
  const { settings, products, blogPosts, categories } = useStoreData();
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

  // Dynamic document title, meta description, canonical URL & robots updater for SEO
  useEffect(() => {
    const brand = settings.brand_name || 'Wood Care Furniture';

    if (currentPath === '/admin') {
      updatePageMeta({
        title: `Admin Management Console | ${brand}`,
        description: 'Secure administrative management portal for inventory, catalog, and inquiries.',
        canonicalPath: '/admin',
        isPrivate: true
      });
      return;
    }

    if (currentPath === '/' || currentPath === '') {
      updatePageMeta({
        title: `${brand} | Premium Furniture Manufacturer Rawalpindi & Islamabad`,
        description: settings.seo_description || 'Premier furniture manufacturer and wholesaler in Rawalpindi & Islamabad. Specializing in bespoke sofas, solid wood beds, luxury dining tables, and custom architectural woodwork.',
        canonicalPath: '/'
      });
    } else if (currentPath.startsWith('/product/')) {
      const slug = currentPath.replace('/product/', '');
      const prod = products.find(p => p.slug === slug || p.id === slug);
      if (prod) {
        updatePageMeta({
          title: prod.seo_title || `${prod.name} | ${brand} Rawalpindi`,
          description: prod.seo_description || prod.short_description || `Handcrafted ${prod.name} manufactured from seasoned timber in Shamsabad, Rawalpindi. Inquire on WhatsApp for custom sizing.`,
          canonicalPath: `/product/${prod.slug}`
        });
      } else {
        updatePageMeta({
          title: `Handcrafted Furniture Piece | ${brand}`,
          description: `Custom handcrafted solid wood furniture piece from ${brand} workshop in Rawalpindi.`,
          canonicalPath: `/product/${slug}`
        });
      }
    } else if (currentPath.startsWith('/category/')) {
      const catSlug = currentPath.replace('/category/', '');
      const cat = categories.find(c => c.slug === catSlug || c.id === catSlug);
      const catName = cat ? cat.name : catSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      updatePageMeta({
        title: cat?.seo_title || `${catName} Furniture Rawalpindi & Islamabad | ${brand}`,
        description: cat?.seo_description || `Explore handcrafted ${catName} furniture in Rawalpindi & Islamabad. Kiln-seasoned hardwood joinery, termite-proof guarantee, and bespoke sizing.`,
        canonicalPath: `/category/${catSlug}`
      });
    } else if (currentPath === '/furniture' || currentPath === '/products') {
      updatePageMeta({
        title: `Furniture & Products Catalog | Handcrafted Solid Wood Rawalpindi | ${brand}`,
        description: 'Browse our full furniture catalog in Rawalpindi. Solid Sheesham beds, luxury curved sofas, dining tables, and executive office furniture manufactured direct.',
        canonicalPath: '/furniture'
      });
    } else if (currentPath === '/gallery') {
      updatePageMeta({
        title: `Completed Spaces Gallery & Showroom Portfolio | ${brand}`,
        description: 'Browse real photographs of bespoke furniture manufactured in our Shamsabad workshop and installed across Rawalpindi and Islamabad luxury residences.',
        canonicalPath: '/gallery'
      });
    } else if (currentPath === '/custom') {
      updatePageMeta({
        title: `Custom Furniture Manufacturing Rawalpindi & Islamabad | ${brand}`,
        description: 'Order bespoke custom furniture manufactured direct in our Shamsabad workshop. Bring your dimensions, Pinterest mood boards, or sketches for consultation.',
        canonicalPath: '/custom'
      });
    } else if (currentPath === '/services') {
      updatePageMeta({
        title: `Workshop Direct Furniture Services & Commercial Wholesale | ${brand}`,
        description: 'Bespoke residential furniture manufacturing, commercial wholesale supply, custom upholstery, and architectural woodwork across Rawalpindi & Islamabad.',
        canonicalPath: '/services'
      });
    } else if (currentPath === '/about') {
      updatePageMeta({
        title: `About Our Shamsabad Workshop & Artisanal Heritage | ${brand}`,
        description: 'Discover Wood Care Furniture generational woodworking craftsmanship in Shamsabad, Rawalpindi. Kiln-seasoned hardwood joinery, termite-proofing, and direct workshop prices.',
        canonicalPath: '/about'
      });
    } else if (currentPath === '/reviews') {
      updatePageMeta({
        title: `Customer Reviews & Client Testimonials | ${brand} Rawalpindi`,
        description: 'Read verified testimonials and reviews from clients across Rawalpindi and Islamabad about our custom sofas, solid wood beds, and dining suites.',
        canonicalPath: '/reviews'
      });
    } else if (currentPath.startsWith('/blog/')) {
      const slug = currentPath.replace('/blog/', '');
      const post = blogPosts.find(b => b.slug === slug || b.id === slug);
      if (post) {
        updatePageMeta({
          title: `${post.title} | ${brand} Rawalpindi`,
          description: post.excerpt || `Read our woodworking guide on ${post.title} by ${brand} master craftsmen in Rawalpindi.`,
          canonicalPath: `/blog/${post.slug}`
        });
      } else {
        updatePageMeta({
          title: `Woodworking Guide | ${brand}`,
          description: `Woodworking guides and furniture care tips from ${brand} workshop in Rawalpindi.`,
          canonicalPath: `/blog/${slug}`
        });
      }
    } else if (currentPath === '/blog') {
      updatePageMeta({
        title: `Woodworking Guides & Furniture Care Journal | ${brand}`,
        description: 'Expert recommendations on seasoned Sheesham wood, Burmese Teak, sofa ergonomics, fabric choices, and preserving fine furniture in Rawalpindi & Islamabad.',
        canonicalPath: '/blog'
      });
    } else if (currentPath === '/faq') {
      updatePageMeta({
        title: `Frequently Asked Questions | Custom Furniture Rawalpindi | ${brand}`,
        description: 'Clear answers regarding solid timber seasoning, bespoke manufacturing, delivery across the Twin Cities, and showroom visits in Shamsabad.',
        canonicalPath: '/faq'
      });
    } else if (currentPath === '/videos') {
      updatePageMeta({
        title: `Workshop Craftsmanship Videos & Showroom Reels | ${brand}`,
        description: 'Watch our artisans at work in Shamsabad, Rawalpindi. Inspect the solid wood joinery, high-density foam layering, and finished pieces.',
        canonicalPath: '/videos'
      });
    } else if (currentPath === '/wishlist') {
      updatePageMeta({
        title: `Saved Furniture Wishlist | ${brand}`,
        description: 'Review your saved handcrafted furniture collection and request combined WhatsApp quotations for bespoke home suites.',
        canonicalPath: '/wishlist'
      });
    } else if (currentPath === '/contact') {
      updatePageMeta({
        title: `Contact & Showroom Visit Shamsabad | ${brand} Rawalpindi`,
        description: 'Visit our workshop and showroom at M33J+C6H, Shamsabad, Rawalpindi. Call +92 332 5099930 or WhatsApp directly for factory-direct consultations.',
        canonicalPath: '/contact'
      });
    } else {
      updatePageMeta({
        title: `${brand} | Solid Wood Furniture Rawalpindi`,
        description: 'Premium handcrafted furniture for homes, offices and commercial spaces across Rawalpindi and Islamabad.',
        canonicalPath: currentPath
      });
    }
  }, [currentPath, settings, products, blogPosts, categories]);

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

    if (currentPath.startsWith('/furniture') || currentPath.startsWith('/products')) {
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
