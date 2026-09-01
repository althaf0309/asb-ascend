import DOMPurify from 'dompurify';

/**
 * Allowlist for blog body HTML rendered with dangerouslySetInnerHTML.
 *
 * The server sanitises on write; this is the second layer, so content that
 * predates the server-side policy - or arrives from any other path - still
 * cannot execute in a visitor's browser.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub', 'mark',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'span', 'div',
];

const ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height', 'loading',
  'colspan', 'rowspan', 'scope',
  'class',
];

/** Force external links to open safely, mirroring the server-side policy. */
let hookInstalled = false;
const installHook = () => {
  if (hookInstalled) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('href')?.startsWith('http')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
    }
  });
  hookInstalled = true;
};

export const sanitizeBlogHtml = (html: string): string => {
  installHook();
  return DOMPurify.sanitize(html ?? '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel):|^\/(?!\/)|^data:image\//i,
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'form', 'base', 'meta', 'link'],
    FORBID_ATTR: ['style'],
    KEEP_CONTENT: true,
  });
};
