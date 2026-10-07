import React, { useState } from 'react';
import { 
  ChevronRight, 
  Play, 
  X, 
  MessageCircle, 
  Film 
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { VideoItem } from '../types';
import { createWhatsAppLink } from '../utils/whatsapp';

interface VideosPageProps {
  onNavigate: (path: string) => void;
}

export const VideosPage: React.FC<VideosPageProps> = ({ onNavigate }) => {
  const { videos, settings } = useStoreData();
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);

  const handleInquireVideo = (v: VideoItem) => {
    const msg = `Hi ${settings.brand_name}, I watched your video "${v.title}" on the website and would like more details about the featured furniture.`;
    const link = createWhatsAppLink(settings.whatsapp, msg);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-stone-500">
        <button onClick={() => onNavigate('/')} className="hover:text-[#2D241E] transition-colors">
          Home
        </button>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="font-semibold text-[#8A5A36]">Furniture Inspiration & Videos</span>
      </nav>

      {/* Header */}
      <div className="max-w-3xl space-y-3 pb-8 border-b border-[#E6E1D6]">
        <span className="text-xs uppercase tracking-[0.25em] text-[#8A5A36] font-bold block">
          INSPIRATION & SHOWROOM
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-semibold text-[#2D241E] tracking-tight">
          Showroom Tours & Workshop Reels
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Watch our artisans at work in Shamsabad, Rawalpindi. Inspect the solid wood joinery, high-density foam layering, and finished pieces before ordering.
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {videos.map(item => (
          <div 
            key={item.id}
            className="bg-[#FAF9F5] border border-[#E6E1D6] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
          >
            {/* Thumbnail with Play Trigger */}
            <div 
              onClick={() => setSelectedVideo(item)}
              className="relative aspect-[16/9] w-full bg-black cursor-pointer group overflow-hidden"
            >
              <img 
                src={item.thumbnail} 
                alt={item.title} 
                className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-[#8A5A36] group-hover:text-white text-[#2D241E] flex items-center justify-center transition-luxury shadow-lg group-hover:scale-110">
                  <Play className="w-6 h-6 ml-1 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-[#2D241E]/80 backdrop-blur-xs text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                {item.category}
              </div>
            </div>

            {/* Info */}
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#2D241E] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E6E1D6] flex items-center justify-between">
                <button
                  onClick={() => setSelectedVideo(item)}
                  className="text-xs font-semibold text-[#2D241E] hover:text-[#8A5A36] transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-[#8A5A36]" />
                  <span>Watch Video</span>
                </button>

                <button
                  onClick={() => handleInquireVideo(item)}
                  className="px-3 py-1.5 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Ask on WhatsApp</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedVideo(null)}
        >
          <div 
            className="bg-[#FAF9F5] max-w-3xl w-full rounded-2xl overflow-hidden shadow-2xl border border-[#E6E1D6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E6E1D6] flex items-center justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#2D241E] truncate pr-4">
                {selectedVideo.title}
              </h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-[16/9] w-full bg-black">
              <iframe
                src={selectedVideo.video_url}
                title={selectedVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-4 bg-white flex items-center justify-between gap-4">
              <p className="text-xs text-stone-600 line-clamp-1">
                {selectedVideo.description}
              </p>
              <button
                onClick={() => handleInquireVideo(selectedVideo)}
                className="shrink-0 px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Inquire on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
