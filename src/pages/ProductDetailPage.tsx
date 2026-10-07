import React, { useState } from 'react';
import { 
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Phone, 
  Share2, 
  Check, 
  ShieldCheck, 
  Truck, 
  Layers, 
  MapPin
} from 'lucide-react';
import { useStoreData, useWishlist } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';
import { getProductWhatsAppLink } from '../utils/whatsapp';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (path: string) => void;
  onOpenProduct: (slug: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  slug,
  onNavigate,
  onOpenProduct
}) => {
  const { products, categories, subcategories, settings } = useStoreData();
  const { toggle, isSaved } = useWishlist();

  const product = products.find(p => p.slug === slug || p.id === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 bg-[#1A130F] text-[#FAF6F0]">
        <h2 className="font-serif text-3xl text-[#FAF6F0]">Furniture Piece Not Found</h2>
        <p className="text-sm text-stone-400">
          The item you are looking for may have been moved or updated.
        </p>
        <button
          onClick={() => onNavigate('/furniture')}
          className="px-7 py-3 bg-[#768A7D] hover:bg-[#5C7367] text-white text-xs font-semibold rounded-xl transition-colors shadow-md"
        >
          Back to Furniture Catalog
        </button>
      </div>
    );
  }

  const category = categories.find(c => c.id === product.category_id);
  const subcategory = subcategories.find(s => s.id === product.subcategory_id);
  const saved = isSaved(product.id);

  const allImages = Array.from(new Set([product.main_image, ...(product.images || [])]));

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const relatedProducts = products
    .filter(p => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-14 bg-[#1A130F] text-[#FAF6F0]">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <button onClick={() => onNavigate('/furniture')} className="hover:text-white transition-colors">
          Furniture
        </button>
        {category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
            <button 
              onClick={() => onNavigate(`/category/${category.slug}`)} 
              className="hover:text-white transition-colors"
            >
              {category.name}
            </button>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880] truncate max-w-[220px]">{product.name}</span>
      </nav>

      {/* Main Contiguous Product Showcase (PDP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left: Sticky Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#241A14] border border-[#443227] shadow-xl">
            <SafeImage 
              src={allImages[activeImageIndex] || product.main_image} 
              alt={product.name} 
              className="w-full h-full object-cover object-center transition-all duration-300"
              loading="eager"
            />
            {product.customizable && (
              <div className="absolute top-4 left-4 bg-[#1A130F]/90 backdrop-blur-xs text-[#FAF6F0] text-xs sm:text-sm px-3.5 py-1.5 rounded-xl border border-[#443227] shadow-md font-medium">
                Customizable Design & Dimensions
              </div>
            )}
          </div>

          {/* Thumbnails row */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-luxury ${
                    activeImageIndex === idx 
                      ? 'border-[#C5A880] shadow-md scale-102' 
                      : 'border-[#443227] opacity-60 hover:opacity-100 bg-[#241A14]'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Quality Seals */}
          <div className="grid grid-cols-3 gap-3 p-5 bg-[#241A14] border border-[#443227] rounded-2xl text-center text-xs sm:text-sm text-stone-300">
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 text-[#C5A880] mx-auto" />
              <span className="font-semibold block text-[#FAF6F0]">Termite Proof</span>
              <span className="text-xs text-stone-400">Kiln Seasoned Wood</span>
            </div>
            <div className="space-y-1 border-x border-[#443227]">
              <Layers className="w-5 h-5 text-[#C5A880] mx-auto" />
              <span className="font-semibold block text-[#FAF6F0]">Custom Sizing</span>
              <span className="text-xs text-stone-400">Tailored to Space</span>
            </div>
            <div className="space-y-1">
              <Truck className="w-5 h-5 text-[#C5A880] mx-auto" />
              <span className="font-semibold block text-[#FAF6F0]">Twin Cities Delivery</span>
              <span className="text-xs text-stone-400">Padded Assembly</span>
            </div>
          </div>
        </div>

        {/* Right: Sticky Details & Direct Inquiry Module (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          
          <div>
            {/* Metadata */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-400 mb-2.5 font-medium">
              <span className="text-[#C5A880] font-semibold">{category?.name || 'Furniture'}</span>
              {subcategory && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{subcategory.name}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="capitalize">{product.availability.replace(/_/g, ' ')}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF6F0] leading-tight mb-4">
              {product.name}
            </h1>

            {/* Inquiry Status Banner (NO PRICING) */}
            <div className="p-4 sm:p-5 bg-[#241A14] rounded-2xl border border-[#443227] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#C5A880] font-bold block">
                  Direct Manufacturer Inquiry
                </span>
                <span className="text-xs sm:text-sm text-stone-300 font-medium">
                  Custom sizes, timber & fabric swatches available
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(product.id)}
                  className="p-2.5 sm:p-3 bg-[#1A130F] hover:bg-[#2E211A] rounded-xl border border-[#443227] text-stone-200 transition-luxury flex items-center gap-1.5 text-xs font-semibold"
                  title="Save to Wishlist"
                >
                  <Heart className={`w-4 h-4 ${saved ? 'fill-[#C5A880] text-[#C5A880]' : ''}`} />
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2.5 sm:p-3 bg-[#1A130F] hover:bg-[#2E211A] rounded-xl border border-[#443227] text-stone-200 transition-luxury text-xs relative"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedLink && (
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#768A7D] text-white text-[10px] px-2 py-0.5 rounded shadow">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3 text-sm text-stone-300 leading-relaxed bg-[#241A14] p-5 rounded-2xl border border-[#443227]">
            <p>{product.description}</p>
          </div>

          {/* Specifications Table */}
          <div className="border border-[#443227] rounded-2xl overflow-hidden text-xs sm:text-sm bg-[#241A14]">
            <div className="bg-[#1A130F] px-5 py-3 font-semibold text-[#FAF6F0] uppercase tracking-wider text-xs border-b border-[#443227]">
              Furniture Specifications
            </div>
            <div className="divide-y divide-[#443227]">
              <div className="px-5 py-3 grid grid-cols-3">
                <span className="text-stone-400 font-medium">Material</span>
                <span className="col-span-2 text-stone-200 font-medium">{product.material}</span>
              </div>
              <div className="px-5 py-3 grid grid-cols-3">
                <span className="text-stone-400 font-medium">Dimensions</span>
                <span className="col-span-2 text-stone-200 font-medium">{product.dimensions}</span>
              </div>
              <div className="px-5 py-3 grid grid-cols-3">
                <span className="text-stone-400 font-medium">Finish / Polish</span>
                <span className="col-span-2 text-stone-200 font-medium">{product.finish}</span>
              </div>
              <div className="px-5 py-3 grid grid-cols-3">
                <span className="text-stone-400 font-medium">Customization</span>
                <span className="col-span-2 text-stone-200 font-medium">
                  {product.customizable ? 'Available (Custom Dimensions, Wood Species & Fabric)' : 'Standard Specs'}
                </span>
              </div>
            </div>
          </div>

          {/* Primary Action CTAs */}
          <div className="space-y-3 pt-2">
            <a
              href={getProductWhatsAppLink(settings.whatsapp, product.name, settings.brand_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-sm sm:text-base font-bold rounded-2xl transition-luxury shadow-xl flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enquire on WhatsApp ({settings.whatsapp})</span>
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                className="py-3.5 px-4 bg-[#241A14] hover:bg-[#2E211A] border border-[#443227] text-white text-xs sm:text-sm font-semibold rounded-xl transition-luxury flex items-center justify-center gap-1.5"
              >
                <Phone className="w-4 h-4 text-[#C5A880]" />
                <span>Call Showroom</span>
              </a>

              <button
                onClick={() => onNavigate('/contact')}
                className="py-3.5 px-4 bg-[#241A14] border border-[#443227] hover:bg-[#2E211A] text-stone-200 text-xs sm:text-sm font-semibold rounded-xl transition-luxury text-center flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-[#C5A880]" />
                <span>Plan Visit</span>
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Note */}
          <p className="text-xs text-stone-400 text-center leading-relaxed">
            Message directly with {settings.brand_name} for custom dimensions, fabric swatches, and showroom availability.
          </p>

        </div>

      </div>

      {/* Related Furniture Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-14 border-t border-[#443227] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#C5A880] font-bold block">
              COMPLEMENTARY PIECES
            </span>
            <h3 className="font-serif text-3xl font-bold text-[#FAF6F0]">
              Similar Furniture Pieces
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {relatedProducts.map(rel => (
              <ProductCard
                key={rel.id}
                product={rel}
                onOpenProduct={onOpenProduct}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
