export const SITE_URL = 'https://www.asbtraininghub.com';
export const SITE_NAME = 'ASB Training Hub';
export const DEFAULT_DESCRIPTION =
  'ASB Training Hub in Trivandrum offers job-oriented ERP/SAP, programming, AI, management, and internship courses with practical training and placement support.';
export const DEFAULT_KEYWORDS =
  'ASB Training Hub, training institute Trivandrum, ERP courses Kerala, SAP training Trivandrum, AI training Kerala, programming courses Trivandrum, internship programs Kerala';

/** Upper bound Google renders before truncating a SERP snippet. */
export const SERP_DESCRIPTION_MAX = 160;

/**
 * Trims a description to the SERP budget without cutting mid-word.
 *
 * Page descriptions are assembled from course copy of varying length, so this
 * keeps them inside the snippet budget rather than relying on every source
 * string happening to be short enough.
 */
export const truncateForSerp = (value: string, max = SERP_DESCRIPTION_MAX) => {
  const cleaned = value.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;

  // Reserve one character for the ellipsis, then fall back to the last word
  // boundary so the snippet never ends on a partial word.
  const clipped = cleaned.slice(0, max - 1);
  const lastBoundary = clipped.lastIndexOf(' ');
  const body = lastBoundary > max * 0.6 ? clipped.slice(0, lastBoundary) : clipped;
  return `${body.replace(/[\s,;:.!-]+$/, '')}…`;
};

export const absoluteUrl = (path = '/') => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath}`;
};

export const setMetaTag = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export const setPropertyTag = (property: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export const setCanonical = (href: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

export const setJsonLd = (id: string, data: Record<string, unknown>) => {
  let script = document.querySelector<HTMLScriptElement>(`script[data-json-ld="${id}"]`);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.jsonLd = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
};

export const removeJsonLd = (id: string) => {
  document.querySelector<HTMLScriptElement>(`script[data-json-ld="${id}"]`)?.remove();
};

export const setPageSeo = ({
  title,
  description,
  keywords,
  path = '/',
  image = '/site-logo.png',
  type = 'website',
  noindex = false,
}: {
  title: string;
  description?: string;
  keywords?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}) => {
  const finalDescription = description || DEFAULT_DESCRIPTION;
  const finalKeywords = keywords || DEFAULT_KEYWORDS;
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  document.title = title;
  setMetaTag('description', finalDescription);
  setMetaTag('keywords', finalKeywords);
  setMetaTag('robots', noindex ? 'noindex, nofollow' : 'index, follow');
  setCanonical(canonical);

  setPropertyTag('og:site_name', SITE_NAME);
  setPropertyTag('og:title', title);
  setPropertyTag('og:description', finalDescription);
  setPropertyTag('og:type', type);
  setPropertyTag('og:url', canonical);
  setPropertyTag('og:image', imageUrl);

  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', finalDescription);
  setMetaTag('twitter:image', imageUrl);
};
