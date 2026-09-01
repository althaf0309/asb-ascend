/**
 * Width variants for the bundled raster assets.
 *
 * Vite resolves each import to its own hashed URL at build time, so the map is
 * keyed by the resolved URL of the full-size image. `SmartImage` looks the src
 * up here and emits a srcset when there is one, letting the browser download a
 * file that matches the box it is painting into rather than the desktop size.
 */
import heroBg from '@/assets/hero-bg.webp';
import heroBg480 from '@/assets/hero-bg-480w.webp';
import heroBg960 from '@/assets/hero-bg-960w.webp';
import heroBg1920 from '@/assets/hero-bg-1920w.webp';

import catErp from '@/assets/cat-erp.webp';
import catErp400 from '@/assets/cat-erp-400w.webp';
import catErp800 from '@/assets/cat-erp-800w.webp';

import catAi from '@/assets/cat-ai.webp';
import catAi400 from '@/assets/cat-ai-400w.webp';
import catAi800 from '@/assets/cat-ai-800w.webp';

import catProgramming from '@/assets/cat-programming.webp';
import catProgramming400 from '@/assets/cat-programming-400w.webp';
import catProgramming800 from '@/assets/cat-programming-800w.webp';

import catManagement from '@/assets/cat-management.webp';
import catManagement400 from '@/assets/cat-management-400w.webp';
import catManagement800 from '@/assets/cat-management-800w.webp';

import catInternship from '@/assets/cat-internship.webp';
import catInternship400 from '@/assets/cat-internship-400w.webp';
import catInternship800 from '@/assets/cat-internship-800w.webp';

import aboutCampus from '@/assets/about-campus.webp';
import aboutCampus600 from '@/assets/about-campus-600w.webp';

export const localSrcSets: Record<string, string> = {
  [heroBg]: `${heroBg480} 480w, ${heroBg960} 960w, ${heroBg1920} 1920w`,
  [catErp]: `${catErp400} 400w, ${catErp800} 800w`,
  [catAi]: `${catAi400} 400w, ${catAi800} 800w`,
  [catProgramming]: `${catProgramming400} 400w, ${catProgramming800} 800w`,
  [catManagement]: `${catManagement400} 400w, ${catManagement800} 800w`,
  [catInternship]: `${catInternship400} 400w, ${catInternship800} 800w`,
  [aboutCampus]: `${aboutCampus600} 600w, ${aboutCampus} 1200w`,
};

/** Widths requested from Unsplash, which resizes on demand via its `w` param. */
const UNSPLASH_WIDTHS = [400, 800, 1200];

/**
 * Unsplash serves any width from the same photo id, so a srcset can be derived
 * from the URL rather than pre-generated.
 */
export const unsplashSrcSet = (src: string): string | undefined => {
  if (!src.includes('images.unsplash.com')) return undefined;
  try {
    return UNSPLASH_WIDTHS.map((w) => {
      const url = new URL(src);
      url.searchParams.set('w', String(w));
      return `${url.toString()} ${w}w`;
    }).join(', ');
  } catch {
    return undefined;
  }
};

export const srcSetFor = (src: string): string | undefined =>
  localSrcSets[src] ?? unsplashSrcSet(src);
