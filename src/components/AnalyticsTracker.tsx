import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * First-party analytics for the admin "Website Analytics" report: page views,
 * time and scroll per page, form submissions, and every click on a link or
 * button with the app it opens (WhatsApp, phone, email, social, maps...).
 * Location and device are added by the server; admin pages are never tracked.
 */

const ENDPOINT = '/api/analytics/events';
// An identical click this soon after the last one is a double-tap, not a new decision.
const DUPLICATE_CLICK_MS = 2000;

const storedId = (storage: () => Storage, key: string) => {
  try {
    let id = storage().getItem(key);
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      storage().setItem(key, id);
    }
    return id;
  } catch {
    return '';
  }
};

/** One browser tab's visit. */
const sessionId = () => storedId(() => sessionStorage, 'asb_session_id');
/** The same browser across visits, so a returning visitor counts once. */
const visitorId = () => storedId(() => localStorage, 'asb_visitor_id');

const send = (payload: Record<string, unknown>) => {
  const body = JSON.stringify({ sessionId: sessionId(), visitorId: visitorId(), ...payload });
  if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'application/json' }))) return;
  fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
};

/** Where the visit came from when no campaign tag says so. */
const sourceFromReferrer = (referrer: string) => {
  if (!referrer) return 'direct';
  let host = '';
  try {
    host = new URL(referrer).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
  if (host === location.hostname.replace(/^www\./, '')) return 'internal';
  const known: [RegExp, string][] = [
    [/google\./, 'google'], [/bing\.com/, 'bing'], [/yahoo\./, 'yahoo'], [/duckduckgo/, 'duckduckgo'],
    [/facebook\.com|fb\.com/, 'facebook'], [/instagram\.com/, 'instagram'], [/linkedin\.com|lnkd\.in/, 'linkedin'],
    [/youtube\.com|youtu\.be/, 'youtube'], [/whatsapp\.com|wa\.me/, 'whatsapp'], [/t\.co|twitter\.com|x\.com/, 'x'],
    [/chatgpt\.com|openai\.com/, 'chatgpt'], [/perplexity\.ai/, 'perplexity'], [/gemini\.google/, 'gemini'],
  ];
  return known.find(([pattern]) => pattern.test(host))?.[1] || host;
};

/** Which app or kind of action a click opens. */
const clickChannel = (href: string, element: Element): string => {
  const value = href.toLowerCase();
  if (/wa\.me|whatsapp\.com|whatsapp:/.test(value)) return 'whatsapp';
  if (value.startsWith('tel:')) return 'phone';
  if (value.startsWith('mailto:')) return 'email';
  if (/maps\.google|google\.[a-z.]+\/maps|goo\.gl\/maps|maps\.app\.goo\.gl/.test(value)) return 'maps';
  if (/facebook\.com|instagram\.com|linkedin\.com|youtube\.com|youtu\.be|twitter\.com|x\.com/.test(value)) return 'social';
  if (!href) {
    const type = (element as HTMLButtonElement).type;
    return type === 'submit' || element.closest('form') ? 'form' : 'button';
  }
  try {
    return new URL(href, location.href).hostname === location.hostname ? 'navigation' : 'external';
  } catch {
    return 'other';
  }
};

const clickLabel = (element: Element) =>
  (element.getAttribute('aria-label') ||
    element.textContent ||
    element.getAttribute('title') ||
    element.querySelector('img')?.getAttribute('alt') ||
    '').replace(/\s+/g, ' ').trim().slice(0, 120);

const clickPlacement = (element: Element) =>
  element.closest<HTMLElement>('[data-placement]')?.dataset.placement ||
  (element.closest('nav') ? 'navbar' : element.closest('footer') ? 'footer' : element.closest('form') ? 'form' : element.closest('aside') ? 'sidebar' : 'page');

export default function AnalyticsTracker() {
  const { pathname, search } = useLocation();
  const started = useRef(Date.now());
  const maxScroll = useRef(0);
  const lastClick = useRef({ key: '', at: 0 });
  const tracked = !pathname.startsWith('/admin');

  // Every click on a link or button, anywhere on the page.
  useEffect(() => {
    if (!tracked) return;
    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest('a, button, [role="button"], input[type="submit"]');
      if (!element) return;
      const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') || '' : '';
      const target = href ? new URL(href, location.href).href.replace(location.origin, '') : '';
      const label = clickLabel(element);
      const key = `${pathname}|${target}|${label}`;
      const now = Date.now();
      if (lastClick.current.key === key && now - lastClick.current.at < DUPLICATE_CLICK_MS) return;
      lastClick.current = { key, at: now };
      send({
        eventType: 'click',
        path: pathname,
        title: document.title,
        label,
        target: target.slice(0, 300),
        channel: clickChannel(href, element),
        placement: clickPlacement(element),
      });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [pathname, tracked]);

  // Page view, time on page, scroll depth and form submissions.
  useEffect(() => {
    if (!tracked) return;
    started.current = Date.now();
    maxScroll.current = 0;
    const params = new URLSearchParams(search);
    send({
      eventType: 'page_view',
      path: pathname,
      title: document.title,
      referrer: document.referrer,
      searchTerm: params.get('utm_term') || params.get('q') || params.get('query') || params.get('keyword') || '',
      campaign: params.get('utm_campaign') || '',
      source: params.get('utm_source') || sourceFromReferrer(document.referrer),
      landingKeyword: document.querySelector('h1')?.textContent?.trim() || document.title,
    });

    let frame = 0;
    const scroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const available = document.documentElement.scrollHeight - innerHeight;
        maxScroll.current = Math.max(maxScroll.current, available > 0 ? Math.round((scrollY / available) * 100) : 100);
      });
    };
    const submit = (event: Event) => send({ eventType: 'form_submit', path: pathname, ...((event as CustomEvent).detail || {}) });

    addEventListener('scroll', scroll, { passive: true });
    addEventListener('asb:form-submit', submit);
    return () => {
      send({
        eventType: 'engagement',
        path: pathname,
        durationSeconds: Math.round((Date.now() - started.current) / 1000),
        scrollDepth: maxScroll.current,
      });
      removeEventListener('scroll', scroll);
      cancelAnimationFrame(frame);
      removeEventListener('asb:form-submit', submit);
    };
  }, [pathname, search, tracked]);

  return null;
}
