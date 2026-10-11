import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface HorizontalProductCarouselProps {
  products: Product[];
  onOpenProduct: (slug: string) => void;
  title?: string;
  subtitle?: string;
  autoScrollSpeed?: number; // pixels per tick
  showControls?: boolean;
}

export const HorizontalProductCarousel: React.FC<HorizontalProductCarouselProps> = ({
  products,
  onOpenProduct,
  title,
  subtitle,
  autoScrollSpeed = 0.8,
  showControls = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const animFrameRef = useRef<number | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setIsAutoScrollEnabled(false);
      }
    }
  }, []);

  // Check scroll boundary to enable/disable arrow buttons
  const checkScrollBounds = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  // Continuous smooth auto-scrolling animation
  useEffect(() => {
    if (!isAutoScrollEnabled || isPaused || products.length <= 1) return;

    let lastTimestamp = performance.now();

    const step = (timestamp: number) => {
      const el = containerRef.current;
      if (!el) return;

      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;

      // Advance scroll position smoothly based on time elapsed
      if (elapsed > 0 && elapsed < 100) {
        const delta = (autoScrollSpeed * elapsed) / 16.67; // normalize to 60fps
        el.scrollLeft += delta;

        // Loop seamlessly to start when reaching end
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollLeft = 0;
        }
      }

      checkScrollBounds();
      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isAutoScrollEnabled, isPaused, autoScrollSpeed, products.length, checkScrollBounds]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScrollBounds, 350);
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative py-2">
      {/* Optional Title Bar with controls */}
      {(title || showControls) && (
        <div className="flex items-center justify-between gap-4 mb-4 sm:mb-6">
          <div>
            {title && (
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#241A14] flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs font-mono font-normal bg-[#8C5D36]/10 text-[#8C5D36] px-2.5 py-0.5 rounded-full">
                  {products.length} {products.length === 1 ? 'item' : 'items'}
                </span>
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {showControls && products.length > 2 && (
            <div className="flex items-center gap-2">
              {/* Play/Pause Auto-scroll toggle */}
              <button
                type="button"
                onClick={() => setIsAutoScrollEnabled(prev => !prev)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD3C2] bg-white text-stone-700 hover:text-[#8C5D36] text-xs font-medium transition-colors shadow-xs"
                title={isAutoScrollEnabled ? "Pause automatic animation" : "Resume automatic animation"}
              >
                {isAutoScrollEnabled ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#8C5D36]" />
                    <span className="text-[11px]">Auto Moving</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#8C5D36]" />
                    <span className="text-[11px]">Paused</span>
                  </>
                )}
              </button>

              {/* Prev Button */}
              <button
                type="button"
                onClick={() => handleManualScroll('left')}
                disabled={!canScrollLeft}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-[#DDD3C2] text-stone-700 hover:text-[#8C5D36] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => handleManualScroll('right')}
                disabled={!canScrollRight}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#8C5D36] text-white hover:bg-[#724827] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Single-Row Horizontal Scrolling Carousel Track */}
      <div className="relative group/carousel">
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            // Keep paused briefly after touch, then resume
            setTimeout(() => setIsPaused(false), 2000);
          }}
          onScroll={checkScrollBounds}
          className="flex flex-row flex-nowrap items-stretch gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 px-1 select-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[280px] sm:w-[320px] md:w-[350px] shrink-0 transition-transform duration-300"
            >
              <ProductCard
                product={product}
                onOpenProduct={onOpenProduct}
              />
            </div>
          ))}
        </div>

        {/* Subtle Edge Fade Gradients for continuous feeling */}
        <div className="pointer-events-none absolute inset-y-4 left-0 w-8 bg-gradient-to-r from-[#FAF7F2] to-transparent opacity-80" />
        <div className="pointer-events-none absolute inset-y-4 right-0 w-8 bg-gradient-to-l from-[#FAF7F2] to-transparent opacity-80" />
      </div>

      {/* Helpful Hint on Mobile */}
      <div className="sm:hidden flex items-center justify-between text-[11px] text-stone-500 pt-1 px-1 font-medium">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#8C5D36]" /> Swipe horizontally to view all {products.length} models
        </span>
        <div className="flex gap-1.5">
          <button 
            onClick={() => handleManualScroll('left')}
            className="px-2 py-0.5 rounded bg-white border border-[#DDD3C2] text-xs font-bold"
          >
            ←
          </button>
          <button 
            onClick={() => handleManualScroll('right')}
            className="px-2 py-0.5 rounded bg-[#8C5D36] text-white text-xs font-bold"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};
