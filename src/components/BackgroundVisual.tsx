import React, { useState } from 'react';
import { resolveSafeImageUrl } from './SafeImage';

interface BackgroundVisualProps {
  imageSrc?: string;
  videoSrc?: string;
  alt?: string;
  opacityClassName?: string;
  className?: string;
  children?: React.ReactNode;
}

export const BackgroundVisual: React.FC<BackgroundVisualProps> = ({
  imageSrc,
  videoSrc,
  alt = 'Interior luxury atmosphere',
  opacityClassName = 'opacity-15',
  className = '',
  children
}) => {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background Visual Layer */}
      <div className={`absolute inset-0 z-0 ${opacityClassName} pointer-events-none select-none overflow-hidden`}>
        {videoSrc && !videoFailed ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            className="w-full h-full object-cover filter blur-[1px]"
            poster={imageSrc ? resolveSafeImageUrl(imageSrc) : undefined}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : imageSrc ? (
          <img
            src={resolveSafeImageUrl(imageSrc)}
            alt={alt}
            className="w-full h-full object-cover filter blur-[2px] transition-opacity duration-1000"
            loading="lazy"
          />
        ) : null}
        
        {/* Soft dark luxury scrim overlay to ensure 100% typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#15100D]/40 via-transparent to-[#15100D]/60" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
