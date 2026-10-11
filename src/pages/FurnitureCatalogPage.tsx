import React, { useMemo } from 'react';
import { Package, MessageCircle } from 'lucide-react';
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
  onNavigate: _onNavigate,
  onOpenProduct
}) => {
  const { categories, products, settings } = useStoreData();

  // Find targeted category by slug or id
  const currentCategory = useMemo(() => {
    if (!initialCategorySlug) return null;
    const clean = decodeURIComponent(initialCategorySlug).trim().toLowerCase();
    return categories.find(c => 
      c.slug.toLowerCase() === clean || 
      c.id.toLowerCase() === clean ||
      c.name.toLowerCase() === clean.replace(/-/g, ' ')
    ) || null;
  }, [categories, initialCategorySlug]);

  // Centered category title
  const pageTitle = useMemo(() => {
    if (currentCategory) {
      return currentCategory.name;
    }
    if (initialCategorySlug) {
      return decodeURIComponent(initialCategorySlug)
        .split(/[-_]/)
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    return 'Furniture Collection';
  }, [currentCategory, initialCategorySlug]);

  // Strictly filter products belonging ONLY to this category
  // If no category specified (general catalog), show all
  const categoryProducts = useMemo(() => {
    if (currentCategory) {
      return products.filter(p => {
        const catId = (p.category_id || '').toLowerCase();
        return (
          catId === currentCategory.id.toLowerCase() ||
          catId === currentCategory.slug.toLowerCase()
        );
      });
    }

    if (initialCategorySlug) {
      const clean = decodeURIComponent(initialCategorySlug).trim().toLowerCase();
      return products.filter(p => {
        const catId = (p.category_id || '').toLowerCase();
        return catId === clean || catId.replace(/[^a-z0-9]+/g, '-') === clean;
      });
    }

    return products;
  }, [products, currentCategory, initialCategorySlug]);

  return (
    <div className="w-full min-h-screen bg-[#FAF7F2] text-[#241A14]">
      {/* Centered Category Heading Header */}
      <section className="bg-[#FAF7F2] border-b border-[#EAE2D5] pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#241A14] tracking-tight">
            {pageTitle}
          </h1>

          {currentCategory?.description && (
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              {currentCategory.description}
            </p>
          )}
        </div>
      </section>

      {/* Clean Responsive Products Grid - No Sliders, No Auto-Animations, No Clones */}
      <section className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoryProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#E5DCD0] rounded-3xl space-y-4 max-w-md mx-auto p-8 shadow-xs">
              <Package className="w-12 h-12 text-[#8C5D36] mx-auto opacity-70" />
              <h3 className="font-serif text-2xl font-bold text-[#241A14]">No Products Found</h3>
              <p className="text-xs sm:text-sm text-stone-600">
                No items are currently listed in {pageTitle}. We manufacture bespoke pieces tailored to your sketches and dimensions.
              </p>
              <div className="pt-2">
                <a
                  href={getCategoryWhatsAppLink(settings.whatsapp, pageTitle, settings.brand_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire for {pageTitle} on WhatsApp</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {categoryProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard
                    product={product}
                    onOpenProduct={onOpenProduct}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
