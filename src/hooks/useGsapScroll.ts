import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../utils/motion';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom hook to safely register GSAP ScrollTrigger animations with full cleanup.
 */
export function useGsapContext(
  animationCreator: (context: gsap.Context) => void,
  dependencies: unknown[] = []
) {
  const scopeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      animationCreator(ctx);
    }, scopeRef);

    return () => {
      ctx.revert(); // Reverts all animations and kills ScrollTriggers created in context
    };
  }, dependencies);

  return scopeRef;
}

/**
 * Quick helper for parallax background element
 */
export function useParallaxEffect(speed = 0.25) {
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || prefersReducedMotion() || !elementRef.current) return;

    const el = elementRef.current;
    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const yOffset = (self.progress - 0.5) * 120 * speed;
        gsap.set(el, { y: yOffset, force3D: true });
      },
    });

    return () => {
      trigger.kill();
    };
  }, [speed]);

  return elementRef;
}
