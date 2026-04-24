import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SmartImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Container className (controls aspect/size). */
  wrapperClassName?: string;
  /** Image className (controls object-fit etc.). */
  className?: string;
  /** Eager loads skip the skeleton fade-in for above-the-fold hero images. */
  eager?: boolean;
}

/**
 * Image with skeleton shimmer + blur-up placeholder.
 * - Renders a tiny low-quality version of the same Unsplash URL as a blurred backdrop.
 * - Falls back to a shimmer skeleton for non-Unsplash sources.
 * - Cross-fades to the full image once loaded.
 */
const SmartImage = ({
  src,
  alt,
  wrapperClassName,
  className,
  eager = false,
  ...rest
}: SmartImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  // Build a 24px blurred preview for Unsplash URLs by swapping the `w=` param.
  const blurSrc = (() => {
    if (!src.includes('images.unsplash.com')) return null;
    try {
      const url = new URL(src);
      url.searchParams.set('w', '24');
      url.searchParams.set('q', '30');
      url.searchParams.set('blur', '50');
      return url.toString();
    } catch {
      return null;
    }
  })();

  return (
    <div className={cn('relative overflow-hidden bg-muted', wrapperClassName)}>
      {/* Shimmer skeleton (always under, hidden when loaded) */}
      {!loaded && !errored && (
        <div
          aria-hidden
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted via-muted/60 to-muted"
        />
      )}

      {/* Blur-up placeholder */}
      {blurSrc && !errored && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden
          className={cn(
            'absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-opacity duration-500',
            loaded ? 'opacity-0' : 'opacity-100',
          )}
        />
      )}

      {/* Fallback when image fails to load */}
      {errored && (
        <div
          aria-label={alt}
          role="img"
          className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted via-muted/70 to-muted/40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10 text-muted-foreground/60"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="sr-only">Image unavailable</span>
        </div>
      )}

      {/* Real image */}
      {!errored && (
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            setErrored(true);
            setLoaded(true);
          }}
          className={cn(
            'relative w-full h-full object-cover transition-opacity duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          {...rest}
        />
      )}
    </div>
  );
};

export default SmartImage;
