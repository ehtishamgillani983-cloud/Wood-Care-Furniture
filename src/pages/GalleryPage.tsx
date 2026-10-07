import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Maximize2, 
  ChevronRight, 
  ArrowRight 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { GalleryItem } from '../types';
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
    const msg = `Hi ${settings.brand_name}, I saw the gallery photo titled "${item.title}" (${categoryName}) on your website. I would like more details and custom options for this furniture design.`;
    const link = createWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12 bg-[#1A130F] text-[#FAF6F0]">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center justify-center gap-2 text-xs sm:text-sm text-stone-400">
        <button onClick={() => onNavigate('/')} className="hover:text-white transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
        <span className="font-semibold text-[#C5A880]">Spaces Gallery</span>
      </nav>

      {/* Header - BIGGER & IN MIDDLE */}
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
          PORTFOLIO & INSTALLATIONS
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#FAF6F0] tracking-tight">
          Spaces Gallery
        </h1>
        <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
          Browse real photographs of bespoke furniture manufactured in our Shamsabad workshop and installed across Rawalpindi and Islamabad residences.
        </p>
      </div>

      {/* Gallery Filter Tabs */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-2 no-scrollbar border-b border-[#443227]">
        {galleryCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-luxury ${
              activeCategory === cat
                ? 'bg-[#768A7D] text-white shadow-md font-semibold'
                : 'bg-[#241A14] text-stone-300 hover:text-white hover:bg-[#2E211A] border border-[#443227]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry / Grid Photo List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative rounded-3xl overflow-hidden bg-[#241A14] border border-[#443227] hover:border-[#768A7D] cursor-pointer shadow-xl transition-luxury hover:-translate-y-1.5"
          >
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#1A130F]">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                loading="lazy"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-[10px] uppercase tracking-wider text-[#C5A880] font-bold mb-1">
                {item.category || (item as any).category_name || 'Showroom'}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-stone-300 line-clamp-1">
                {item.description}
              </p>

              <div className="pt-3 mt-3 border-t border-white/20 flex items-center justify-between text-xs text-[#C5A880] font-semibold">
                <span className="flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Enlarge & Inquire</span>
                </span>
                <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Zoom Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#241A14] border border-[#443227] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="md:w-3/5 bg-black flex items-center justify-center p-4">
              <img 
                src={selectedItem.image} 
                alt={selectedItem.title} 
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="md:w-2/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#C5A880] font-bold block">
                  {selectedItem.category || (selectedItem as any).category_name}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF6F0] leading-snug">
                  {selectedItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#443227]">
                <button
                  onClick={() => handleInquireOnItem(selectedItem)}
                  className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire on WhatsApp</span>
                </button>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-2.5 text-xs text-stone-400 hover:text-white text-center"
                >
                  Close Photo
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
