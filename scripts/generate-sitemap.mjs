import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const siteUrl = 'https://www.asbtraininghub.com';

const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/courses', priority: '0.95', changefreq: 'weekly' },
  { loc: '/reviews', priority: '0.7', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.8', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
  { loc: '/contact', priority: '0.85', changefreq: 'monthly' },
  { loc: '/apply', priority: '0.9', changefreq: 'monthly' },
  { loc: '/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
];

const categoryRoutes = ['erp', 'programming', 'ai', 'management', 'internship'].map((category) => ({
  loc: `/courses/${category}`,
  priority: '0.9',
  changefreq: 'weekly',
}));

const coursesSource = await readFile(path.join(rootDir, 'src/data/courses.ts'), 'utf8');
const courseSlugs = [...coursesSource.matchAll(/slug:\s*'([^']+)'/g)].map((match) => match[1]);
const courseRoutes = [...new Set(courseSlugs)].map((slug) => ({
  loc: `/course/${slug}`,
  priority: '0.85',
  changefreq: 'monthly',
}));

let blogRoutes = [];
try {
  const blogsRaw = await readFile(path.resolve(rootDir, '../backend/data/blogs.json'), 'utf8');
  const blogs = JSON.parse(blogsRaw);
  blogRoutes = blogs
    .filter((blog) => blog.published !== false && blog.slug)
    .map((blog) => ({
      loc: `/blog/${blog.slug}`,
      priority: '0.65',
      changefreq: 'monthly',
      lastmod: blog.updatedAt ? blog.updatedAt.slice(0, 10) : today,
    }));
} catch {
  blogRoutes = [];
}

const urls = [...staticRoutes, ...categoryRoutes, ...courseRoutes, ...blogRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority, changefreq, lastmod = today }) => `  <url>
    <loc>${siteUrl}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

await writeFile(path.join(rootDir, 'public/sitemap.xml'), xml, 'utf8');
console.log(`Generated sitemap with ${urls.length} URLs.`);
