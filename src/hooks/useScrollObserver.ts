import { useEffect } from 'react';

/**
 * Custom hook to activate smooth scroll-reveal animations across any page.
 * Observes elements with `.scroll-reveal`, `.scroll-reveal-fade`, or `.scroll-reveal-scale`
 * and applies `.is-visible` when scrolled into view.
 */
export function useScrollObserver(dependencies: unknown[] = []) {
  useEffect(() => {
    // Check if IntersectionObserver is available
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.scroll-reveal, .scroll-reveal-fade, .scroll-reveal-scale').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Unobserve once revealed for performance
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px', // Trigger 60px before fully entering viewport
        threshold: 0.12,
      }
    );

    // Initial check and observe
    const elements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-fade, .scroll-reveal-scale');
    elements.forEach((el) => {
      // If already in top of viewport on mount, reveal immediately
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, dependencies);
}
