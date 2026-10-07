/**
 * SEO & Metadata Utility for Woodgear Furniture
 * Handles dynamic canonical URLs, page titles, meta descriptions,
 * OpenGraph/Twitter cards, and strict robots indexing.
 */

export interface PageMetaConfig {
  title: string;
  description: string;
  canonicalPath: string;
  isPrivate?: boolean;
}

const BASE_DOMAIN = 'https://woodgearfurniture.pk';

export function updatePageMeta(config: PageMetaConfig): void {
  // 1. Page Title
  document.title = config.title;

  // 2. Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Canonical URL
  const cleanPath = config.canonicalPath.startsWith('/') ? config.canonicalPath : `/${config.canonicalPath}`;
  const canonicalUrl = `${BASE_DOMAIN}${cleanPath === '/' ? '' : cleanPath}`;

  let linkCanonical = document.querySelector('link[rel="canonical"]');
  if (!linkCanonical) {
    linkCanonical = document.createElement('link');
    linkCanonical.setAttribute('rel', 'canonical');
    document.head.appendChild(linkCanonical);
  }
  linkCanonical.setAttribute('href', canonicalUrl);

  // 4. OpenGraph Tags
  const setMetaProperty = (prop: string, content: string) => {
    let el = document.querySelector(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaProperty('og:title', config.title);
  setMetaProperty('og:description', config.description);
  setMetaProperty('og:url', canonicalUrl);

  // 5. Twitter Card Tags
  const setMetaName = (name: string, content: string) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaName('twitter:title', config.title);
  setMetaName('twitter:description', config.description);

  // 6. Robots Tag: Strict guarantee that no public page has noindex
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  if (config.isPrivate) {
    metaRobots.setAttribute('content', 'noindex, nofollow');
  } else {
    metaRobots.setAttribute('content', 'index, follow');
  }
}
