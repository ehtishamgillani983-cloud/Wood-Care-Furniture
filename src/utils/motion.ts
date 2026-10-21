/**
 * Motion & Animation Design Tokens and Variants
 * Built for world-class luxury furniture interactions
 */

export const transitionLuxury = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] as const, // Custom luxury cubic-bezier
};

export const transitionSnappy = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

export const fadeInUpVariant = {
  hidden: { opacity: 0, y: 32 },
  visible: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      delay: custom * 0.12,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: (custom = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.7,
      delay: custom * 0.1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const imageMaskReveal = {
  hidden: { 
    clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
    scale: 1.15,
    opacity: 0 
  },
  visible: { 
    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
    scale: 1,
    opacity: 1,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    }
  }
};

/**
 * Checks if client prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
