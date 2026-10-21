import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Maximize2, 
  ChevronRight, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { GalleryItem } from '../types';
import { SafeImage } from '../components/SafeImage';
import { createWhatsAppLink } from '../utils/whatsapp';

interface GalleryPageProps {
  onNavigate: (path: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate }) => {
  const { gallery, settings } = useStoreData();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const galleryCategories = ['All', ...Array.from(new Set(gallery.map(g => g.category || (g as any).category_name || 'Showroom')))];

  const filteredItems = activeCategory === 'All'
    ? gallery
    : gallery.filter(g => (g.category || (g as any).category_name) === activeCategory);

  const handleInquireOnItem = (item: GalleryItem) => {
    const categoryName = item.category || (item as any).category_name || 'Furniture';
    const msg = `Hi ${settings.brand_name}, I saw the gallery installation photograph titled "${item.title}" (${categoryName}) on your website. Please share specifications and custom fabrication details for this piece.`;
    const link = createWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full min-h-screen bg-[#140F0C] text-[#FAF6F0] py-12 sm:py-16 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
          <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
          <span className="font-semibold text-[#DFC06A]">Spaces Gallery</span>
        </nav>

        {/* Editorial Header */}
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            RESIDENTIAL & COMMERCIAL PORTFOLIO
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] tracking-tight">
            Completed Spaces Gallery
          </h1>
          <p className="text-sm sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed font-light">
            Real photography of bespoke architectural woodwork and luxury furniture manufactured in Shamsabad and installed across Rawalpindi & Islamabad residences.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-[#2E2018]">
          {galleryCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-full whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat
                  ? 'bg-[#8C5D36] text-white shadow-md'
                  : 'bg-[#221812] text-stone-400 hover:text-white hover:bg-[#2C1F17] border border-[#3A281E]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Staggered Luxury Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredItems.map(item => (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-3xl overflow-hidden bg-[#1E1511] border border-[#3A281E] hover:border-[#DFC06A] cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-1.5"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-[#140F0C]">
                <SafeImage 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  loading="lazy"
                />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[10px] uppercase tracking-wider text-[#DFC06A] font-bold mb-1">
                  {item.category || (item as any).category_name || 'Showroom Showcase'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-1 font-light">
                  {item.description}
                </p>

                <div className="pt-3 mt-3 border-t border-white/15 flex items-center justify-between text-xs text-[#DFC06A] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>View Detail & Inquire</span>
                  </span>
                  <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox / Zoom Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-5xl w-full bg-[#1E1511] border border-[#3A281E] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
              
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors border border-white/20"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="md:w-3/5 bg-black flex items-center justify-center p-4 overflow-hidden">
                <SafeImage 
                  src={selectedItem.image} 
                  alt={selectedItem.title} 
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                  loading="eager"
                />
              </div>

              <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <span className="text-xs uppercase tracking-widest text-[#DFC06A] font-bold block">
                    {selectedItem.category || (selectedItem as any).category_name || 'Bespoke Installation'}
                  </span>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0] leading-snug">
                    {selectedItem.title}
                  </h2>

                  <p className="text-sm text-stone-300 leading-relaxed font-light">
                    {selectedItem.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#140F0C] border border-[#3A281E] space-y-1.5 text-xs text-stone-400">
                    <div className="flex items-center gap-2 text-stone-300">
                      <Sparkles className="w-3.5 h-3.5 text-[#DFC06A]" />
                      <span className="font-semibold text-white">Shamsabad Workshop Guarantee</span>
                    </div>
                    <p>
                      Every design shown can be custom-scaled to your exact room dimensions in solid Sheesham, Burmese Teak, or Walnut.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#3A281E]">
                  <button
                    onClick={() => handleInquireOnItem(selectedItem)}
                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire About This Space on WhatsApp</span>
                  </button>

                  <button
                    onClick={() => onNavigate('/custom')}
                    className="w-full py-3 px-4 bg-[#2C1F17] hover:bg-[#3D2C20] text-stone-200 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Request Custom Blueprints →
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
