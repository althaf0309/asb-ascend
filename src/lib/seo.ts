export const SITE_URL = 'https://www.asbtraininghub.com';
export const SITE_NAME = 'ASB Training Hub';
export const DEFAULT_DESCRIPTION =
  'ASB Training Hub in Trivandrum offers job-oriented ERP, programming, AI, management, and internship courses with practical training and placement support.';

/** Keeps a keyword page's title inside what a search result shows. */
export const seoPageTitle = (title: string) => {
  const full = `${title} | ${SITE_NAME}`;
  return full.length <= 60 ? full : `${title} | ASB`;
};

// Mirrors guidePageSeo / keywordCoursePageSeo / topicPageDescription in the
// backend's answers.js, so a page keeps the title and description the server sent.
const fitFirst = (options: string[], limit: number) => options.find((o) => o.length <= limit) || options[options.length - 1];
const COURSE_WORDS = /\b(course|courses|training|certification|program|programme|diploma|bootcamp|class|classes|internship)\b/i;

export const guidePageSeo = (guide: { title: string; description: string; kind: string }) => {
  if (guide.kind === 'question') {
    const title = guide.title.replace(/\?$/, '');
    return { title: fitFirst([`${title}? Quick Answer | ASB`, `${title}? Answered | ASB`, `${title} | ASB Guide`], 60), description: guide.description };
  }
  return {
    title: fitFirst([`${guide.title} Guide | ${SITE_NAME}`, `${guide.title} Guide | ASB`], 60),
    description: fitFirst([
      `Guide to ${guide.title}: what it covers, who it suits and how to compare courses. From ASB Training Hub, Trivandrum.`,
      `Guide to ${guide.title}: what it covers, who it suits and how to compare courses.`,
    ], 155),
  };
};

export const keywordCoursePageSeo = (item: { title: string; description: string }) => {
  const options = COURSE_WORDS.test(item.title)
    ? [`${item.title}: Modules & Projects | ASB`, `${item.title}: Syllabus | ASB`, `${item.title} Syllabus | ASB`]
    : [`${item.title}: What You Will Learn | ASB`, `${item.title}: Skills & Projects | ASB`, `${item.title} Skills | ASB`];
  return {
    title: fitFirst(options, 60),
    description: item.description,
  };
};

export const topicPageTitle = (topic: { name: string }, location: { name: string; delivery: string }) => {
  const how = /classroom/i.test(location.delivery) ? 'Classroom & Online' : 'Live Online';
  const base = `${topic.name} in ${location.name}`;
  return fitFirst([`${base}: ${how} | ASB`, `${base} (${how})`, `${base} | ASB`], 60);
};

export const topicPageDescription = (topic: { name: string }, location: { name: string; delivery: string }) =>
  fitFirst([
    `${topic.name} in ${location.name}: ${location.delivery.toLowerCase()} batches with guided projects and career support. Call +91 87147 73304.`,
    `${topic.name} in ${location.name}: ${location.delivery.toLowerCase()} batches with guided projects and career support.`,
    `${topic.name} in ${location.name}: ${/classroom/i.test(location.delivery) ? 'classroom and online' : 'live online'} batches with guided projects. Call +91 87147 73304.`,
  ], 155);

/** Applies the search snippet the server built, once it has loaded. */
export const applySeoSnippet = ({ title, description }: { title: string; description: string }) => {
  document.title = title;
  setMetaTag('description', description);
  setPropertyTag('og:title', title);
  setPropertyTag('og:description', description);
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
};

/** Upper bound Google renders before truncating a SERP snippet. */
const SERP_DESCRIPTION_MAX = 160;

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

/**
 * Writes one JSON-LD block, or an array of them when a page publishes several
 * entities (Course + FAQPage + BreadcrumbList) under a single id.
 */
export const setJsonLd = (id: string, data: Record<string, unknown> | Record<string, unknown>[]) => {
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

let activeSeoPath: string | null = null;

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
  // The backend injects route-specific JSON-LD for the first request. Once the
  // SPA changes routes that markup describes the old page, so remove it before
  // React publishes the new route's schemas.
  if (activeSeoPath !== path) {
    document
      .querySelectorAll('script[data-server-json-ld], script[data-json-ld]')
      .forEach((script) => script.remove());
    activeSeoPath = path;
  }

  const finalDescription = description || DEFAULT_DESCRIPTION;
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  document.title = title;
  setMetaTag('description', finalDescription);
  // Search engines ignore meta keywords and it publishes the target terms, so
  // the tag is removed; `keywords` stays in the signature for existing callers.
  void keywords;
  document.querySelectorAll('meta[name="keywords"]').forEach((tag) => tag.remove());
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
