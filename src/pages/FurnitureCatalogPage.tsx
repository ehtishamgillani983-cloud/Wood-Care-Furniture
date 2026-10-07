import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronRight, 
  MessageCircle, 
  SlidersHorizontal 
} from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 bg-[#1A130F] text-[#FAF6F0]">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-[#FAF6F0] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <button 
          onClick={() => {
            setActiveCategoryId('all');
            setActiveSubcategoryId('all');
            onNavigate('/furniture');
          }} 
          className={`hover:text-[#FAF6F0] transition-colors ${activeCategoryId === 'all' ? 'font-semibold text-[#C5A880]' : ''}`}
        >
          Furniture
        </button>
        {currentCatObj && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-[#C5A880]">{currentCatObj.name}</span>
          </>
        )}
      </nav>

      {/* Page Header - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          HANDCRAFTED CATALOG
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          {currentCatObj ? currentCatObj.name : 'All Furniture Collections'}
        </h1>
        <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
          {currentCatObj ? currentCatObj.description : 'Explore seasoned solid wood furniture crafted in Rawalpindi. Enquire on WhatsApp for custom dimensions, fabric choices, and direct factory assistance.'}
        </p>

        {/* Category Context WhatsApp Inquiry */}
        <div className="pt-2">
          <a
            href={getCategoryWhatsAppLink(
              settings.whatsapp, 
              currentCatObj ? currentCatObj.name : 'All Collections', 
              settings.brand_name
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-luxury shadow-lg"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>Enquire About {currentCatObj ? currentCatObj.name : 'Furniture'} on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Main Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 no-scrollbar border-b border-[#443227]">
        <button
          onClick={() => {
            setActiveCategoryId('all');
            setActiveSubcategoryId('all');
          }}
          className={`px-5 py-2.5 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-luxury ${
            activeCategoryId === 'all'
              ? 'bg-[#768A7D] text-white shadow-md font-semibold'
              : 'bg-[#241A14] text-stone-300 hover:text-white hover:bg-[#2E211A] border border-[#443227]'
          }`}
        >
          All Collections ({products.length})
        </button>

        {categories.filter(c => c.is_active).map(cat => {
          const count = products.filter(p => p.category_id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategoryId(cat.id);
                setActiveSubcategoryId('all');
              }}
              className={`px-5 py-2.5 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-luxury ${
                activeCategoryId === cat.id
                  ? 'bg-[#768A7D] text-white shadow-md font-semibold'
                  : 'bg-[#241A14] text-stone-300 hover:text-white hover:bg-[#2E211A] border border-[#443227]'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Subcategory Filter Tabs */}
      {currentSubcategories.length > 0 && (
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs uppercase tracking-wider text-stone-400 font-bold shrink-0 mr-1.5">
            Subcategories:
          </span>
          <button
            onClick={() => setActiveSubcategoryId('all')}
            className={`px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
              activeSubcategoryId === 'all'
                ? 'bg-[#C5A880] text-[#1A130F] font-bold'
                : 'bg-[#241A14] text-stone-300 hover:text-white border border-[#443227]'
            }`}
          >
            All
          </button>
          {currentSubcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubcategoryId(sub.id)}
              className={`px-3.5 py-1.5 text-xs rounded-lg whitespace-nowrap transition-colors ${
                activeSubcategoryId === sub.id
                  ? 'bg-[#C5A880] text-[#1A130F] font-bold'
                  : 'bg-[#241A14] text-stone-300 hover:text-white border border-[#443227]'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Search & Sort Bar */}
      <div className="bg-[#241A14] border border-[#443227] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by furniture name, Sheesham, walnut..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1A130F] border border-[#443227] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#768A7D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
            <input
              type="checkbox"
              checked={onlyCustomizable}
              onChange={(e) => setOnlyCustomizable(e.target.checked)}
              className="w-4 h-4 rounded text-[#768A7D]"
            />
            <span>Customizable only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-[#1A130F] border border-[#443227] rounded-xl text-xs text-stone-200 focus:outline-none focus:border-[#768A7D]"
          >
            <option value="featured">Featured First</option>
            <option value="newest">New Arrivals</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#241A14] border border-[#443227] rounded-3xl space-y-4">
          <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">No Furniture Found</h3>
          <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
            Try resetting your search query or choosing another category. You can also message us directly on WhatsApp for any custom piece.
          </p>
          <button
            onClick={() => {
              setActiveCategoryId('all');
              setActiveSubcategoryId('all');
              setSearchQuery('');
              setOnlyCustomizable(false);
            }}
            className="px-6 py-2.5 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl"
          >
            Reset Filters
          </button>
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
  );
};
