import React from 'react';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useWishlist, useStoreData } from '../hooks/useStore';
import { getProductWhatsAppLink } from '../utils/whatsapp';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (slug: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenProduct }) => {
  const { toggle, isSaved } = useWishlist();
  const { settings, categories } = useStoreData();
  const saved = isSaved(product.id);

  const category = categories.find(c => c.id === product.category_id);
  const whatsAppLink = getProductWhatsAppLink(settings.whatsapp, product.name, settings.brand_name);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product.id);
  };

  return (
    <div 
      onClick={() => onOpenProduct(product.slug)}
      className="group relative bg-white border border-[#E8DFC8] hover:border-[#8C5D36] rounded-3xl overflow-hidden cursor-pointer transition-luxury shadow-xs hover:shadow-xl hover:-translate-y-1.5 flex flex-col justify-between"
    >
      {/* Image Container with 4:3 Ratio and gentle inner framing */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE1]">
        <SafeImage 
          src={product.main_image} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Wishlist Heart Button - Circular with soft glass blur */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3.5 right-3.5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-[#E0D5C3] shadow-md flex items-center justify-center text-stone-600 hover:text-[#8C5D36] transition-luxury hover:scale-110 z-10"
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          title={saved ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart className={`w-4.5 h-4.5 transition-colors ${saved ? 'fill-[#8C5D36] text-[#8C5D36]' : ''}`} />
        </button>

        {/* Customization Badge */}
        {product.customizable && (
          <div className="absolute bottom-3 left-3 bg-[#241A14]/85 backdrop-blur-xs text-[#FAF6F0] text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
            Customizable Sizing
          </div>
        )}
      </div>

      {/* Card Content with refined typography and contrast */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          {/* Metadata line */}
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-1.5 font-medium">
            <span className="text-[#8C5D36] font-semibold">{category?.name || 'Furniture'}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{product.material.split('/')[0]?.trim() || 'Solid Wood'}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#241A14] group-hover:text-[#8C5D36] transition-colors line-clamp-1 mb-2">
            {product.name}
          </h3>

          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Dimensions summary if available */}
          {product.dimensions && (
            <p className="text-xs text-stone-500 mt-2 font-medium truncate">
              Specs: {product.dimensions}
            </p>
          )}
        </div>

        {/* Action CTAs (NO PRICING - Direct WhatsApp Enquiry & Details) */}
        <div className="pt-4 border-t border-[#F0E8DC] flex items-center justify-between gap-2.5">
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-3 px-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black text-xs sm:text-sm font-bold rounded-xl transition-luxury flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01]"
            title="Enquire on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Enquire on WhatsApp</span>
          </a>

          <button
            onClick={() => onOpenProduct(product.slug)}
            className="p-3 bg-[#FAF7F2] hover:bg-[#F2ECE1] border border-[#DDD3C2] text-stone-700 hover:text-[#241A14] rounded-xl transition-colors shrink-0"
            title="View Details"
            aria-label="View Details"
          >
            <ArrowRight className="w-4 h-4 text-[#8C5D36]" />
          </button>
        </div>
      </div>
    </div>
  );
};
