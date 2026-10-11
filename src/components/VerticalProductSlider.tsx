import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown, Play, Pause, Sparkles, MessageCircle, Layers, Eye } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface VerticalProductSliderProps {
  products: Product[];
  onOpenProduct: (slug: string) => void;
  autoPlayInterval?: number; // milliseconds per slide transition (default 4000ms)
}

export const VerticalProductSlider: React.FC<VerticalProductSliderProps> = ({
  products,
  onOpenProduct,
  autoPlayInterval = 4000
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [itemsPerSlide, setItemsPerSlide] = useState(3);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive items per slide:
  // Mobile (< 640px): 1 product per slide
  // Tablet (640px - 1024px): 2 products per slide
  // Desktop (>= 1024px): 3 products per slide
  useEffect(() => {
    const updateItemsPerSlide = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setItemsPerSlide(1);
      } else if (width < 1024) {
        setItemsPerSlide(2);
      } else {
        setItemsPerSlide(3);
      }
    };

    updateItemsPerSlide();
    window.addEventListener('resize', updateItemsPerSlide);
    return () => window.removeEventListener('resize', updateItemsPerSlide);
  }, []);

  // Split products into pages/slides WITHOUT DUPLICATION
  // Each product appears strictly ONCE!
  const slides = React.useMemo(() => {
    if (!products || products.length === 0) return [];
    const chunks: Product[][] = [];
    for (let i = 0; i < products.length; i += itemsPerSlide) {
      chunks.push(products.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [products, itemsPerSlide]);

  const totalSlides = slides.length;

  // Reset to first slide if current index exceeds new bounds
  useEffect(() => {
    if (currentSlideIndex >= totalSlides && totalSlides > 0) {
      setCurrentSlideIndex(0);
    }
  }, [currentSlideIndex, totalSlides]);

  // Reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setIsAutoPlayEnabled(false);
      }
    }
  }, []);

  // Navigation handlers
  const goToNextSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevSlide = useCallback(() => {
    if (totalSlides <= 1) return;
    setCurrentSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Auto-slide timer (vertical slide transition)
  useEffect(() => {
    if (!isAutoPlayEnabled || isPaused || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      goToNextSlide();
    }, autoPlayInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlayEnabled, isPaused, totalSlides, autoPlayInterval, goToNextSlide]);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartY(e.targetTouches[0].clientY);
    setTouchEndY(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (touchStartY !== null && touchEndY !== null) {
      const diffY = touchStartY - touchEndY;
      // If swiped up significantly (more than 40px), advance to next slide
      if (diffY > 40) {
        goToNextSlide();
      } else if (diffY < -40) {
        goToPrevSlide();
      }
    }
    setTouchStartY(null);
    setTouchEndY(null);
    // Resume auto-slide after 2.5s
    setTimeout(() => setIsPaused(false), 2500);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative select-none">
      
      {/* Top Slider Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 px-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8C5D36] animate-pulse" />
          <span>
            Vertical Slider · Showing <strong className="text-[#241A14]">{products.length}</strong> handcrafted model{products.length === 1 ? '' : 's'}
          </span>
          {totalSlides > 1 && (
            <span className="bg-[#8C5D36]/10 text-[#8C5D36] font-semibold px-2 py-0.5 rounded-md text-[11px]">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
          )}
        </div>

        {totalSlides > 1 && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Autoplay Play/Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsAutoPlayEnabled(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD3C2] bg-white text-stone-700 hover:text-[#8C5D36] text-xs font-medium transition-all shadow-xs hover:border-[#8C5D36]"
              title={isAutoPlayEnabled ? "Pause automatic slide animation" : "Resume automatic slide animation"}
            >
              {isAutoPlayEnabled && !isPaused ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-[#8C5D36]" />
                  <span className="text-[11px] font-semibold">Auto-Sliding</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-[#8C5D36]" />
                  <span className="text-[11px] font-semibold">Paused</span>
                </>
              )}
            </button>

            {/* Up Button (Previous Slide) */}
            <button
              type="button"
              onClick={goToPrevSlide}
              className="w-9 h-9 rounded-xl bg-white border border-[#DDD3C2] text-stone-700 hover:text-[#8C5D36] hover:border-[#8C5D36] transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Previous slide"
              title="Previous slide (up)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Down Button (Next Slide) */}
            <button
              type="button"
              onClick={goToNextSlide}
              className="w-9 h-9 rounded-xl bg-[#8C5D36] text-white hover:bg-[#724827] transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Next slide"
              title="Next slide (down)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Vertical Carousel Viewport */}
      <div 
        ref={sliderRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative overflow-hidden rounded-3xl bg-[#FAF8F5] border border-[#EAE2D5] shadow-sm p-3 sm:p-6"
      >
        {/* Animated Vertical Slides Container */}
        <div 
          className="w-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `translateY(-${currentSlideIndex * 100}%)`,
          }}
        >
          {slides.map((slideProducts, slideIdx) => (
            <div 
              key={`slide-${slideIdx}`}
              className="w-full py-2"
              style={{
                // Each slide occupies exactly 100% height when active
                opacity: slideIdx === currentSlideIndex ? 1 : 0.4,
                transition: 'opacity 0.5s ease',
              }}
            >
              <div className={`grid gap-5 sm:gap-6 ${
                itemsPerSlide === 1 
                  ? 'grid-cols-1 max-w-md mx-auto' 
                  : itemsPerSlide === 2 
                    ? 'grid-cols-1 sm:grid-cols-2' 
                    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              }`}>
                {slideProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="transform transition-transform duration-300 hover:-translate-y-1"
                  >
                    <ProductCard
                      product={product}
                      onOpenProduct={onOpenProduct}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Slide Position Dots Navigation */}
        {totalSlides > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-4 pb-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all rounded-full ${
                  currentSlideIndex === idx
                    ? 'w-6 h-2 bg-[#8C5D36]'
                    : 'w-2 h-2 bg-[#DDD3C2] hover:bg-[#8C5D36]/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Helpful Hint on Mobile */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-3 px-1 font-medium">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#8C5D36]" /> 
          {totalSlides > 1 ? 'Vertical auto-slides every 4s · Hover or swipe to navigate' : 'All handcrafted models displayed'}
        </span>
        {totalSlides > 1 && (
          <span className="text-stone-400">
            Swipe up/down anytime
          </span>
        )}
      </div>

    </div>
  );
};
