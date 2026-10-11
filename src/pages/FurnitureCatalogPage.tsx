import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  MessageCircle, 
  Package 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { VerticalProductSlider } from '../components/VerticalProductSlider';
import { getCategoryWhatsAppLink, getGeneralWhatsAppLink } from '../utils/whatsapp';

interface FurnitureCatalogPageProps {
  initialCategorySlug?: string;
  initialSubcategoryId?: string;
  onNavigate: (path: string) => void;
  onOpenProduct: (slug: string) => void;
}

export const FurnitureCatalogPage: React.FC<FurnitureCatalogPageProps> = ({
  initialCategorySlug,
  onNavigate,
  onOpenProduct
}) => {
  const { categories, products, settings } = useStoreData();

  const selectedCategory = useMemo(() => {
    if (!initialCategorySlug) return null;
    return categories.find(c => c.slug === initialCategorySlug) || null;
  }, [categories, initialCategorySlug]);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    selectedCategory ? selectedCategory.id : 'all'
  );

  useEffect(() => {
    setActiveCategoryId(selectedCategory ? selectedCategory.id : 'all');
  }, [selectedCategory]);

  const currentCatObj = categories.find(c => c.id === activeCategoryId);

  // Products belonging to the current category (or all if 'all')
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (activeCategoryId !== 'all' && p.category_id !== activeCategoryId) return false;
      return true;
    }).sort((a, b) => {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, activeCategoryId]);

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

          {/* Compact Centered Page Header with clean spacing */}
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

      {/* SECTION 2: PRODUCTS DISPLAY WITH VERTICAL AUTO-SLIDING ANIMATION */}
      <section className="bg-[#FAF7F2] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Results Summary Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5] mb-6">
            <span className="text-xs sm:text-sm text-stone-600 font-medium">
              Showing <strong className="text-[#241A14]">{filteredProducts.length}</strong> handcrafted piece{filteredProducts.length === 1 ? '' : 's'}
              {currentCatObj && <span> in <strong className="text-[#8C5D36]">{currentCatObj.name}</strong></span>}
            </span>

            {/* WhatsApp Enquiry Action */}
            <a
              href={getCategoryWhatsAppLink(
                settings.whatsapp, 
                currentCatObj ? currentCatObj.name : 'All Furniture', 
                settings.brand_name
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C5D36] hover:text-[#5E3C20] transition-colors self-start sm:self-auto"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span className="hidden sm:inline">Ask about custom sizing on WhatsApp</span>
              <span className="sm:hidden">WhatsApp Help</span>
            </a>
          </div>

          {/* Products Render Area */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E5DCD0] rounded-3xl space-y-4 shadow-sm max-w-xl mx-auto p-8">
              <Package className="w-12 h-12 text-[#8C5D36] mx-auto opacity-70" />
              <h3 className="font-serif text-2xl font-bold text-[#241A14]">No Furniture Matches Found</h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                No products found in this category. Our artisans build bespoke pieces from photos and sketches as well.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setActiveCategoryId('all');
                    onNavigate('/furniture');
                  }}
                  className="px-6 py-2.5 bg-[#8C5D36] hover:bg-[#6D4728] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  View All Furniture
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
            <VerticalProductSlider
              products={filteredProducts}
              onOpenProduct={onOpenProduct}
            />
          )}

        </div>
      </section>

    </div>
  );
};
