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

      {/* Real image */}
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
    </div>
  );
};

export default SmartImage;
