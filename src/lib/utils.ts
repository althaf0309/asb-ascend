import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Spread onto an <img> to mark it as the page's priority image. React 18 drops
 * the camelCase `fetchPriority` prop (with a console warning), so the browser
 * never received the hint; the lowercase attribute passes straight through.
 */
export const highFetchPriority = { fetchpriority: "high" } as Record<string, string>;
