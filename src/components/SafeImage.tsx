import React, { useState } from 'react';
import { Armchair } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  fallbackSrc?: string;
  mobileObjectPosition?: string;
}

// Map of high-reliability persistent public furniture images
const DEFAULT_FALLBACKS: Record<string, string> = {
  living: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
  bedroom: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
  dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
  chair: 'https://images.unsplash.com/photo-1580481077195-731b59fed637?auto=format&fit=crop&w=1200&q=80',
  hero: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80',
  general: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
};

export function resolveSafeImageUrl(src?: string): string {
  if (!src) return DEFAULT_FALLBACKS.general;

  // Convert legacy internal /src/assets paths to reliable public paths
  if (src.startsWith('/src/assets/images/')) {
    const filename = src.replace('/src/assets/images/', '');
    return `/images/${filename}`;
  }
  if (src.startsWith('/src/assets/')) {
    const filename = src.replace('/src/assets/', '');
    return `/${filename}`;
  }

  // Optimize Unsplash images for WebP/AVIF delivery with high fidelity
  if (src.includes('images.unsplash.com') && !src.includes('auto=format')) {
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}auto=format&fit=crop&q=80`;
  }

  return src;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'Wood Care Furniture Piece',
  className = '',
  fallbackSrc,
  mobileObjectPosition,
  style,
  loading = 'lazy',
  ...props
}) => {
  const [errorCount, setErrorCount] = useState(0);
  const resolved = resolveSafeImageUrl(src);

  const handleError = () => {
    setErrorCount(prev => prev + 1);
  };

  // If first URL failed, try fallbackSrc or persistent Unsplash
  let currentSrc = resolved;
  if (errorCount === 1) {
    currentSrc = fallbackSrc || DEFAULT_FALLBACKS.general;
  } else if (errorCount >= 2) {
    // Both failed, render graceful styled placeholder without layout shift
    return (
      <div 
        className={`w-full h-full flex flex-col items-center justify-center bg-[#251A14] text-stone-300 p-4 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Armchair className="w-8 h-8 text-[#C5A880] mb-2 opacity-80" />
        <span className="font-serif text-xs font-semibold text-[#FAF6F0] tracking-wider text-center line-clamp-1">
          {alt}
        </span>
        <span className="text-[10px] text-[#C5A880] uppercase tracking-widest mt-0.5">
          Wood Care Handcrafted
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading={loading}
      decoding="async"
      style={style}
      {...props}
    />
  );
};
