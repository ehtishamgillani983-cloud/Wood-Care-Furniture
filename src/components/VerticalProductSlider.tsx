import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Play, Pause, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface VerticalProductSliderProps {
  products: Product[];
  onOpenProduct: (slug: string) => void;
  speed?: number; // pixels per frame at 60fps
}

export const VerticalProductSlider: React.FC<VerticalProductSliderProps> = ({
  products,
  onOpenProduct,
  speed = 0.65
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const animFrameRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // If list is small, duplicate to allow continuous seamless upward looping
  const displayProducts = React.useMemo(() => {
    if (products.length === 0) return [];
    if (products.length <= 6) {
      return [...products, ...products, ...products];
    }
    return [...products, ...products];
  }, [products]);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setIsAutoPlayEnabled(false);
      }
    }
  }, []);

  // Continuous smooth vertical upward sliding animation
  useEffect(() => {
    if (!isAutoPlayEnabled || isPaused || products.length === 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();

    const step = (now: number) => {
      const el = containerRef.current;
      if (!el) return;

      const elapsed = now - lastTime;
      lastTime = now;

      if (elapsed > 0 && elapsed < 100) {
        // Advance scroll position upward (content moves up by increasing scrollTop)
        const delta = (speed * elapsed) / 16.67;
        el.scrollTop += delta;

        // When scrolled past half the content height, wrap around seamlessly
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxScroll > 50 && el.scrollTop >= maxScroll - 5) {
          // Wrap back to beginning without visual jump
          el.scrollTop = 2;
        }
      }

      animFrameRef.current = requestAnimationFrame(step);
    };

    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isAutoPlayEnabled, isPaused, speed, products.length]);

  // Pause on manual touch and auto-resume after inactivity
  const handleTouchStart = () => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const handleTouchEnd = () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2800);
  };

  const handleWheel = () => {
    setIsPaused(true);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  const scrollByAmount = (direction: 'up' | 'down') => {
    const el = containerRef.current;
    if (!el) return;
    const amount = direction === 'up' ? -el.clientHeight * 0.65 : el.clientHeight * 0.65;
    el.scrollBy({ top: amount, behavior: 'smooth' });
  };

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="w-full relative">
      {/* Top Slider Control Bar */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 px-1">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#8C5D36] animate-pulse" />
          <span>
            Auto-sliding {products.length} handcrafted model{products.length === 1 ? '' : 's'}
          </span>
          <span className="text-stone-400 hidden sm:inline">·</span>
          <span className="text-stone-400 text-xs hidden sm:inline">
            Hover or touch to pause & inspect
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Autoplay toggle */}
          <button
            type="button"
            onClick={() => setIsAutoPlayEnabled(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DDD3C2] bg-white text-stone-700 hover:text-[#8C5D36] text-xs font-medium transition-colors shadow-xs"
            title={isAutoPlayEnabled ? "Pause vertical auto-slide" : "Start vertical auto-slide"}
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

          {/* Manual Scroll Up Button */}
          <button
            type="button"
            onClick={() => scrollByAmount('up')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#DDD3C2] text-stone-700 hover:text-[#8C5D36] transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
            aria-label="Scroll products upward"
            title="Scroll up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Manual Scroll Down Button */}
          <button
            type="button"
            onClick={() => scrollByAmount('down')}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#DDD3C2] text-stone-700 hover:text-[#8C5D36] transition-all shadow-xs flex items-center justify-center hover:scale-105 active:scale-95"
            aria-label="Scroll products downward"
            title="Scroll down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Vertical Auto-Sliding Viewport Container */}
      <div className="relative group/slider rounded-3xl bg-[#FAF8F5]/80 p-2 sm:p-5 border border-[#EAE2D5] shadow-xs">
        
        {/* Top Gradient Fade Edge */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 sm:h-14 bg-gradient-to-b from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent z-10 rounded-t-3xl" />

        {/* Scrollable Products Track */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
          className="overflow-y-auto max-h-[640px] sm:max-h-[760px] lg:max-h-[840px] no-scrollbar scroll-smooth py-6 px-1 sm:px-2 space-y-6 sm:space-y-8"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* Responsive Multi-column Grid that slides upward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayProducts.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="transform transition-transform duration-300 hover:scale-[1.01]"
              >
                <ProductCard
                  product={product}
                  onOpenProduct={onOpenProduct}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Gradient Fade Edge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-14 bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/70 to-transparent z-10 rounded-b-3xl" />
      </div>

      {/* Mobile Hint */}
      <div className="sm:hidden flex items-center justify-between text-[11px] text-stone-500 pt-3 px-1 font-medium">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#8C5D36]" /> Products slide upward automatically
        </span>
        <span>Swipe up/down anytime</span>
      </div>
    </div>
  );
};
