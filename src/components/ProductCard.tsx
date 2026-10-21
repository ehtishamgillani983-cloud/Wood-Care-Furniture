import React, { useState, useRef } from 'react';
import { Heart, MessageCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { useWishlist, useStoreData } from '../hooks/useStore';
import { getProductWhatsAppLink } from '../utils/whatsapp';
import { SafeImage } from './SafeImage';
import { prefersReducedMotion } from '../utils/motion';

interface ProductCardProps {
  product: Product;
  onOpenProduct: (slug: string) => void;
  priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOpenProduct,
  priority = false 
}) => {
  const { toggle, isSaved } = useWishlist();
  const { settings, categories } = useStoreData();
  const saved = isSaved(product.id);

  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50, opacity: 0 });

  const category = categories.find(c => 
    c.id.toLowerCase() === (product.category_id || '').toLowerCase() ||
    c.slug.toLowerCase() === (product.category_id || '').toLowerCase()
  );
  const whatsAppLink = getProductWhatsAppLink(settings.whatsapp, product.name, settings.brand_name);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle(product.id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion() || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -6; // Max 6deg
    const rotateY = ((x - centerX) / centerX) * 6;  // Max 6deg

    setTilt({
      x: rotateX,
      y: rotateY,
      glareX: (x / rect.width) * 100,
      glareY: (y / rect.height) * 100,
      opacity: 0.12,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onOpenProduct(product.slug)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 && tilt.y === 0 
          ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease' 
          : 'transform 0.1s ease-out, box-shadow 0.2s ease',
      }}
      className="group relative bg-[#FFFFFF] border border-[#E7DFD2] hover:border-[#C5A880] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(26,19,15,0.04)] hover:shadow-[0_20px_40px_rgba(26,19,15,0.12)] flex flex-col justify-between will-change-transform"
    >
      {/* Specular Glare Reflection on Hover */}
      <div 
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"
        style={{
          background: `radial-gradient(circle 320px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8), transparent 70%)`,
          opacity: tilt.opacity,
        }}
      />

      {/* Image Framing with 4:3 Luxury Architectural Aspect Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F4EFE6]">
        <SafeImage 
          src={product.main_image} 
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-800 ease-out"
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Wishlist Heart Button - Minimalist Circular Glass Icon */}
        <button
          onClick={handleToggleWishlist}
          className="absolute top-3.5 right-3.5 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#E4DAC8] shadow-sm flex items-center justify-center text-stone-700 hover:text-[#8C5D36] transition-all duration-300 hover:scale-110 active:scale-95 z-30"
          aria-label={saved ? "Remove from saved wishlist" : "Save to wishlist"}
          title={saved ? "Remove from saved wishlist" : "Save to wishlist"}
        >
          <Heart className={`w-4 h-4 transition-colors ${saved ? 'fill-[#8C5D36] text-[#8C5D36]' : ''}`} />
        </button>

        {/* Status indicator: Customizable or Artisanal */}
        {product.customizable && (
          <div className="absolute bottom-3 left-3 bg-[#1A130F]/90 backdrop-blur-md text-[#FAF6F0] text-[10px] sm:text-[11px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-md border border-[#C5A880]/30 shadow-xs z-10">
            Custom Dimensions
          </div>
        )}
      </div>

      {/* Card Content with Editorial Hierarchy */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          {/* Metadata Line without pills */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1.5 font-medium tracking-wide">
            <span className="text-[#8C5D36] uppercase tracking-wider font-semibold text-[11px]">
              {category?.name || 'Handcrafted'}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span className="truncate text-stone-600">
              {product.material ? product.material.split('/')[0]?.trim() : 'Seasoned Hardwood'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1A130F] group-hover:text-[#8C5D36] transition-colors line-clamp-1 mb-2 leading-tight">
            {product.name}
          </h3>

          {/* Short Excerpt */}
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
            {product.short_description || product.description}
          </p>

          {/* Dimension Details if present */}
          {product.dimensions && (
            <p className="text-[11px] text-stone-500 mt-2 font-mono truncate">
              {product.dimensions}
            </p>
          )}
        </div>

        {/* Card Action Bar */}
        <div className="pt-4 border-t border-[#F2ECE1] flex items-center justify-between gap-2.5">
          <a
            href={whatsAppLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-3 px-3.5 bg-[#1A130F] hover:bg-[#8C5D36] text-[#FAF6F0] text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
            title="Inquire on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
            <span>Consult Workshop</span>
          </a>

          <button
            onClick={() => onOpenProduct(product.slug)}
            className="p-3 bg-[#FAF8F5] hover:bg-[#EFE8DD] border border-[#E4DAC8] text-[#1A130F] rounded-xl transition-colors duration-200 shrink-0 group-hover:border-[#C5A880]"
            title="View Specifications & Full Imagery"
            aria-label="View Details"
          >
            <ArrowRight className="w-4 h-4 text-[#8C5D36] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
