import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import pages from '@/data/seoLogisticsPages.json';

const root = path.resolve(__dirname, '../..');
const sitemap = readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
const longContent = readFileSync(path.join(root, 'src/components/LongLogisticsContent.tsx'), 'utf8');

describe('logistics keyword landing pages', () => {
  it('creates one unique canonical route for every imported keyword', () => {
    expect(pages).toHaveLength(1257);
    const routes = pages.map((page) => `/course-training/${page.family}/${page.slug}`);
    expect(new Set(routes).size).toBe(routes.length);
    for (const route of routes) expect(sitemap).toContain(`<loc>https://www.asbtraininghub.com${route}</loc>`);
  });

  it('keeps the logistics and warehouse collections separate', () => {
    expect(pages.filter((page) => page.family === 'logistics')).toHaveLength(648);
    expect(pages.filter((page) => page.family === 'warehouse')).toHaveLength(609);
  });

  it('uses clean, crawlable slugs and complete page metadata', () => {
    for (const page of pages) {
      expect(page.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(page.title.trim().length).toBeGreaterThan(3);
      expect(['logistics', 'warehouse']).toContain(page.family);
      expect(page.label.length).toBeGreaterThan(10);
    }
  });

  it('ships at least 1,200 words of long-form body copy before page-specific sections', () => {
    const sectionSource = longContent.split('const sections = [')[1].split('];')[0];
    const prose = [...sectionSource.matchAll(/(?:`([^`]*)`|'([^']*)')/gs)]
      .map((match) => match[1] || match[2])
      .join(' ')
      .replace(/\$\{[^}]+\}/g, ' keyword ');
    const words = prose.match(/\b[\w’'-]+\b/g) ?? [];
    expect(words.length).toBeGreaterThanOrEqual(1200);
  });
});
