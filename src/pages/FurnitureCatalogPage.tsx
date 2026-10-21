import React, { useMemo, useState } from 'react';
import { Package, MessageCircle, Search, SlidersHorizontal, ChevronRight } from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { getCategoryWhatsAppLink } from '../utils/whatsapp';

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
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug || 'all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategoryId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'name'>('featured');

  // Update selectedCategory if URL prop changes
  React.useEffect(() => {
    if (initialCategorySlug) {
      setSelectedCategory(initialCategorySlug);
    }
  }, [initialCategorySlug]);

  // Find targeted category by slug or id
  const currentCategory = useMemo(() => {
    if (selectedCategory === 'all') return null;
    const clean = decodeURIComponent(selectedCategory).trim().toLowerCase();
    return categories.find(c => 
      c.slug.toLowerCase() === clean || 
      c.id.toLowerCase() === clean ||
      c.name.toLowerCase() === clean.replace(/-/g, ' ')
    ) || null;
  }, [categories, selectedCategory]);

  // Available subcategories for selected category
  const relevantSubcategories = useMemo(() => {
    if (!currentCategory) return [];
    return subcategories.filter(s => s.category_id === currentCategory.id && s.is_active !== false);
  }, [subcategories, currentCategory]);

  // Centered category title
  const pageTitle = useMemo(() => {
    if (currentCategory) return currentCategory.name;
    if (selectedCategory && selectedCategory !== 'all') {
      return decodeURIComponent(selectedCategory)
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return 'Full Furniture Collection';
  }, [currentCategory, selectedCategory]);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by category
    if (currentCategory) {
      result = result.filter(p => {
        const catId = (p.category_id || '').toLowerCase();
        return (
          catId === currentCategory.id.toLowerCase() ||
          catId === currentCategory.slug.toLowerCase()
        );
      });
    }

    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      result = result.filter(p => p.subcategory_id === selectedSubcategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.short_description && p.short_description.toLowerCase().includes(q)) ||
        (p.material && p.material.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, currentCategory, selectedSubcategory, searchQuery, sortBy]);

  return (
    <div className="w-full min-h-screen bg-[#FAF8F5] text-[#1A130F]">
      
      {/* Editorial Catalog Header */}
      <section className="bg-[#18110D] text-[#FAF6F0] border-b border-[#302117] pt-14 pb-14 sm:pt-20 sm:pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C5D36]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-xs text-stone-400 pb-2">
            <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-[#DFC06A] font-medium">Furniture Catalog</span>
            {currentCategory && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                <span className="text-white font-medium">{currentCategory.name}</span>
              </>
            )}
          </nav>

          <span className="text-xs uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            SHAMSABAD WORKSHOP DIRECT
          </span>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF6F0]">
            {pageTitle}
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto leading-relaxed font-light">
            {currentCategory?.description || 'Browse our complete catalog of kiln-seasoned Sheesham, Burmese Teak, and bespoke upholstered pieces manufactured direct in Shamsabad, Rawalpindi.'}
          </p>
        </div>
      </section>

      {/* Filter and Search Bar Section */}
      <section className="sticky top-20 sm:top-24 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E7DFD2] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 no-scrollbar">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSubcategory('all');
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-[#1A130F] text-[#FAF6F0] shadow-sm'
                    : 'bg-white border border-[#E7DFD2] text-stone-600 hover:text-[#1A130F] hover:border-[#8C5D36]'
                }`}
              >
                All Collections
              </button>

              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.slug);
                    setSelectedSubcategory('all');
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all duration-300 ${
                    currentCategory?.id === cat.id
                      ? 'bg-[#1A130F] text-[#FAF6F0] shadow-sm'
                      : 'bg-white border border-[#E7DFD2] text-stone-600 hover:text-[#1A130F] hover:border-[#8C5D36]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search pieces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E7DFD2] rounded-full text-xs text-[#1A130F] placeholder-stone-400 focus:outline-none focus:border-[#8C5D36] transition-colors"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-white border border-[#E7DFD2] rounded-full text-xs text-[#1A130F] font-medium focus:outline-none focus:border-[#8C5D36] transition-colors cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="newest">New Arrivals</option>
                <option value="name">Alphabetical</option>
              </select>
            </div>

          </div>

          {/* Subcategory Bar if active category has subcategories */}
          {relevantSubcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar border-t border-[#EFE8DC]">
              <span className="text-[11px] uppercase tracking-wider text-stone-500 font-semibold shrink-0">
                Sub-types:
              </span>
              <button
                onClick={() => setSelectedSubcategory('all')}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  selectedSubcategory === 'all'
                    ? 'font-bold text-[#8C5D36] bg-[#F2ECE1]'
                    : 'text-stone-600 hover:text-[#1A130F]'
                }`}
              >
                All
              </button>
              {relevantSubcategories.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubcategory(sub.id)}
                  className={`text-xs px-3 py-1 rounded-md transition-colors whitespace-nowrap ${
                    selectedSubcategory === sub.id
                      ? 'font-bold text-[#8C5D36] bg-[#F2ECE1]'
                      : 'text-stone-600 hover:text-[#1A130F]'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Main Responsive Products Grid */}
      <section className="py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E7DFD2] rounded-3xl space-y-4 max-w-lg mx-auto p-8 shadow-sm">
              <Package className="w-12 h-12 text-[#8C5D36] mx-auto opacity-70" />
              <h3 className="font-serif text-2xl font-bold text-[#1A130F]">No Matching Pieces Found</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                We manufacture bespoke architectural furniture tailored to your custom specifications, sketches, and room dimensions.
              </p>
              <div className="pt-2">
                <a
                  href={getCategoryWhatsAppLink(settings.whatsapp, pageTitle, settings.brand_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire for Custom {pageTitle} on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenProduct={onOpenProduct}
                />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};
