import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  MessageCircle, 
  MapPin, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Phone,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Layers,
  Sparkles,
  Hammer,
  Ruler,
  Truck
} from 'lucide-react';
import { useStoreData } from '../hooks/useStore';
import { ProductCard } from '../components/ProductCard';
import { SafeImage, resolveSafeImageUrl } from '../components/SafeImage';
import { BackgroundVisual } from '../components/BackgroundVisual';
import { 
  getGeneralWhatsAppLink, 
  getCustomQuoteWhatsAppLink 
} from '../utils/whatsapp';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenProduct: (slug: string) => void;
}

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
    faqs 
  } = useStoreData();

  const heroImages = settings.hero_images && settings.hero_images.length > 0 
    ? settings.hero_images 
    : [
        "/images/hero_luxury_living.jpg",
        "/images/cat_living_room.jpg",
        "/images/cat_bedroom.jpg",
        "/images/cat_dining.jpg",
        "/images/cat_custom_chair.jpg"
      ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0]?.id || null);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const featuredProducts = products.filter(p => p.featured).slice(0, 6);
  const featuredCategories = categories.filter(c => c.is_featured !== false && c.is_active !== false);
  const approvedReviews = reviews.filter(r => r.is_approved);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 bg-[#15100D] text-[#FAF6F0]">
      
      {/* 1. CINEMATIC HERO SECTION WITH RESPONSIVE MOBILE CROPPING & SMOOTH SLIDESHOW */}
      <section className="relative min-h-[520px] sm:min-h-[640px] lg:min-h-[760px] flex items-center justify-center overflow-hidden bg-[#160F0C]">
        {/* Slideshow background images */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((imgUrl, index) => {
            const isCurrent = index === currentSlide;
            return (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isCurrent ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                {/* 
                  MOBILE CROP FIX:
                  - Mobile: object-[center_32%] with portrait-friendly centering ensures sofas & beds are prominently visible.
                  - Desktop: object-center landscape presentation.
                  - Subtle slow zoom effect (scale-100 to scale-105).
                */}
                <img 
                  src={resolveSafeImageUrl(imgUrl)} 
                  alt="Wood Care Furniture Showroom Collection" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80';
                  }}
                  className={`w-full h-full object-cover object-[center_30%] sm:object-center transition-transform duration-[6000ms] ease-out ${
                    isCurrent ? 'scale-105' : 'scale-100'
                  }`}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  {...(index === 0 ? { fetchPriority: "high" as const } : {})}
                />
              </div>
            );
          })}

          {/* Balanced gradient scrim: crisp typography without obscuring the furniture */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35" />
        </div>

        {/* Hero Slideshow Controls: Prev / Next */}
        {heroImages.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white items-center justify-center backdrop-blur-sm border border-white/10 transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNextSlide}
              className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white items-center justify-center backdrop-blur-sm border border-white/10 transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Hero Content with Prominent Hierarchy */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center text-white space-y-6 sm:space-y-8">
          
          {/* Location Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#221812]/90 border border-[#768A7D]/50 backdrop-blur-md text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#C5A880] shadow-lg">
            <MapPin className="w-4 h-4 text-[#768A7D]" />
            <span>{settings.brand_name.toUpperCase()} · RAWALPINDI & ISLAMABAD</span>
          </div>

          {/* Large Hero Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#FAF6F0] max-w-4xl mx-auto leading-[1.08] text-balance">
            {settings.hero_heading || 'Furniture Designed for Beautiful Living'}
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl text-stone-200 font-normal max-w-2xl mx-auto leading-relaxed">
            {settings.hero_subheading || 'Premium handcrafted furniture for homes, offices and commercial spaces across Rawalpindi and Islamabad.'}
          </p>

          {/* CTAs: Inquiry Based (No Cart / Checkout) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/furniture')}
              className="w-full sm:w-auto px-8 py-4 bg-[#768A7D] hover:bg-[#5C7367] text-white font-semibold text-sm sm:text-base rounded-2xl transition-luxury shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <span>Explore Furniture Collections</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold text-sm sm:text-base rounded-2xl transition-luxury shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>

          {/* Slideshow Indicator Dots */}
          {heroImages.length > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-8 bg-[#C5A880]' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* 2. FURNITURE CATEGORIES SECTION - BIGGER & IN MIDDLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            OUR CURATED SPACES
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] tracking-tight">
            Furniture Categories
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl mx-auto">
            Discover handcrafted collections built from termite-proof seasoned hardwoods, high-density comfort foam, and custom fabrics.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {featuredCategories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => onNavigate(`/category/${cat.slug}`)}
              className="group relative rounded-3xl overflow-hidden bg-[#221812] border border-[#443227] hover:border-[#768A7D] cursor-pointer transition-luxury hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#15100D]">
                <SafeImage 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              <div className="p-6 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#FAF6F0] group-hover:text-[#C5A880] transition-colors mb-1.5">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#443227] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#C5A880]">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-10">
          <button 
            onClick={() => onNavigate('/furniture')}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#221812] hover:bg-[#2A1D16] border border-[#443227] hover:border-[#768A7D] text-[#FAF6F0] text-xs sm:text-sm font-semibold rounded-2xl transition-colors shadow-md"
          >
            <span>View All Categories & Subcategories</span>
            <ArrowRight className="w-4 h-4 text-[#C5A880]" />
          </button>
        </div>
      </section>

      {/* 3. FEATURED FURNITURE SHOWCASE - BIGGER & IN MIDDLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            HANDCRAFTED EXCELLENCE
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0] tracking-tight">
            Featured Furniture
          </h2>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl mx-auto">
            Every piece is built to order in our Shamsabad workshop with seasoned hardwoods, precision craftsmanship, and tailored custom options.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.map((prod) => (
            <ProductCard 
              key={prod.id} 
              product={prod} 
              onOpenProduct={onOpenProduct} 
            />
          ))}
        </div>
      </section>

      {/* 4. CUSTOM FURNITURE SPOTLIGHT WITH SUBTLE ATMOSPHERIC WORKSHOP BACKGROUND */}
      <section className="relative overflow-hidden py-12">
        {/* Subtle atmospheric background visual with dark luxury overlay */}
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
          <SafeImage
            src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1600&q=80"
            alt="Woodworking workshop atmosphere"
            className="w-full h-full object-cover filter blur-[2px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
              BESPOKE COMMISSIONS
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
              Custom Furniture: Made Around Your Space
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
              Bring your Pinterest inspiration, architectural blueprints, or sketches. We manufacture bespoke furniture to your exact measurements.
            </p>
          </div>

          <div className="bg-[#221812]/95 backdrop-blur-sm text-white rounded-3xl overflow-hidden border border-[#443227] shadow-2xl grid grid-cols-1 lg:grid-cols-2">
            
            {/* Image Showcase */}
            <div className="relative bg-[#15100D] min-h-[380px] lg:min-h-full flex items-center justify-center p-8 sm:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#443227]">
              <SafeImage 
                src="/images/cat_custom_chair.jpg" 
                alt="Sculptural Arch Rocking Chair" 
                className="max-h-[460px] w-auto object-contain rounded-2xl shadow-2xl transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute top-5 left-5 bg-[#C5A880] text-[#15100D] text-[11px] uppercase font-bold tracking-widest px-3 py-1 rounded-md shadow-md">
                Signature Bespoke Creation
              </div>
            </div>

            {/* Copy & Custom Action */}
            <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#FAF6F0] leading-tight">
                  Crafted to Your Exact Specifications
                </h3>

                <p className="text-sm sm:text-base text-stone-300 leading-relaxed pt-1">
                  Featured here is our signature continuous arch rocking lounge chair: steam-bent seasoned walnut paired with an integrated ambient luminaire arch and plush emerald green velvet seating.
                </p>

                <div className="space-y-3 pt-3 text-xs sm:text-sm text-stone-200">
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Bring any Pinterest photo, architectural drawing, or sketch</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Choice of solid Sheesham (Tahli), Burmese Teak, or American Walnut</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Tailored upholstery from 120+ imported textured fabrics & velvets</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Check className="w-4 h-4 text-[#C5A880] shrink-0" />
                    <span>Direct factory advantage with no middleman retail markup</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <a
                  href={getCustomQuoteWhatsAppLink(settings.whatsapp, settings.brand_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold text-xs sm:text-sm rounded-xl transition-luxury flex items-center justify-center gap-2 shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enquire on WhatsApp</span>
                </a>

                <button
                  onClick={() => onNavigate('/custom')}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-[#FAF6F0] font-semibold text-xs sm:text-sm rounded-xl transition-luxury text-center"
                >
                  Custom Order Process →
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 5. ABOUT US SECTION WITH SUBTLE INTERIOR BACKGROUND ATMOSPHERE */}
      <section className="relative overflow-hidden py-12">
        {/* Subtle background interior atmosphere */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <SafeImage
            src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&w=1600&q=80"
            alt="Interior showroom background"
            className="w-full h-full object-cover filter blur-[3px]"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
              HERITAGE & CRAFTSMANSHIP
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
              About Us: Crafted for Beautiful Living
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
              Discover the legacy of seasoned solid wood manufacturing, in-house joinery, and direct wholesale pricing in Shamsabad, Rawalpindi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FAF6F0] leading-snug">
                Furniture Built to Endure Across Generations
              </h3>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                At {settings.brand_name}, we operate both our dedicated manufacturing workshop and customer showroom in Shamsabad, Rawalpindi. We believe furniture should not be disposable. Every dining table, master bed suite, and curved sofa is handcrafted by artisans who understand wood seasoning, mortise-and-tenon structural joinery, and ergonomic luxury.
              </p>

              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                By working directly with us—the manufacturer—you avoid retail middlemen markups, have complete freedom to customize dimensions and upholstery fabrics, and receive direct personal oversight on every order.
              </p>

              <div className="pt-2 flex items-center gap-6 sm:gap-8">
                <div>
                  <span className="font-serif text-3xl font-bold text-[#C5A880] block">100%</span>
                  <span className="text-xs sm:text-sm text-stone-400">Kiln Seasoned Timber</span>
                </div>
                <div className="h-10 w-px bg-[#443227]" />
                <div>
                  <span className="font-serif text-3xl font-bold text-[#C5A880] block">Bespoke</span>
                  <span className="text-xs sm:text-sm text-stone-400">Custom Dimensions</span>
                </div>
                <div className="h-10 w-px bg-[#443227]" />
                <div>
                  <span className="font-serif text-3xl font-bold text-[#C5A880] block">Direct</span>
                  <span className="text-xs sm:text-sm text-stone-400">Factory Advantage</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('/about')}
                  className="px-7 py-3.5 bg-[#768A7D] hover:bg-[#5C7367] text-white rounded-xl text-xs sm:text-sm font-semibold transition-luxury shadow-md"
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
                  className="rounded-3xl object-cover aspect-[4/5] w-full shadow-lg border border-[#443227]"
                />
                <div className="p-5 bg-[#221812] rounded-3xl border border-[#443227]">
                  <h4 className="font-serif text-base font-bold text-[#FAF6F0] mb-1">
                    Termite-Proof Assurance
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Every wood beam is chemically conditioned against borers and termites.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-8">
                <div className="p-5 bg-[#221812] rounded-3xl border border-[#443227]">
                  <h4 className="font-serif text-base font-bold text-[#FAF6F0] mb-1">
                    High-Density Molty Foam
                  </h4>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Resilient cushioning that retains shape for years without sagging.
                  </p>
                </div>
                <SafeImage 
                  src="/images/cat_bedroom.jpg" 
                  alt="Solid Wood Bed Craftsmanship" 
                  className="rounded-3xl object-cover aspect-[4/5] w-full shadow-lg border border-[#443227]"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. COMPLETED SPACES GALLERY SECTION WITH SUBTLE ARCHITECTURAL INTERIOR BACKGROUND */}
      <BackgroundVisual 
        imageSrc="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"
        opacityClassName="opacity-10"
        className="bg-[#120D0A] py-24 border-y border-[#31231B]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
              PORTFOLIO SHOWCASE
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
              Spaces Gallery: Our Furniture Collection
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
              Real residence and drawing room installations delivered across Islamabad, DHA, Bahria Town, and Rawalpindi.
            </p>
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {gallery.slice(0, 3).map((item) => (
              <div 
                key={item.id}
                onClick={() => onNavigate('/gallery')}
                className="group relative rounded-3xl overflow-hidden bg-[#221812] aspect-[4/3] cursor-pointer shadow-xl border border-[#443227] hover:border-[#768A7D]"
              >
                <SafeImage 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold mb-1">
                    {item.category || (item as any).category_name || 'Showroom'}
                  </span>
                  <h3 className="font-serif text-xl font-bold leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-300 line-clamp-1 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-10">
            <button 
              onClick={() => onNavigate('/gallery')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#221812] hover:bg-[#2A1D16] border border-[#443227] hover:border-[#768A7D] text-[#FAF6F0] text-xs sm:text-sm font-semibold rounded-2xl transition-colors shadow-md"
            >
              <span>Explore All Gallery Spaces</span>
              <ArrowRight className="w-4 h-4 text-[#C5A880]" />
            </button>
          </div>
        </div>
      </BackgroundVisual>

      {/* 7. OUR SERVICES WITH SUBTLE WOODWORKING TEXTURE BACKGROUND */}
      <BackgroundVisual
        imageSrc="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80"
        opacityClassName="opacity-10"
        className="py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
              WHAT WE OFFER
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
              Our Services: Workshop Direct
            </h2>
            <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
              Comprehensive furniture manufacturing, architectural woodworking, and interior wood care in the Twin Cities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <div 
                key={service.id}
                className="bg-[#221812]/90 backdrop-blur-xs border border-[#443227] rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#768A7D] transition-luxury hover:-translate-y-1 shadow-md"
              >
                <div>
                  <h3 className="font-serif text-2xl font-bold text-[#FAF6F0] mb-2 leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
                    {service.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#443227] flex items-center justify-between text-xs font-semibold text-[#C5A880]">
                  <span>Inquire on WhatsApp</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </BackgroundVisual>

      {/* 8. CLIENT REVIEWS - BIGGER & IN MIDDLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
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
          {approvedReviews.slice(0, 3).map((rev) => (
            <div key={rev.id} className="bg-[#221812] p-7 rounded-3xl border border-[#443227] flex flex-col justify-between shadow-lg">
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

        <div className="text-center pt-8">
          <button 
            onClick={() => onNavigate('/reviews')}
            className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#C5A880] hover:underline"
          >
            Read More Reviews & Submit Yours →
          </button>
        </div>
      </section>

      {/* 9. BLOG & GUIDES - BIGGER & IN MIDDLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            WOODWORKING KNOWLEDGE
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
            Guides & Articles
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
            Practical advice on wood moisture, termite seasoning, and upholstery maintenance in Pakistani homes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.slice(0, 2).map((post) => (
            <div 
              key={post.id}
              onClick={() => onNavigate('/blog')}
              className="bg-[#221812] border border-[#443227] hover:border-[#768A7D] rounded-3xl overflow-hidden cursor-pointer transition-luxury hover:shadow-xl flex flex-col justify-between"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-[#15100D]">
                <SafeImage src={post.featured_image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 space-y-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#C5A880]">{post.category} · {post.read_time}</span>
                <h2 className="font-serif text-2xl font-bold text-[#FAF6F0] leading-snug">{post.title}</h2>
                <p className="text-xs sm:text-sm text-stone-300 line-clamp-2 leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="p-6 pt-0 border-t border-[#443227] flex items-center justify-between text-xs font-semibold text-[#C5A880]">
                <span>Read Full Guide</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. FAQ SECTION - BIGGER & IN MIDDLE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 space-y-3">
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            COMMON INQUIRIES
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
            Everything you need to know about customizing furniture, delivery, and guarantees.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.slice(0, 5).map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-[#221812] border border-[#443227] rounded-3xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-serif text-lg sm:text-xl font-bold text-[#FAF6F0]"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#C5A880] shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-stone-300 leading-relaxed border-t border-[#443227] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. VIP INTERIOR CONSULTATION CTA WITH CINEMATIC SHOWROOM VISUAL */}
      <BackgroundVisual
        imageSrc="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80"
        opacityClassName="opacity-20"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 rounded-3xl bg-[#221812] border border-[#443227] shadow-2xl"
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
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
              className="w-full sm:w-auto px-8 py-4 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] hover:border-[#768A7D] text-[#FAF6F0] font-semibold text-sm sm:text-base rounded-2xl transition-luxury"
            >
              Explore Custom Woodworking →
            </button>
          </div>
        </div>
      </BackgroundVisual>

      {/* 12. SHOWROOM & WORKSHOP LOCATION - BIGGER & IN MIDDLE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs sm:text-sm uppercase tracking-[0.28em] text-[#C5A880] font-bold block">
            VISIT OUR WORKSHOP
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#FAF6F0]">
            Showroom & Factory: Shamsabad, Rawalpindi
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
            Experience the solid timber quality, test sofa comfort layers, and consult directly with our master woodworkers.
          </p>
        </div>

        <div className="bg-[#221812] border border-[#443227] rounded-3xl p-8 sm:p-12 shadow-2xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h3 className="font-serif text-3xl font-bold text-[#FAF6F0]">
              M33J+C6H, Shamsabad, Rawalpindi
            </h3>
            <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
              We welcome clients from across Islamabad, Rawalpindi, and surrounding areas. Come see wood seasoning in progress, view foam layers, and select from our imported fabric swatches.
            </p>

            <div className="space-y-3 text-xs sm:text-sm text-stone-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#C5A880] shrink-0" />
                <span>{settings.address || 'M33J+C6H, Shamsabad, Rawalpindi, Pakistan (46000)'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C5A880] shrink-0" />
                <span>Phone: {settings.phone} · WhatsApp: {settings.whatsapp}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={getGeneralWhatsAppLink(settings.whatsapp, settings.brand_name)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-black font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp for Directions</span>
              </a>

              <button
                onClick={() => onNavigate('/contact')}
                className="px-6 py-3.5 bg-[#2A1D16] hover:bg-[#38271E] border border-[#443227] text-stone-200 font-semibold rounded-2xl text-xs sm:text-sm"
              >
                Contact & Showroom Page →
              </button>
            </div>
          </div>

          <div className="aspect-[16/10] w-full rounded-2xl overflow-hidden border border-[#443227] bg-[#15100D]">
            <iframe
              title="Wood Care Furniture Google Maps Location"
              src="https://maps.google.com/maps?q=Shamsabad%20Rawalpindi&t=&z=14&ie=UTF8&iwloc=&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

    </div>
  );
};
