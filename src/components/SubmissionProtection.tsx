import { useEffect, useId, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type Props = {
  website: string;
  onWebsiteChange: (value: string) => void;
  onTokenChange: (token: string) => void;
  resetKey?: number;
};

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_ID = 'cloudflare-turnstile-script';

/**
 * A visually hidden honeypot plus an optional Cloudflare Turnstile challenge.
 * The matching secret is checked by the API; a browser token is never trusted
 * on its own. Without a configured site key, the honeypot remains active.
 */
const SubmissionProtection = ({ website, onWebsiteChange, onTokenChange, resetKey = 0 }: Props) => {
  const fieldId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return;
    let widgetId = '';
    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        theme: 'auto',
        size: 'flexible',
        callback: (token: string) => onTokenChange(token),
        'expired-callback': () => onTokenChange(''),
        'error-callback': () => onTokenChange(''),
      });
    };

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener('load', renderWidget);
    renderWidget();

    return () => {
      cancelled = true;
      script?.removeEventListener('load', renderWidget);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      onTokenChange('');
    };
  }, [onTokenChange, resetKey]);

  return (
    <>
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor={fieldId}>Website</label>
        <input
          id={fieldId}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => onWebsiteChange(event.target.value)}
        />
      </div>
      {SITE_KEY && (
        <div
          ref={containerRef}
          className="min-h-[65px] w-full max-w-full overflow-hidden"
          aria-label="Spam protection"
        />
      )}
    </>
  );
};

export default SubmissionProtection;
