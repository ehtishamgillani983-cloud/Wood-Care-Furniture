import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Phone,
  Sparkles,
  Layers,
  ShieldCheck,
  Hammer,
  Truck,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStoreData } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { SafeImage, resolveSafeImageUrl } from '../components/SafeImage';
import { 
  getGeneralWhatsAppLink, 
  getCustomQuoteWhatsAppLink 
} from '../utils/whatsapp';
import { useScrollObserver } from '../hooks/useScrollObserver';
import { MagneticButton } from '../components/MagneticButton';
import { prefersReducedMotion } from '../utils/motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('all');

  // Hero Media Slideshow Configuration
  const heroVideoList = useMemo(() => {
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
  useEffect(() => {
    if (heroVideoList.length <= 1) return;
    const intervalSec = Math.max(3, Math.min(30, Number(settings.hero_interval_seconds) || 7));
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
  const overlayOpacity = typeof settings.hero_video_overlay === 'number' ? settings.hero_video_overlay : 0.42;

  const [videoError, setVideoError] = useState(false);
  useEffect(() => {
    setVideoError(false);
  }, [currentHeroMedia]);

  // Featured Categories and Products
  const featuredCategories = useMemo(() => {
    return categories.filter(c => c.is_featured !== false && c.is_active !== false);
  }, [categories]);

  // Filtered Featured Products based on category tab
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.featured || p.is_bestseller);
    if (list.length === 0) list = products;
    if (selectedProductCategory !== 'all') {
      list = list.filter(p => {
        const cat = (p.category_id || '').toLowerCase();
        return cat === selectedProductCategory.toLowerCase();
      });
    }
    return list.slice(0, 6);
  }, [products, selectedProductCategory]);

  const approvedReviews = useMemo(() => {
    return reviews.filter(r => r.is_approved);
  }, [reviews]);

  // Parallax Hero Container Ref
  const heroParallaxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReducedMotion() || !heroParallaxRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to('.hero-bg-media', {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: heroParallaxRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, heroParallaxRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="w-full bg-[#FAF8F5] text-[#1A130F] selection:bg-[#DFC06A]/30">
      
      {/* =========================================================================
          1. CINEMATIC HERO SECTION: LAYERED DEPTH, EDITORIAL TYPOGRAPHY & SMOOTH REVEAL
         ========================================================================= */}
      <section 
        ref={heroParallaxRef}
        className="relative overflow-hidden min-h-[92vh] lg:min-h-[96vh] flex items-center justify-center bg-[#140F0C] text-[#FAF6F0]"
      >
        {/* Full-Bleed Parallax Media Background */}
        <div className="hero-bg-media absolute inset-0 w-full h-[120%] -top-[10%] overflow-hidden pointer-events-none select-none z-0">
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
              className="w-full h-full object-cover object-center filter brightness-[0.82]"
            >
              <source src={currentHeroMedia} type="video/mp4" />
            </video>
          ) : currentYoutubeId ? (
            <div key={currentYoutubeId} className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentYoutubeId}?autoplay=1&mute=1&loop=1&playlist=${currentYoutubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1`}
                title="Wood Care Furniture Background Video"
                className="w-[170%] sm:w-[125%] h-[120%] sm:h-[125%] min-w-full min-h-full object-cover pointer-events-none scale-105"
                allow="autoplay; encrypted-media; picture-in-picture"
                tabIndex={-1}
              />
            </div>
          ) : (
            <img 
              key={currentHeroMedia}
              src={resolveSafeImageUrl(currentHeroMedia || heroPoster)} 
              alt="Wood Care Furniture Architectural Showroom" 
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes('images.unsplash.com')) {
                  target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80';
                }
              }}
              className="w-full h-full object-cover object-center transition-all duration-1000 filter brightness-[0.84]"
              loading="eager"
            />
          )}

          {/* Deep Architectural Scrim Overlay */}
          <div 
            className="absolute inset-0 bg-[#120E0C] pointer-events-none transition-opacity duration-500"
            style={{ opacity: Math.min(overlayOpacity, 0.52) }}
          />

          {/* Soft Bottom Gradient Fade into warm tone */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#140F0C] via-[#140F0C]/60 to-transparent pointer-events-none" />
        </div>

        {/* Hero Slideshow Indicators */}
        {heroVideoList.length > 1 && (
          <div className="absolute bottom-8 right-6 sm:right-12 z-20 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15">
            <span className="text-[11px] font-mono tracking-widest text-[#DFC06A]">
              0{activeVideoIdx + 1}
            </span>
            <span className="text-[11px] text-stone-500">/</span>
            <span className="text-[11px] font-mono text-stone-400">
              0{heroVideoList.length}
            </span>
            <div className="flex items-center gap-1.5 pl-2">
              {heroVideoList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVideoIdx(idx)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    activeVideoIdx === idx 
                      ? 'w-6 bg-[#DFC06A]' 
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center flex flex-col items-center justify-center space-y-6 sm:space-y-8">
          
          {/* Subtle Location & Workshop Credibility Eyebrow */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#DFC06A]/35 text-[11px] sm:text-xs tracking-[0.24em] uppercase text-[#F3E5AB]"
          >
            <MapPin className="w-3.5 h-3.5 text-[#DFC06A]" />
            <span>Shamsabad, Rawalpindi · Twin Cities Bespoke Furniture</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF7F2] text-balance drop-shadow-[0_4px_30px_rgba(0,0,0,0.85)] max-w-4xl leading-[1.12]"
          >
            {settings.hero_heading || 'Handcrafted Solid Wood Living for Generations'}
          </motion.h1>

          {/* Subheading with editorial cadence */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm sm:text-lg md:text-xl text-stone-200/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]"
          >
            {settings.hero_subheading || 'Premier solid Sheesham, Burmese Teak and bespoke upholstery crafted in our Shamsabad workshop and delivered across Rawalpindi & Islamabad.'}
          </motion.p>

          {/* Action CTA Group */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
          >
            <MagneticButton
              onClick={() => onNavigate('/furniture')}
              className="w-full sm:w-auto px-8 py-4 bg-[#8C5D36] hover:bg-[#6E4424] text-white font-medium text-xs sm:text-sm tracking-wider uppercase rounded-xl transition-all shadow-[0_10px_30px_rgba(140,93,54,0.35)] border border-[#DFC06A]/30 flex items-center justify-center gap-2 group"
            >
              <span>Explore Furniture Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>

            <a
              href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name || 'Wood Care Furniture')}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-[#FAF6F0] backdrop-blur-md font-medium text-xs sm:text-sm tracking-wider uppercase rounded-xl transition-all border border-white/20 flex items-center justify-center gap-2.5 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Consultation</span>
            </a>
          </motion.div>

          {/* Quiet Unboxed Brand Credentials */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-6 text-stone-300 text-xs tracking-wider uppercase font-medium"
          >
            <span className="flex items-center gap-1.5 text-stone-200">
              <Sparkles className="w-3.5 h-3.5 text-[#DFC06A]" /> Seasoned Hardwoods
            </span>
            <span className="text-stone-500 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-stone-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFC06A]" /> Termite-Proof Assurance
            </span>
            <span className="text-stone-500 hidden sm:inline">·</span>
            <span className="flex items-center gap-1.5 text-stone-200">
              <Hammer className="w-3.5 h-3.5 text-[#DFC06A]" /> Workshop Direct Rates
            </span>
          </motion.div>

        </div>
      </section>

      {/* =========================================================================
          2. ARCHITECTURAL MARQUEE RIBBON (BETWEEN HERO AND FEATURED COLLECTIONS)
         ========================================================================= */}
      <div 
        className="marquee-container relative w-full overflow-hidden bg-[#18110D] border-y border-[#382619] py-3.5 select-none z-10 cursor-default"
        title="Wood Care Furniture Craftsmanship Highlights"
      >
        <div className="animate-marquee-infinite flex items-center whitespace-nowrap">
          {[
            '100% Seasoned Solid Sheesham & Burmese Teak',
            'Termite-Proof Guaranteed Woodworking',
            'Direct Factory Workshop Rates · No Retail Middlemen',
            'Master Artisan Mortise & Tenon Joinery',
            'Custom Dimensions & Bespoke Fabric Finishes',
            'Showroom & Factory: Shamsabad, Rawalpindi',
            'White-Glove Delivery Across Rawalpindi & Islamabad',
            '10-Year Craftsmanship Warranty',
            '100% Seasoned Solid Sheesham & Burmese Teak',
            'Termite-Proof Guaranteed Woodworking',
            'Direct Factory Workshop Rates · No Retail Middlemen',
            'Master Artisan Mortise & Tenon Joinery',
            'Custom Dimensions & Bespoke Fabric Finishes',
            'Showroom & Factory: Shamsabad, Rawalpindi',
            'White-Glove Delivery Across Rawalpindi & Islamabad',
            '10-Year Craftsmanship Warranty'
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="inline-flex items-center gap-3 sm:gap-4 px-5 sm:px-7 text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-[#EAD8B7]"
            >
              <span>{item}</span>
              <Sparkles className="w-3.5 h-3.5 text-[#DFC06A] shrink-0 opacity-75" />
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. FEATURED COLLECTIONS: ASYMMETRICAL EDITORIAL GRID WITH STAGGERED REVEALS
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E8DFD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 scroll-reveal">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
                CURATED SPACES
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A130F] tracking-tight">
                Featured Collections
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
                Every collection is manufactured in our Shamsabad facility using seasoned timbers, kiln-dried joinery, and tailored upholstery fabrics.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/furniture')}
              className="shrink-0 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#8C5D36] hover:text-[#5F3E22] transition-colors group"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>

          {/* Asymmetric Luxury Category Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            {featuredCategories.slice(0, 4).map((cat, idx) => {
              // Create dynamic visual asymmetry: first item spans 7 columns, second 5, third 5, fourth 7
              const colSpan = idx === 0 || idx === 3 ? 'md:col-span-7' : 'md:col-span-5';
              const aspect = idx === 0 || idx === 3 ? 'aspect-[16/10]' : 'aspect-[4/3]';

              return (
                <div 
                  key={cat.id}
                  onClick={() => onNavigate(`/category/${cat.slug}`)}
                  className={`group relative rounded-3xl overflow-hidden bg-white border border-[#E7DFD2] hover:border-[#C5A880] cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between scroll-reveal delay-${((idx % 4) + 1) * 100} ${colSpan}`}
                >
                  <div className={`relative ${aspect} w-full overflow-hidden bg-[#F2ECE1]`}>
                    <SafeImage 
                      src={cat.image} 
                      alt={cat.name} 
                      className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-800 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-500" />
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 space-y-3 bg-white">
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#8C5D36] font-semibold block mb-1">
                        Collection 0{idx + 1}
                      </span>
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A130F] group-hover:text-[#8C5D36] transition-colors mb-1.5">
                        {cat.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed">
                        {cat.description || 'Kiln-seasoned hardwood joinery with bespoke sizing options.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#F2ECE1] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#8C5D36]">
                      <span>Explore {cat.name} Collection</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. CURATED MASTERPIECES: DEPTH-AWARE PRODUCT GRID WITH 3D TILT
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E8DFD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              PORTFOLIO SELECTIONS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A130F] tracking-tight">
              Curated Masterpieces
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
              Inspect individual handcrafted dining tables, bed sets, luxury sofas, and architectural accents ready for bespoke sizing.
            </p>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-2.5 scroll-reveal">
            <button
              onClick={() => setSelectedProductCategory('all')}
              className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                selectedProductCategory === 'all'
                  ? 'bg-[#1A130F] text-[#FAF6F0] shadow-md'
                  : 'bg-white border border-[#E7DFD2] text-stone-600 hover:text-[#1A130F] hover:border-[#8C5D36]'
              }`}
            >
              All Pieces
            </button>
            {categories.slice(0, 5).map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedProductCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  selectedProductCategory.toLowerCase() === cat.id.toLowerCase()
                    ? 'bg-[#1A130F] text-[#FAF6F0] shadow-md'
                    : 'bg-white border border-[#E7DFD2] text-stone-600 hover:text-[#1A130F] hover:border-[#8C5D36]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dynamic Depth-Aware Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenProduct={onOpenProduct}
              />
            ))}
          </div>

          <div className="text-center pt-6 scroll-reveal">
            <button 
              onClick={() => onNavigate('/furniture')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#1A130F] hover:bg-[#8C5D36] text-[#FAF6F0] text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.01]"
            >
              <span>Explore Complete 2026 Collection</span>
              <ArrowRight className="w-4 h-4 text-[#DFC06A]" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          5. CRAFTSMANSHIP & WORKSHOP STORYTELLING: SPLIT-SCREEN EDITORIAL
         ========================================================================= */}
      <section className="bg-[#18110D] py-20 sm:py-32 border-b border-[#302117] text-[#FAF6F0] relative overflow-hidden">
        
        {/* Soft atmospheric background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8C5D36]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Story Editorial Text */}
            <div className="lg:col-span-6 space-y-6 scroll-reveal">
              <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
                THE SHAMSABAD ATELIER
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] leading-tight">
                Generational Joinery, Kiln-Seasoned Timbers
              </h2>
              
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
                At Wood Care Furniture, we believe luxury is defined by what lies beneath the finish. In our Shamsabad workshop, master joiners inspect every log of Pakistani Sheesham, Burmese Teak, and Walnut for grain symmetry and moisture balance before joinery begins.
              </p>

              {/* Craftsmanship Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#221812] border border-[#443227] space-y-2">
                  <div className="flex items-center gap-2 text-[#C5A880]">
                    <Hammer className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Mortise & Tenon</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Zero reliance on fragile plastic fittings or superficial staples. Authentic wood-to-wood joinery.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#221812] border border-[#443227] space-y-2">
                  <div className="flex items-center gap-2 text-[#C5A880]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">Termite Treated</span>
                  </div>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Double vacuum pressure treatment protects every internal frame against pests for decades.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-7 py-3.5 bg-[#8C5D36] hover:bg-[#6D4323] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all shadow-md"
                >
                  Discover Our Workshop Heritage →
                </button>
              </div>
            </div>

            {/* Visual Photography Composition */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-[#443227] shadow-2xl bg-[#140F0C]">
                  <SafeImage 
                    src="/images/cat_living_room_1791186977406.jpg" 
                    alt="Master Woodcraftsmanship in Living Room" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-5 rounded-2xl bg-[#221812] border border-[#443227]">
                  <span className="text-2xl font-serif font-bold text-[#DFC06A] block">8–10%</span>
                  <span className="text-xs text-stone-400">Kiln Moisture Equilibrium to prevent wood warping in Twin Cities climates.</span>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-5 rounded-2xl bg-[#221812] border border-[#443227]">
                  <span className="text-2xl font-serif font-bold text-[#DFC06A] block">Molty Foam</span>
                  <span className="text-xs text-stone-400">High-resilience foam layers with multi-density support for posture comfort.</span>
                </div>
                <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-[#443227] shadow-2xl bg-[#140F0C]">
                  <SafeImage 
                    src="/images/cat_bedroom_1791186990246.jpg" 
                    alt="Solid Wood Bed Joinery" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          6. SEPARATE NAVIGATION CARDS: SERVICES & GUIDES
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E8DFD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Card 1: Our Services: Workshop Direct */}
          <div 
            onClick={() => onNavigate('/services')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('/services'); } }}
            className="group cursor-pointer bg-white border border-[#E7DFD2] hover:border-[#8C5D36] rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-2xl transition-all duration-400 flex flex-col md:flex-row md:items-center justify-between gap-6 scroll-reveal"
          >
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
                WHAT WE OFFER
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A130F] group-hover:text-[#8C5D36] transition-colors leading-tight">
                Our Services: Workshop Direct
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
                Comprehensive furniture manufacturing, architectural woodworking, custom upholstery, and interior wood care in the Twin Cities.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <span className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#8C5D36] group-hover:bg-[#6D4323] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all shadow-md group-hover:shadow-lg">
                <span>Open Our Services</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

          {/* Card 2: Guides & Articles */}
          <div 
            onClick={() => onNavigate('/blog')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate('/blog'); } }}
            className="group cursor-pointer bg-white border border-[#E7DFD2] hover:border-[#8C5D36] rounded-3xl p-8 sm:p-12 shadow-sm hover:shadow-2xl transition-all duration-400 flex flex-col md:flex-row md:items-center justify-between gap-6 scroll-reveal"
          >
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
                WOODWORKING KNOWLEDGE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A130F] group-hover:text-[#8C5D36] transition-colors leading-tight">
                Guides & Articles
              </h2>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
                Practical advice on wood moisture, termite seasoning, fabric choices, and upholstery maintenance in Pakistani homes.
              </p>
            </div>

            <div className="shrink-0 flex items-center">
              <span className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#1A130F] group-hover:bg-[#8C5D36] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all shadow-md group-hover:shadow-lg">
                <span>Open Guides & Articles</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          7. BESPOKE COMMISSIONS & CUSTOM FURNITURE PROCESS
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E8DFD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              BESPOKE ARCHITECTURAL CRAFT
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A130F] tracking-tight">
              Custom Furniture Commissions
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
              Bring your floor plans, sketches, Pinterest boards, or room dimensions directly to our Shamsabad workshop for collaborative design.
            </p>
          </div>

          {/* 4-Step Bespoke Journey */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Design Consultation',
                desc: 'Share your dimensions, Pinterest mood boards, or sketches directly on WhatsApp or in our showroom.'
              },
              {
                step: '02',
                title: 'Timber & Fabric Selection',
                desc: 'Select from seasoned Sheesham, Burmese Teak, and imported Turkish & Italian fabric swatches.'
              },
              {
                step: '03',
                title: 'Handcrafted in Workshop',
                desc: 'Our Shamsabad master artisans carve, join, sand, and finish every piece with mortise-and-tenon strength.'
              },
              {
                step: '04',
                title: 'White-Glove Setup',
                desc: 'Padded delivery, assembly, and precise placement in your residence anywhere in Rawalpindi or Islamabad.'
              }
            ].map((st, idx) => (
              <div 
                key={idx}
                className={`p-6 sm:p-7 rounded-3xl bg-white border border-[#E7DFD2] shadow-sm hover:border-[#8C5D36] transition-all duration-300 flex flex-col justify-between scroll-reveal delay-${(idx + 1) * 100}`}
              >
                <div className="space-y-3">
                  <span className="font-mono text-2xl font-bold text-[#C5A880] block">
                    {st.step}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#1A130F]">
                    {st.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2 scroll-reveal">
            <button
              onClick={() => onNavigate('/custom')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#8C5D36] hover:bg-[#6D4323] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase rounded-xl transition-all shadow-md hover:scale-[1.01]"
            >
              <span>Start Your Custom Commission Brief →</span>
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          8. COMPLETED SPACES & SHOWROOM GALLERY PREVIEW
         ========================================================================= */}
      <section className="bg-[#18110D] py-20 sm:py-28 border-b border-[#302117] text-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 scroll-reveal">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
                COMPLETED RESIDENCES & SHOWROOM
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] tracking-tight">
                Spaces Gallery
              </h2>
              <p className="text-sm sm:text-base text-stone-300 font-light">
                Real photographs of handcrafted furniture installed in luxury residences across Bahria Town, DHA, Islamabad, and Rawalpindi.
              </p>
            </div>

            <button
              onClick={() => onNavigate('/gallery')}
              className="shrink-0 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C5A880] hover:underline"
            >
              Explore Full Gallery ({gallery.length} Photos) →
            </button>
          </div>

          {/* Staggered Gallery Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gallery.slice(0, 3).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onNavigate('/gallery')}
                className={`group relative rounded-3xl overflow-hidden bg-[#241A14] border border-[#443227] hover:border-[#C5A880] cursor-pointer shadow-xl transition-all duration-500 hover:-translate-y-1.5 scroll-reveal delay-${(idx + 1) * 150}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#140F0C]">
                  <SafeImage 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-[#DFC06A] font-bold mb-1">
                    {item.category || (item as any).category_name || 'Shamsabad Showcase'}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1 mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          9. CLIENT REVIEWS & VERIFIED TESTIMONIALS
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E8DFD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              VERIFIED CLIENT FEEDBACK
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A130F] tracking-tight">
              Testimonials from the Twin Cities
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed max-w-xl mx-auto">
              Read authentic feedback from homeowners who commissioned bespoke living suites, dining tables, and solid wood bedroom furniture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {approvedReviews.slice(0, 3).map((rev, idx) => (
              <div 
                key={rev.id} 
                className={`bg-white p-7 sm:p-8 rounded-3xl border border-[#E7DFD2] flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-[#8C5D36] transition-all duration-300 scroll-reveal delay-${(idx + 1) * 100}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-[#DFC06A]">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <span key={i} className="text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed italic">
                    "{rev.review_text}"
                  </p>
                </div>

                <div className="pt-5 border-t border-[#F2ECE1] mt-6 flex items-center justify-between text-xs text-stone-500">
                  <div>
                    <span className="font-bold text-[#1A130F] text-sm block">{rev.author_name}</span>
                    <span className="text-stone-500">{rev.location}</span>
                  </div>
                  <span className="text-stone-400 font-mono">{rev.created_at}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2 scroll-reveal">
            <button 
              onClick={() => onNavigate('/reviews')}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#8C5D36] hover:underline"
            >
              Read All Reviews & Share Your Experience →
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          10. FREQUENTLY ASKED QUESTIONS
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E8DFD2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              HELPFUL ANSWERS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A130F] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Transparent answers regarding timber seasoning, bespoke manufacturing timelines, delivery, and guarantees.
            </p>
          </div>

          <div className="space-y-3.5">
            {faqs.slice(0, 5).map((faq, idx) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`bg-white border transition-all duration-300 rounded-2xl overflow-hidden shadow-xs ${
                    isOpen ? 'border-[#8C5D36]' : 'border-[#E7DFD2] hover:border-[#C5A880]'
                  } scroll-reveal delay-${(idx + 1) * 75}`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-lg sm:text-xl font-bold text-[#1A130F]"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#8C5D36] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-[#F2ECE1] pt-4 font-light">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => onNavigate('/faq')}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#8C5D36] hover:underline"
            >
              View Complete FAQ Center →
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          11. SHOWROOM & WORKSHOP CONCIERGE: SHAMSABAD LOCATION
         ========================================================================= */}
      <section className="bg-[#FAF8F5] py-20 sm:py-28 text-[#1A130F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 scroll-reveal">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#8C5D36] font-bold block">
              VISIT OUR WORKSHOP
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A130F] tracking-tight">
              Shamsabad Workshop & Showroom
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
              Experience solid timber quality firsthand, inspect joinery, test foam densities, and consult directly with our master woodworkers.
            </p>
          </div>

          <div className="bg-white border border-[#E7DFD2] rounded-3xl p-8 sm:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center scroll-reveal">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1A130F]">
                M33J+C6H, Shamsabad, Rawalpindi
              </h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
                We warmly welcome homeowners, interior designers, and architects from across Islamabad and Rawalpindi. Witness our kiln-seasoning processes, review upholstery books, and place custom orders directly at factory prices.
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
                  className="px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp for Live Location</span>
                </a>

                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-7 py-3.5 bg-[#1A130F] hover:bg-[#8C5D36] text-white font-semibold rounded-xl text-xs sm:text-sm transition-all"
                >
                  Contact & Directions Page →
                </button>
              </div>
            </div>

            <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#E7DFD2] bg-[#FAF8F5]">
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
