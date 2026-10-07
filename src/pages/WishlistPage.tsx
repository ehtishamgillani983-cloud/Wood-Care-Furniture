import React from 'react';
import { 
  Heart, 
  Trash2, 
  MessageCircle, 
  ArrowRight, 
  ChevronRight 
} from 'lucide-react';
import { useStoreData, useWishlist } from '../hooks/useStore';
import { createWhatsAppLink } from '../utils/whatsapp';

interface WishlistPageProps {
  onNavigate: (path: string) => void;
  onOpenProduct: (slug: string) => void;
}

export const WishlistPage: React.FC<WishlistPageProps> = ({ onNavigate, onOpenProduct }) => {
  const { products, settings } = useStoreData();
  const { wishlist, toggle } = useWishlist();

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  const handleInquireAll = () => {
    if (savedProducts.length === 0) return;
    const names = savedProducts.map(p => `• ${p.name}`).join('\n');
    const msg = `Hi ${settings.brand_name}, I have saved the following ${savedProducts.length} pieces on your website:\n\n${names}\n\nPlease share the details, custom options, and delivery timeline for Rawalpindi / Islamabad.`;
    const link = createWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-stone-500">
        <button onClick={() => onNavigate('/')} className="hover:text-[#2D241E] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        <span className="font-semibold text-[#8A5A36]">My Saved Furniture</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E6E1D6]">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] text-[#8A5A36] font-bold block">
            PERSONAL WISHLIST
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#2D241E]">
            Saved Furniture ({savedProducts.length})
          </h1>
          <p className="text-sm sm:text-base text-stone-600 max-w-xl leading-relaxed">
            Review the furniture pieces you have saved. Inquire about them individually or submit a single WhatsApp request for a combined consultation.
          </p>
        </div>

        {savedProducts.length > 0 && (
          <button
            onClick={handleInquireAll}
            className="px-6 py-3.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs sm:text-sm font-semibold rounded-xl transition-luxury flex items-center gap-2 shadow-xs shrink-0"
          >
            <MessageCircle className="w-4.5 h-4.5" />
            <span>Enquire About All Saved Pieces</span>
          </button>
        )}
      </div>

      {/* List or Empty State */}
      {savedProducts.length === 0 ? (
        <div className="text-center py-24 bg-[#FAF9F5] border border-[#E6E1D6] rounded-3xl p-8 space-y-5 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F4F1EA] flex items-center justify-center mx-auto text-[#8A5A36]">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D241E]">
            You haven't saved any furniture yet.
          </h3>
          <p className="text-sm text-stone-500 leading-relaxed">
            Click the heart icon on any sofa, bed, dining set, or custom piece across our collections to save it here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('/furniture')}
              className="px-7 py-3.5 bg-[#2D241E] hover:bg-[#8A5A36] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
            >
              <span>Explore Furniture Collections</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {savedProducts.map(prod => (
            <div
              key={prod.id}
              className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
            >
              <div 
                className="aspect-[4/3] w-full bg-[#F4F1EA] relative overflow-hidden cursor-pointer"
                onClick={() => onOpenProduct(prod.slug)}
              >
                <img
                  src={prod.main_image}
                  alt={prod.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(prod.id);
                  }}
                  className="absolute top-3.5 right-3.5 p-2.5 bg-white/95 backdrop-blur-sm rounded-full text-red-500 hover:text-red-700 transition-colors shadow-sm"
                  title="Remove from saved"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
                <div>
                  <h3 
                    onClick={() => onOpenProduct(prod.slug)}
                    className="font-serif text-xl sm:text-2xl font-semibold text-[#2D241E] hover:text-[#8A5A36] transition-colors cursor-pointer line-clamp-1 mb-1.5"
                  >
                    {prod.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 line-clamp-1">
                    {prod.material}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E6E1D6] flex items-center justify-between gap-2.5">
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${settings.brand_name}, I am interested in "${prod.name}" from my saved list. Please share details, dimensions, and production timeline.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 text-xs sm:text-sm font-semibold bg-[#128C7E] hover:bg-[#075E54] text-white rounded-lg transition-luxury flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Enquire on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => onOpenProduct(prod.slug)}
                    className="py-2.5 px-3 bg-[#F4F1EA] hover:bg-[#2D241E] hover:text-white text-[#2D241E] text-xs font-semibold rounded-lg transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
