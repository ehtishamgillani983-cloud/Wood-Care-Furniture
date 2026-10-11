import React, { useState } from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  MapPin, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Phone,
  Sparkles
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { SafeImage, resolveSafeImageUrl } from '../components/SafeImage';
import { 
  getGeneralWhatsAppLink, 
  getCustomQuoteWhatsAppLink 
} from '../utils/whatsapp';
import { useScrollObserver } from '../hooks/useScrollObserver';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenProduct: (slug: string) => void;
}

const getYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
};

export const HomePage: React.FC<HomePageProps> = ({ 
  onNavigate, 
  onOpenProduct 
}) => {
  const { 
    settings, 
    categories, 
    products, 
    gallery, 
    services, 
    reviews, 
    blogPosts, 
    faqs,
    videos 
  } = useStoreData();

  useScrollObserver([categories.length, products.length, reviews.length, blogPosts.length]);

  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id || null);

  // Hero Media Slideshow Configuration
  // Prioritizes settings.hero_images (admin-managed drag & drop uploads) or falls back to hero_videos
  const heroVideoList = React.useMemo(() => {
    if (settings.hero_images && settings.hero_images.length > 0) {
      return settings.hero_images;
    }
    if (settings.hero_videos && settings.hero_videos.length > 0) {
      return settings.hero_videos;
    }
    if (settings.hero_video_url) {
      return [settings.hero_video_url];
    }
    if (videos.length > 0) {
      return videos.map(v => v.video_url);
    }
    return [
      "/images/hero_luxury_living_1791186963111.jpg",
      "/images/cat_living_room_1791186977406.jpg",
      "/images/cat_bedroom_1791186990246.jpg",
      "/images/cat_dining_1791187001317.jpg"
    ];
  }, [settings.hero_images, settings.hero_videos, settings.hero_video_url, videos]);

  const [activeVideoIdx, setActiveVideoIdx] = useState(0);

  // Auto-advance hero slideshow using settings.hero_interval_seconds
  React.useEffect(() => {
    if (heroVideoList.length <= 1) return;
    const intervalSec = Math.max(2, Math.min(30, Number(settings.hero_interval_seconds) || 6));
    const interval = setInterval(() => {
      setActiveVideoIdx((prev) => (prev + 1) % heroVideoList.length);
    }, intervalSec * 1000);
    return () => clearInterval(interval);
  }, [heroVideoList.length, settings.hero_interval_seconds]);

  const currentHeroMedia = heroVideoList[activeVideoIdx] || heroVideoList[0] || '';
  const currentYoutubeId = getYouTubeId(currentHeroMedia);
  const isDirectVideo = currentHeroMedia && (
    currentHeroMedia.endsWith('.mp4') || 
    currentHeroMedia.endsWith('.webm') || 
    currentHeroMedia.includes('data:video') || 
    currentHeroMedia.includes('blob:')
  );
  const heroPoster = (settings.hero_images && settings.hero_images.length > 0 ? settings.hero_images[0] : null) || 
    "/images/hero_luxury_living_1791186963111.jpg";
  const overlayOpacity = typeof settings.hero_video_overlay === 'number' ? settings.hero_video_overlay : 0.38;

  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const featuredCategories = categories.filter(c => c.is_featured !== false && c.is_active !== false);
  const approvedReviews = reviews.filter(r => r.is_approved);

  const [videoError, setVideoError] = useState(false);

  React.useEffect(() => {
    setVideoError(false);
  }, [currentHeroMedia]);

  return (
    <div className="w-full">
      
      {/* 1. CINEMATIC HERO SECTION: PROPORTIONAL MOBILE HEIGHT & TRUE FULL-BLEED SLIDESHOW */}
      <section className="relative overflow-hidden h-[62vh] min-h-[420px] max-h-[520px] sm:h-[84vh] sm:min-h-[580px] sm:max-h-none lg:min-h-[90vh] flex items-center justify-center bg-[#15100D]">
        
        {/* Full-Bleed Media Background (100% width & height, edge-to-edge, perfectly framed on mobile) */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
          {isDirectVideo && !videoError ? (
            <video
              key={currentHeroMedia}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={resolveSafeImageUrl(heroPoster)}
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover object-[center_35%] sm:object-center transition-opacity duration-700"
            >
              <source src={currentHeroMedia} type="video/mp4" />
            </video>
          ) : currentYoutubeId ? (
            <div key={currentYoutubeId} className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden transition-opacity duration-700">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${currentYoutubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1`}
                title="Wood Care Furniture Background Video"
                className="w-[170%] sm:w-[125%] h-[120%] sm:h-[125%] min-w-full min-h-full object-cover pointer-events-none scale-100 sm:scale-110"
                allow="autoplay; encrypted-media; picture-in-picture"
                tabIndex={-1}
              />
            </div>
          ) : (
            <img 
              key={currentHeroMedia}
              src={resolveSafeImageUrl(currentHeroMedia || heroPoster)} 
              alt="Wood Care Furniture Showroom Collection" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('images.unsplash.com')) {
                  target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80';
                }
              }}
              className="w-full h-full object-cover object-[center_35%] sm:object-center transition-all duration-700"
              loading="eager"
              fetchPriority="high"
            />
          )}

          {/* Subtle adjustable overlay for text readability - sharp and vibrant */}
          <div 
            className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300"
            style={{ opacity: Math.min(overlayOpacity, 0.46) }}
          />

          {/* Gentle bottom scrim fade transitioning into the next solid section */}
          <div className="absolute inset-x-0 bottom-0 h-14 sm:h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
        </div>

        {/* Slideshow Indicator Dots & Navigation */}
        {heroVideoList.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/50 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10 pointer-events-auto">
            {heroVideoList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveVideoIdx(idx)}
                className={`transition-all rounded-full ${
                  activeVideoIdx === idx 
                    ? 'w-5 sm:w-7 h-1.5 sm:h-2 bg-[#DFC06A]' 
                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Jump to hero slide ${idx + 1}`}
                title={`Hero Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Centered Hero Content: Compact, Elegant Headline, Badge & Action CTAs */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-24 lg:py-32 text-center flex flex-col items-center justify-center space-y-2.5 sm:space-y-6 md:space-y-8">
          
          {/* Subtle Location & Brand Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-0.5 sm:py-2 rounded-full bg-stone-900/70 backdrop-blur-md border border-[#DFC06A]/40 text-[9px] sm:text-xs md:text-sm font-medium tracking-[0.16em] sm:tracking-[0.2em] uppercase text-[#F3E5AB] shadow-2xl">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DFC06A] animate-pulse" />
            <span className="flex items-center gap-1 sm:gap-1.5">
              <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DFC06A]" />
              <span>RAWALPINDI & ISLAMABAD · HANDCRAFTED FURNITURE</span>
            </span>
          </div>

          {/* Hero Heading */}
          <h1 className="font-serif text-2xl leading-[1.16] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-[#FAF7F2] text-balance drop-shadow-[0_4px_24px_rgba(0,0,0,0.85)] max-w-4xl">
            {settings.hero_heading || 'Furniture Designed for Beautiful Living'}
          </h1>

          {/* Supporting Subheading */}
          <p className="text-xs sm:text-base md:text-lg lg:text-xl text-stone-200/95 font-light leading-relaxed max-w-xs sm:max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] tracking-wide line-clamp-2 sm:line-clamp-none">
            {settings.hero_subheading || 'Premium handcrafted furniture for homes, offices and commercial spaces across Rawalpindi and Islamabad.'}
          </p>

          {/* Inquiry-Based Action CTAs: Responsive Horizontal row on mobile */}
          <div className="pt-1 sm:pt-2 flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto max-w-sm sm:max-w-none">
            <button
              onClick={() => onNavigate('/furniture')}
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:px-8 sm:py-4 bg-[#8C5D36] hover:bg-[#724827] text-white font-medium text-xs sm:text-base rounded-xl transition-all shadow-xl border border-[#DFC06A]/30 flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <a
              href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name || 'Wood Care Furniture')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 sm:px-8 sm:py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-slate-950 font-semibold text-xs sm:text-base rounded-xl transition-all shadow-xl flex items-center justify-center gap-1.5 sm:gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <MessageCircle className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Refined Craftsmanship Promises */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center justify-center gap-1.5 sm:gap-4 text-stone-200 text-[9px] sm:text-xs md:text-sm tracking-wider uppercase font-medium">
            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10 shadow-lg">
              <Sparkles className="w-3 h-3 text-[#DFC06A]" /> Seasoned Hardwoods
            </span>
            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10 shadow-lg">
              <Sparkles className="w-3 h-3 text-[#DFC06A]" /> Custom Sizing
            </span>
            <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-white/10 shadow-lg">
              <Sparkles className="w-3 h-3 text-[#DFC06A]" /> Direct Workshop
            </span>
          </div>

        </div>
      </section>

      {/* ANIMATED TEXT MARQUEE RIBBON (BETWEEN HERO AND FURNITURE CATEGORIES) */}
      <div 
        className="marquee-container relative w-full overflow-hidden bg-[#18110D] border-y border-[#382619] py-2.5 sm:py-3.5 select-none z-10 cursor-default"
        title="Wood Care Furniture — Hover to pause"
      >
        <div className="animate-marquee-infinite flex items-center whitespace-nowrap">
          {[
            '100% Seasoned Solid Sheesham & Teak',
            'Termite-Proof Guaranteed Woodworking',
            'Direct Factory Workshop Rates',
            'Master Artisan Mortise & Tenon Joinery',
            'Custom Sizing & Bespoke Finish',
            'Showroom & Workshop: Shamsabad, Rawalpindi',
            'Free Measuring in Rawalpindi & Islamabad',
            '10-Year Craftsmanship Assurance',
            '100% Seasoned Solid Sheesham & Teak',
            'Termite-Proof Guaranteed Woodworking',
            'Direct Factory Workshop Rates',
            'Master Artisan Mortise & Tenon Joinery',
            'Custom Sizing & Bespoke Finish',
            'Showroom & Workshop: Shamsabad, Rawalpindi',
            'Free Measuring in Rawalpindi & Islamabad',
            '10-Year Craftsmanship Assurance'
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-3 sm:gap-4 px-4 sm:px-6 text-[10px] sm:text-xs md:text-sm font-medium tracking-[0.18em] sm:tracking-[0.22em] uppercase text-[#EAD8B7]"
            >
              <span>{item}</span>
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#DFC06A] shrink-0 opacity-80" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. FURNITURE CATEGORIES SECTION - SOLID WARM WHITE / IVORY */}
      <section className="bg-[#FAF7F2] py-20 sm:py-28 border-b border-[#EAE2D5] text-[#241A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              OUR CURATED SPACES
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241A14] tracking-tight">
              Furniture Categories
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
              Discover handcrafted collections built from termite-proof seasoned hardwoods, high-density comfort foam, and custom fabrics.
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredCategories.map((cat, idx) => (
              <div 
                key={cat.id}
                onClick={() => onNavigate(`/category/${cat.slug}`)}
                className={`group relative rounded-3xl overflow-hidden bg-[#FFFFFF] border border-[#E8DFC8] hover:border-[#8C5D36] cursor-pointer transition-luxury shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between scroll-reveal delay-${((idx % 4) + 1) * 100}`}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE1]">
                  <SafeImage 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>

                <div className="p-6 flex flex-col justify-between flex-1 space-y-3">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-[#241A14] group-hover:text-[#8C5D36] transition-colors mb-1.5">
                      {cat.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#F0E8DC] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#8C5D36]">
                    <span>Explore Collection</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-10 scroll-reveal">
            <button 
              onClick={() => onNavigate('/furniture')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#241A14] hover:bg-[#38271E] border border-[#3E2B20] text-[#FAF6F0] text-xs sm:text-sm font-semibold rounded-2xl transition-colors shadow-md hover:scale-[1.01]"
            >
              <span>View All Categories & Subcategories</span>
              <ArrowRight className="w-4 h-4 text-[#DFC06A]" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION - SOLID CRISP WARM IVORY */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#EAE3D6] text-[#241A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              HERITAGE & CRAFTSMANSHIP
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241A14]">
              About Us: Crafted for Beautiful Living
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
              Discover the legacy of seasoned solid wood manufacturing, in-house joinery, and direct wholesale pricing in Shamsabad, Rawalpindi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6 scroll-reveal">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#241A14] leading-snug">
                Furniture Built to Endure Across Generations
              </h3>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                At {settings.brand_name}, we operate both our dedicated manufacturing workshop and customer showroom in Shamsabad, Rawalpindi. We believe furniture should not be disposable. Every dining table, master bed suite, and curved sofa is handcrafted by artisans who understand wood seasoning, mortise-and-tenon structural joinery, and ergonomic luxury.
              </p>

              <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                By working directly with us—the manufacturer—you avoid retail middlemen markups, have complete freedom to customize dimensions and upholstery fabrics, and receive direct personal oversight on every order.
              </p>

              <div className="pt-2 flex items-center gap-6 sm:gap-8">
                <div>
                  <span className="font-serif text-3xl font-bold text-[#8C5D36] block">100%</span>
                  <span className="text-xs sm:text-sm text-stone-500 font-medium">Kiln Seasoned Timber</span>
                </div>
                <div className="h-10 w-px bg-[#E5DCD0]" />
                <div>
                  <span className="font-serif text-3xl font-bold text-[#8C5D36] block">Bespoke</span>
                  <span className="text-xs sm:text-sm text-stone-500 font-medium">Custom Dimensions</span>
                </div>
                <div className="h-10 w-px bg-[#E5DCD0]" />
                <div>
                  <span className="font-serif text-3xl font-bold text-[#8C5D36] block">Direct</span>
                  <span className="text-xs sm:text-sm text-stone-500 font-medium">Factory Advantage</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-7 py-3.5 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl text-xs sm:text-sm font-semibold transition-luxury shadow-md hover:scale-[1.01]"
                >
                  Read Our Story & Values →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <SafeImage 
                  src="/images/cat_living_room.jpg" 
                  alt="Wood Care Living Setup" 
                  className="rounded-3xl object-cover aspect-[4/5] w-full shadow-lg border border-[#E5DCD0]"
                />
                <div className="p-5 bg-[#FFFFFF] rounded-3xl border border-[#E5DCD0] shadow-sm">
                  <h4 className="font-serif text-base font-bold text-[#241A14] mb-1">
                    Termite-Proof Assurance
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Every wood beam is chemically conditioned against borers and termites.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-5 bg-[#FFFFFF] rounded-3xl border border-[#E5DCD0] shadow-sm">
                  <h4 className="font-serif text-base font-bold text-[#241A14] mb-1">
                    High-Density Molty Foam
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Resilient cushioning that retains shape for years without sagging.
                  </p>
                </div>
                <SafeImage 
                  src="/images/cat_bedroom.jpg" 
                  alt="Solid Wood Bed Craftsmanship" 
                  className="rounded-3xl object-cover aspect-[4/5] w-full shadow-lg border border-[#E5DCD0]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. OUR SERVICES - SOLID ALABASTER / LIGHT WOOD TONE */}
      <section className="bg-[#F7F2EA] py-20 sm:py-28 border-b border-[#EAE1D3] text-[#241A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              WHAT WE OFFER
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241A14]">
              Our Services: Workshop Direct
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
              Comprehensive furniture manufacturing, architectural woodworking, and interior wood care in the Twin Cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div 
                key={service.id}
                className={`bg-[#FFFFFF] border border-[#E6DDCE] rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#768A7D] transition-luxury hover:-translate-y-1 shadow-sm hover:shadow-xl scroll-reveal delay-${((idx % 4) + 1) * 100}`}
              >
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#241A14] mb-2 leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F0E7D8] flex items-center justify-between text-xs font-semibold text-[#8C5D36]">
                  <span>Inquire on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. BLOG & GUIDES - SOLID WARM IVORY */}
      <section className="bg-[#FAF7F2] py-20 sm:py-28 border-b border-[#EBE3D5] text-[#241A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              WOODWORKING KNOWLEDGE
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241A14]">
              Guides & Articles
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
              Practical advice on wood moisture, termite seasoning, and upholstery maintenance in Pakistani homes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogPosts.slice(0, 2).map((post, idx) => (
              <div 
                key={post.id}
                onClick={() => onNavigate('/blog')}
                className={`bg-[#FFFFFF] border border-[#E8DFCF] hover:border-[#768A7D] rounded-3xl overflow-hidden cursor-pointer transition-luxury shadow-sm hover:shadow-xl flex flex-col justify-between scroll-reveal delay-${((idx % 2) + 1) * 150}`}
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-[#F2ECE1]">
                  <SafeImage src={post.featured_image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6 space-y-2">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8C5D36]">{post.category} · {post.read_time}</span>
                  <h3 className="font-serif text-2xl font-bold text-[#241A14] leading-snug">{post.title}</h3>
                  <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                </div>
                <div className="p-6 pt-0 border-t border-[#F2EADA] flex items-center justify-between text-xs font-semibold text-[#8C5D36]">
                  <span>Read Full Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION - SOLID SOFT WARM SAND NEUTRAL */}
      <section className="bg-[#F0EAE0] py-20 sm:py-28 border-b border-[#E2D8C9] text-[#241A14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              COMMON INQUIRIES
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241A14]">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
              Everything you need to know about customizing furniture, delivery, and guarantees.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.slice(0, 5).map((faq, idx) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-[#FFFFFF] border border-[#E2D8C9] rounded-3xl overflow-hidden shadow-sm transition-colors scroll-reveal delay-${((idx % 5) + 1) * 75}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-lg sm:text-xl font-bold text-[#241A14]"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#8C5D36] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-[#EFE8DC] pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. CLIENT REVIEWS - SECOND-LAST CONTENT POSITION */}
      <section className="bg-[#18110D] py-20 sm:py-28 border-b border-[#2C1E16] text-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
              VERIFIED TESTIMONIALS
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
              Client Reviews
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
              Real feedback from homeowners and commercial clients in Rawalpindi, Islamabad, Bahria Town, and DHA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {approvedReviews.slice(0, 3).map((rev, idx) => (
              <div key={rev.id} className={`bg-[#221812] p-7 rounded-3xl border border-[#443227] flex flex-col justify-between shadow-lg scroll-reveal delay-${((idx % 3) + 1) * 100}`}>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-1 text-[#C5A880]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i} className="text-base">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-stone-300 leading-relaxed italic">
                    "{rev.review_text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-[#443227] mt-5 flex items-center justify-between text-xs text-stone-400">
                  <div>
                    <span className="font-bold text-[#FAF6F0] text-sm block">{rev.author_name}</span>
                    <span>{rev.location}</span>
                  </div>
                  <span className="text-stone-500">{rev.created_at}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-8 scroll-reveal">
            <button 
              onClick={() => onNavigate('/reviews')}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C5A880] hover:underline"
            >
              Read More Reviews & Submit Yours →
            </button>
          </div>
        </div>
      </section>

      {/* 8. VIP INTERIOR CONSULTATION - FINAL CONTENT SECTION BEFORE FOOTER */}
      <section className="bg-[#1C140F] py-20 sm:py-28 border-b border-[#2E2018] text-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto p-10 sm:p-14 lg:p-16 rounded-3xl bg-[#241A14] border border-[#443227] shadow-2xl text-center space-y-6 scroll-reveal-scale">
            <span className="text-xs uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
              CUSTOM SPACES & CONTRACT FURNISHING
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] leading-tight">
              Furnish Your Residence with Direct Workshop Assurance
            </h2>
            <p className="text-sm sm:text-base text-stone-200 leading-relaxed max-w-2xl mx-auto">
              Whether furnishing a new villa in DHA or upgrading drawing room suites in Rawalpindi, share your room dimensions or photos directly with our master artisans.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold text-sm sm:text-base rounded-2xl transition-luxury shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Discuss Your Project on WhatsApp</span>
              </a>
              <button
                onClick={() => onNavigate('/custom')}
                className="w-full sm:w-auto px-8 py-4 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] hover:border-[#768A7D] text-[#FAF6F0] font-semibold text-sm sm:text-base rounded-2xl transition-luxury hover:scale-[1.01]"
              >
                Explore Custom Woodworking →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 12. SHOWROOM & WORKSHOP LOCATION - SOLID WARM CRISP IVORY */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 text-[#241A14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              VISIT OUR WORKSHOP
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#241A14]">
              Showroom & Factory: Shamsabad, Rawalpindi
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto">
              Experience the solid timber quality, test sofa comfort layers, and consult directly with our master woodworkers.
            </p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E5DDD0] rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h3 className="font-serif text-3xl font-bold text-[#241A14]">
                M33J+C6H, Shamsabad, Rawalpindi
              </h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                We welcome clients from across Islamabad, Rawalpindi, and surrounding areas. Come see wood seasoning in progress, view foam layers, and select from our imported fabric swatches.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-stone-700">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#8C5D36] shrink-0" />
                  <span>{settings.address || 'M33J+C6H, Shamsabad, Rawalpindi, Pakistan (46000)'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#8C5D36] shrink-0" />
                  <span>Phone: {settings.phone} · WhatsApp: {settings.whatsapp}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp for Directions</span>
                </a>

                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-6 py-3.5 bg-[#241A14] hover:bg-[#38271E] text-stone-100 font-semibold rounded-2xl text-xs sm:text-sm hover:scale-[1.01]"
                >
                  Contact & Showroom Page →
                </button>
              </div>
            </div>

            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#E5DDD0] bg-[#FAF7F2]">
              <iframe
                title="Wood Care Furniture Google Maps Location"
                src="https://maps.google.com/maps?q=Shamsabad%20Rawalpindi&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
