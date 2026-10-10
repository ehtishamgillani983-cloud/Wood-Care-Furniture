import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Package
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { getCategoryWhatsAppLink, getGeneralWhatsAppLink } from '../utils/whatsapp';

interface FurnitureCatalogPageProps {
  initialCategorySlug?: string;
  initialSubcategoryId?: string;
  onNavigate: (path: string) => void;
  onOpenProduct: (slug: string) => void;
}

export const FurnitureCatalogPage: React.FC<FurnitureCatalogPageProps> = ({
  initialCategorySlug,
  initialSubcategoryId,
  onNavigate,
  onOpenProduct
}) => {
  const { categories, subcategories, products, settings } = useStoreData();

  const selectedCategory = useMemo(() => {
    if (!initialCategorySlug) return null;
    return categories.find(c => c.slug === initialCategorySlug) || null;
  }, [categories, initialCategorySlug]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    selectedCategory ? selectedCategory.id : 'all'
  );
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string>(
    initialSubcategoryId || 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'name_asc'>('featured');
  const [onlyCustomizable, setOnlyCustomizable] = useState(false);

  const currentSubcategories = useMemo(() => {
    if (activeCategoryId === 'all') return [];
    return subcategories.filter(s => s.category_id === activeCategoryId && s.is_active);
  }, [subcategories, activeCategoryId]);

  // Filtered products list (NO PRICING)
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (activeCategoryId !== 'all' && p.category_id !== activeCategoryId) return false;
      if (activeSubcategoryId !== 'all' && p.subcategory_id !== activeSubcategoryId) return false;
      if (onlyCustomizable && !p.customizable) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesMat = p.material.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesMat && !matchesTags) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'newest') return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, activeCategoryId, activeSubcategoryId, onlyCustomizable, searchQuery, sortBy]);

  const currentCatObj = categories.find(c => c.id === activeCategoryId);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#241A14]">
      
      {/* SECTION 1: COMPACT, ELEGANT TOP BANNER (WARM IVORY SOLID TONE) */}
      <section className="bg-[#FAF7F2] border-b border-[#EAE2D5] pt-8 pb-10 sm:pt-10 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-500 mb-5">
            <button 
              onClick={() => onNavigate('/')} 
              className="hover:text-[#8C5D36] transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button 
              onClick={() => {
                setActiveCategoryId('all');
                setActiveSubcategoryId('all');
                onNavigate('/furniture');
              }} 
              className={`hover:text-[#8C5D36] transition-colors ${activeCategoryId === 'all' ? 'font-bold text-[#8C5D36]' : ''}`}
            >
              Furniture Catalog
            </button>
            {currentCatObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-bold text-[#8C5D36]">{currentCatObj.name}</span>
              </>
            )}
          </nav>

          {/* Compact Page Header with clean spacing */}
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F0E8DC] border border-[#DFC06A]/60 text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#8C5D36]">
              <Sparkles className="w-3 h-3 text-[#8C5D36]" />
              <span>HANDCRAFTED TIMBER SHOWROOM</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#241A14] tracking-tight">
              {currentCatObj ? currentCatObj.name : 'Furniture & Living Catalog'}
            </h1>

            <p className="text-xs sm:text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
              {currentCatObj 
                ? currentCatObj.description 
                : 'Explore kiln-seasoned solid hardwood furniture handcrafted in Rawalpindi. Custom dimensions, bespoke upholstery, and direct factory assistance available.'}
            </p>
          </div>

        </div>
      </section>

      {/* SECTION 2: CURATED CATEGORY FILTER BAR & SEARCH (LIGHT BEIGE / NATURAL WOOD TONE) */}
      <section className="bg-[#F2ECE1] border-b border-[#E2D7C4] py-6 sm:py-8 sticky top-20 sm:top-24 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Main Category Filter Tabs - Rounded Pill/Pebble buttons */}
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            <button
              onClick={() => {
                setActiveCategoryId('all');
                setActiveSubcategoryId('all');
              }}
              className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl whitespace-nowrap transition-luxury shadow-xs ${
                activeCategoryId === 'all'
                  ? 'bg-[#241A14] text-[#FAF6F0] shadow-md scale-[1.02]'
                  : 'bg-white text-stone-700 hover:text-[#241A14] hover:bg-[#FAF8F5] border border-[#DDD3C2]'
              }`}
            >
              All Furniture ({products.length})
            </button>

            {categories.filter(c => c.is_active).map(cat => {
              const count = products.filter(p => p.category_id === cat.id).length;
              const isSelected = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setActiveSubcategoryId('all');
                  }}
                  className={`px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl whitespace-nowrap transition-luxury shadow-xs flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#8C5D36] text-white shadow-md scale-[1.02]'
                      : 'bg-white text-stone-700 hover:text-[#241A14] hover:bg-[#FAF8F5] border border-[#DDD3C2]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Subcategory Filter Tabs if present */}
          {currentSubcategories.length > 0 && (
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-1">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-bold shrink-0 mr-1">
                Sub-styles:
              </span>
              <button
                onClick={() => setActiveSubcategoryId('all')}
                className={`px-3.5 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors font-medium ${
                  activeSubcategoryId === 'all'
                    ? 'bg-[#241A14] text-white'
                    : 'bg-white/80 text-stone-700 hover:bg-white border border-[#DDD3C2]'
                }`}
              >
                All {currentCatObj?.name}
              </button>
              {currentSubcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubcategoryId(sub.id)}
                  className={`px-3.5 py-1.5 text-xs rounded-xl whitespace-nowrap transition-colors font-medium ${
                    activeSubcategoryId === sub.id
                      ? 'bg-[#8C5D36] text-white'
                      : 'bg-white/80 text-stone-700 hover:bg-white border border-[#DDD3C2]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Search & Sort Controls Bar */}
          <div className="bg-white border border-[#DDD3C2] p-3.5 sm:p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full md:w-88">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sofas, Sheesham dining, beds, consoles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-[#E5DCD0] rounded-xl text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-[#8C5D36] focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium select-none">
                <input
                  type="checkbox"
                  checked={onlyCustomizable}
                  onChange={(e) => setOnlyCustomizable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#8C5D36] accent-[#8C5D36]"
                />
                <span>Customizable only</span>
              </label>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-[#FAF8F5] border border-[#E5DCD0] rounded-xl text-xs text-stone-700 focus:outline-none focus:border-[#8C5D36]"
                >
                  <option value="featured">Featured First</option>
                  <option value="newest">New Arrivals</option>
                  <option value="name_asc">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3: PRODUCTS GRID (CRISP WARM IVORY SHOWROOM WITH REFINED CARD PRESENTATION) */}
      <section className="bg-[#FAF7F2] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between pb-6 border-b border-[#EAE2D5] mb-8">
            <span className="text-xs sm:text-sm text-stone-600 font-medium">
              Showing <strong className="text-[#241A14]">{filteredProducts.length}</strong> handcrafted piece{filteredProducts.length === 1 ? '' : 's'}
              {currentCatObj && <span> in <strong className="text-[#8C5D36]">{currentCatObj.name}</strong></span>}
            </span>

            {/* Sensible WhatsApp Enquiry Action on top right of catalog */}
            <a
              href={getCategoryWhatsAppLink(
                settings.whatsapp, 
                currentCatObj ? currentCatObj.name : 'All Furniture', 
                settings.brand_name
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C5D36] hover:text-[#5E3C20] transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span className="hidden sm:inline">Ask about custom sizing on WhatsApp</span>
              <span className="sm:hidden">WhatsApp Help</span>
            </a>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E5DCD0] rounded-3xl space-y-4 shadow-sm max-w-xl mx-auto p-8">
              <Package className="w-12 h-12 text-[#8C5D36] mx-auto opacity-70" />
              <h3 className="font-serif text-2xl font-bold text-[#241A14]">No Furniture Matches Found</h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Try resetting your filters or search terms. Our artisans build bespoke pieces from photos and sketches as well.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setActiveCategoryId('all');
                    setActiveSubcategoryId('all');
                    setSearchQuery('');
                    setOnlyCustomizable(false);
                  }}
                  className="px-6 py-2.5 bg-[#8C5D36] hover:bg-[#6D4728] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  Reset All Filters
                </button>
                <a
                  href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Request Custom Piece</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map(prod => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenProduct={onOpenProduct}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* SECTION 4: BESPOKE COMMISSION CALLOUT (SOLID CHARCOAL ACCENT SECTION) */}
      <section className="bg-[#1C140F] py-14 sm:py-20 text-[#FAF6F0] border-t border-[#31231A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs uppercase tracking-[0.26em] text-[#C5A880] font-bold block">
            BESPOKE WOODWORKING
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FAF6F0]">
            Looking for a Specific Dimension or Finish?
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Every dining set, sofa, and bed can be custom-scaled to fit your drawing room, apartment, or master suite. Share any Pinterest photo or blueprint for a direct factory quote.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/custom')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#8C5D36] hover:bg-[#704829] text-white text-xs sm:text-sm font-semibold rounded-2xl transition-luxury shadow-lg"
            >
              How Custom Orders Work →
            </button>
            <a
              href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-2xl transition-luxury flex items-center justify-center gap-2 shadow-lg"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
