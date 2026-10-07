import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Heart, 
  Search, 
  MessageCircle, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useStoreData, useWishlist } from '../hooks/useStore';
import { resolveSafeImageUrl } from '../components/SafeImage';
import { getGeneralWhatsAppLink } from '../utils/whatsapp';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentPath, 
  onNavigate, 
  onOpenSearch 
}) => {
  const { settings, categories, subcategories } = useStoreData();
  const { count: wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [furnitureMenuOpen, setFurnitureMenuOpen] = useState(false);
  const [mobileFurnitureExpanded, setMobileFurnitureExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateTo = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setFurnitureMenuOpen(false);
  };

  const activeCategories = categories.filter(c => c.is_active !== false);

  // Nav link helper
  const isNavActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const logoSrc = resolveSafeImageUrl(settings.logo_url) || '/wood_care_logo.svg';

  return (
    <header 
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-md border-b border-[#EAE3D6]' 
          : 'bg-[#FAF7F2] border-b border-[#EDE6DC]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
        
        {/* Zone 1: Redesigned Dominant Logo + Compact Stacked Brand Name */}
        <div className="flex items-center">
          <button 
            onClick={() => navigateTo('/')}
            className="text-left group flex items-center gap-3 sm:gap-3.5 focus:outline-none transition-transform duration-200 hover:scale-[1.01]"
            aria-label="Wood Care Furniture Home"
          >
            {/* Prominent Logo: Anchors Header Visual Identity */}
            <div className="relative shrink-0">
              <img 
                src={logoSrc} 
                alt={settings.brand_name || 'Wood Care Furniture'} 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/wood_care_logo.svg';
                }}
                className="h-12 w-12 sm:h-15 sm:w-15 md:h-16 md:w-16 object-contain rounded-full border border-[#D5C9B8] shadow-sm group-hover:border-[#8C5D36] transition-colors bg-white/50"
              />
            </div>

            {/* Compact Stacked Brand Name: Secondary to the logo */}
            <div className="flex flex-col justify-center">
              <span className="font-serif text-lg sm:text-xl md:text-2xl font-bold tracking-[0.14em] text-[#241A14] uppercase leading-none group-hover:text-[#8C5D36] transition-colors">
                WOODCARE
              </span>
              <span className="text-[10px] sm:text-[11px] font-sans font-semibold tracking-[0.26em] text-[#8C5D36] uppercase mt-1 leading-none">
                FURNITURE
              </span>
              <span className="text-[9px] text-stone-500 tracking-wider hidden sm:block mt-0.5">
                Rawalpindi · Islamabad
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Main Desktop Navigation (Slightly larger, elegant typography) */}
        <nav className="hidden lg:flex items-center gap-7 xl:gap-9 text-[15px] sm:text-base font-medium text-[#2C2118]">
          <button 
            onClick={() => navigateTo('/')} 
            className={`relative py-2 transition-colors hover:text-[#8C5D36] ${
              isNavActive('/') ? 'text-[#8C5D36] font-semibold' : ''
            }`}
          >
            <span>Home</span>
            {isNavActive('/') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8C5D36] rounded-full" />
            )}
          </button>

          {/* Furniture Mega Menu Dropdown */}
          <div 
            className="relative" 
            ref={dropdownRef}
            onMouseEnter={() => setFurnitureMenuOpen(true)}
            onMouseLeave={() => setFurnitureMenuOpen(false)}
          >
            <button 
              onClick={() => navigateTo('/furniture')}
              className={`relative flex items-center gap-1.5 py-2 transition-colors hover:text-[#8C5D36] ${
                isNavActive('/furniture') || isNavActive('/category') ? 'text-[#8C5D36] font-semibold' : ''
              }`}
            >
              <span>Products</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${furnitureMenuOpen ? 'rotate-180 text-[#8C5D36]' : 'text-stone-500'}`} />
              {(isNavActive('/furniture') || isNavActive('/category')) && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8C5D36] rounded-full" />
              )}
            </button>

            {/* Mega Dropdown Panel */}
            {furnitureMenuOpen && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-[860px] bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#EAE3D6] p-7 grid grid-cols-4 gap-7 animate-in fade-in slide-in-from-top-2 duration-200 z-50 text-[#2C2118]"
              >
                <div className="col-span-3 grid grid-cols-3 gap-6">
                  {activeCategories.slice(0, 6).map((cat) => {
                    const catSubs = subcategories.filter(s => s.category_id === cat.id && s.is_active !== false);
                    return (
                      <div key={cat.id} className="space-y-2">
                        <button 
                          onClick={() => navigateTo(`/category/${cat.slug}`)}
                          className="text-left font-serif text-base font-bold text-[#241A14] hover:text-[#8C5D36] transition-colors flex items-center gap-1 group"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[#8C5D36] opacity-0 group-hover:opacity-100 transition-opacity text-xs">→</span>
                        </button>
                        
                        <div className="space-y-1 pl-1">
                          {catSubs.slice(0, 3).map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => navigateTo(`/furniture?sub=${sub.id}`)}
                              className="text-xs text-stone-600 hover:text-[#8C5D36] block transition-colors text-left"
                            >
                              {sub.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Promo Box */}
                <div className="col-span-1 bg-[#F3ECE1] border border-[#E2D8C9] p-5 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#8C5D36] font-bold">
                      Direct Workshop
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#241A14]">
                      Bespoke Woodworking
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Custom dimensions and timber choices crafted at Shamsabad.
                    </p>
                  </div>
                  <button 
                    onClick={() => navigateTo('/custom')}
                    className="mt-4 text-xs font-semibold text-[#8C5D36] hover:text-[#5F3E22] flex items-center gap-1 transition-colors"
                  >
                    <span>Custom Inquiries</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigateTo('/gallery')} 
            className={`relative py-2 transition-colors hover:text-[#8C5D36] ${
              isNavActive('/gallery') ? 'text-[#8C5D36] font-semibold' : ''
            }`}
          >
            <span>Gallery</span>
            {isNavActive('/gallery') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8C5D36] rounded-full" />
            )}
          </button>

          <button 
            onClick={() => navigateTo('/about')} 
            className={`relative py-2 transition-colors hover:text-[#8C5D36] ${
              isNavActive('/about') ? 'text-[#8C5D36] font-semibold' : ''
            }`}
          >
            <span>About Us</span>
            {isNavActive('/about') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8C5D36] rounded-full" />
            )}
          </button>

          <button 
            onClick={() => navigateTo('/services')} 
            className={`relative py-2 transition-colors hover:text-[#8C5D36] ${
              isNavActive('/services') ? 'text-[#8C5D36] font-semibold' : ''
            }`}
          >
            <span>Services</span>
            {isNavActive('/services') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8C5D36] rounded-full" />
            )}
          </button>

          <button 
            onClick={() => navigateTo('/contact')} 
            className={`relative py-2 transition-colors hover:text-[#8C5D36] ${
              isNavActive('/contact') ? 'text-[#8C5D36] font-semibold' : ''
            }`}
          >
            <span>Contact</span>
            {isNavActive('/contact') && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8C5D36] rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions (Search, Wishlist, WhatsApp CTA, Mobile Menu) */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            className="p-2 sm:p-2.5 rounded-xl text-[#2C2118] hover:text-[#8C5D36] hover:bg-[#F3ECE1] transition-colors"
            title="Search furniture pieces"
            aria-label="Search furniture"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            onClick={() => navigateTo('/wishlist')}
            className="p-2 sm:p-2.5 rounded-xl text-[#2C2118] hover:text-[#8C5D36] hover:bg-[#F3ECE1] transition-colors relative"
            title="View saved items"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#8C5D36] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Direct WhatsApp CTA Button (Desktop) */}
          <a
            href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-luxury shadow-sm hover:shadow-md hover:scale-[1.02]"
            title="Enquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enquire on WhatsApp</span>
          </a>

          {/* Mobile Hamburger Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#2C2118] lg:hidden hover:bg-[#F3ECE1] rounded-xl transition-colors border border-[#E5DDD0] ml-1"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Accordion Navigation matching warm ivory aesthetic) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 sm:top-24 z-30 lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] w-full max-h-[calc(100vh-5rem)] overflow-y-auto border-b border-[#EAE3D6] p-6 shadow-2xl text-[#2C2118]">
            <div className="space-y-3">
              
              <button 
                onClick={() => navigateTo('/')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                Home
              </button>

              {/* Products Accordion */}
              <div className="border-b border-[#EDE6DC] pb-2">
                <button 
                  onClick={() => setMobileFurnitureExpanded(!mobileFurnitureExpanded)}
                  className="w-full flex items-center justify-between text-left font-serif text-lg font-bold text-[#241A14] py-2.5"
                >
                  <span>Products</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobileFurnitureExpanded ? 'rotate-180 text-[#8C5D36]' : 'text-stone-500'}`} />
                </button>

                {mobileFurnitureExpanded && (
                  <div className="pl-3 py-2 space-y-2.5 bg-[#F3ECE1] rounded-2xl my-2 border border-[#E2D8C9] p-4">
                    <button 
                      onClick={() => navigateTo('/furniture')}
                      className="text-xs font-bold text-[#8C5D36] uppercase tracking-wider block"
                    >
                      View All Collections →
                    </button>
                    {activeCategories.map(cat => (
                      <div key={cat.id} className="space-y-1">
                        <button 
                          onClick={() => navigateTo(`/category/${cat.slug}`)}
                          className="text-sm font-semibold text-[#241A14] block text-left"
                        >
                          {cat.name}
                        </button>
                        <div className="pl-2 space-y-1">
                          {subcategories
                            .filter(s => s.category_id === cat.id && s.is_active !== false)
                            .map(sub => (
                              <button 
                                key={sub.id}
                                onClick={() => navigateTo(`/furniture?sub=${sub.id}`)}
                                className="text-xs text-stone-600 block text-left"
                              >
                                {sub.name}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigateTo('/gallery')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                Spaces Gallery
              </button>

              <button 
                onClick={() => navigateTo('/about')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                About Us
              </button>

              <button 
                onClick={() => navigateTo('/services')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                Our Services
              </button>

              <button 
                onClick={() => navigateTo('/custom')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                Custom Furniture
              </button>

              <button 
                onClick={() => navigateTo('/blog')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                Guides & Articles
              </button>

              <button 
                onClick={() => navigateTo('/faqs')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                FAQs
              </button>

              <button 
                onClick={() => navigateTo('/contact')}
                className="w-full text-left font-serif text-lg font-bold text-[#241A14] py-2.5 border-b border-[#EDE6DC]"
              >
                Contact & Showroom
              </button>

              {/* Mobile WhatsApp Button */}
              <div className="pt-3">
                <a
                  href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 bg-[#25D366] text-black text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire on WhatsApp Directly</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
