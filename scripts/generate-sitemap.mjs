/**
 * Generates public/sitemap.xml and public/llms.txt at build time.
 *
 * Courses and blog posts are admin-managed, so both are read from the backend's
 * JSON store rather than from anything bundled. In production nginx proxies
 * /sitemap.xml to the backend, which builds it on every request - so a course
 * added in the admin appears immediately. This build-time copy is the fallback
 * for when the backend is unreachable, and the source for llms.txt.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const backendData = path.resolve(rootDir, '../backend/data');
const siteUrl = 'https://www.asbtraininghub.com';

/** Reads a backend store, falling back to its committed seed, then to []. */
const readStore = async (...candidates) => {
  for (const name of candidates) {
    try {
      return JSON.parse(await readFile(path.join(backendData, name), 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn(`could not read ${name}: ${error.message}`);
      }
    }
  }
  return [];
};

const staticRoutes = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/about', priority: '0.8', changefreq: 'monthly' },
  { loc: '/courses', priority: '0.95', changefreq: 'weekly' },
  { loc: '/locations/kerala', priority: '0.9', changefreq: 'monthly' },
  { loc: '/reviews', priority: '0.7', changefreq: 'monthly' },
  { loc: '/faq', priority: '0.8', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
  { loc: '/contact', priority: '0.85', changefreq: 'monthly' },
  { loc: '/apply', priority: '0.9', changefreq: 'monthly' },
  { loc: '/terms-and-conditions', priority: '0.5', changefreq: 'yearly' },
];

const LOCATION_SLUGS = [
  'trivandrum', 'kazhakootam-technopark', 'kochi-ernakulam',
  'kozhikode-calicut', 'thrissur', 'kollam', 'kottayam', 'kannur',
  'alappuzha', 'palakkad', 'malappuram',
];
const LOCATION_TOPIC_SLUGS = [
  'generative-ai-course', 'agentic-ai-course', 'ai-course', 'erp-sap-courses',
  'programming-courses', 'management-courses', 'internship-programs',
];
const locationRoutes = LOCATION_SLUGS.flatMap((district) => [
  { loc: `/locations/kerala/${district}`, priority: '0.85', changefreq: 'monthly' },
  ...LOCATION_TOPIC_SLUGS.map((topic) => ({
    loc: `/locations/kerala/${district}/${topic}`, priority: '0.8', changefreq: 'monthly',
  })),
]);

const CATEGORY_IDS = ['erp', 'programming', 'ai', 'management', 'internship'];
const categoryRoutes = CATEGORY_IDS.map((category) => ({
  loc: `/courses/${category}`,
  priority: '0.9',
  changefreq: 'weekly',
}));

const courses = (await readStore('courses.json', 'courses.seed.json')).filter(
  (c) => c && c.slug && c.published !== false,
);

const TRAINING_CATEGORY_IDS = ['corporate', 'workshop', 'certification', 'bootcamp', 'online'];
const training = (await readStore('training.json', 'training.seed.json')).filter(
  (t) => t && t.slug && t.published !== false,
);
const trainingRoutes = [
  { loc: '/training', priority: '0.9', changefreq: 'weekly' },
  ...[...new Set(training.map((item) => item.category))]
    .filter((id) => TRAINING_CATEGORY_IDS.includes(id))
    .map((id) => ({
    loc: `/training/category/${id}`, priority: '0.8', changefreq: 'weekly',
  })),
  ...training.map((t) => ({
    loc: `/training/${t.slug}`,
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: t.updatedAt ? t.updatedAt.slice(0, 10) : undefined,
  })),
];
const courseRoutes = courses.map((c) => ({
  loc: `/course/${c.slug}`,
  priority: '0.85',
  changefreq: 'monthly',
  lastmod: c.updatedAt ? c.updatedAt.slice(0, 10) : undefined,
}));
const localizedCourseRoutes = LOCATION_SLUGS.flatMap((district) => courses.map((c) => ({
  loc: `/locations/kerala/${district}/course/${c.slug}`,
  priority: '0.75',
  changefreq: 'monthly',
  lastmod: c.updatedAt ? c.updatedAt.slice(0, 10) : undefined,
})));

const blogs = (await readStore('blogs.json')).filter((b) => b && b.slug && b.published !== false);
const blogRoutes = blogs.map((b) => ({
  loc: `/blog/${b.slug}`,
  priority: '0.65',
  changefreq: 'monthly',
  lastmod: b.updatedAt ? b.updatedAt.slice(0, 10) : undefined,
}));

const urls = [...staticRoutes, ...locationRoutes, ...categoryRoutes, ...courseRoutes, ...localizedCourseRoutes, ...trainingRoutes, ...blogRoutes];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    ({ loc, priority, changefreq, lastmod }) => `  <url>
    <loc>${siteUrl}${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

await writeFile(path.join(rootDir, 'public/sitemap.xml'), xml, 'utf8');

/* ------------------------------------------------------------------ *
 * llms.txt - machine-readable summary for AI assistants
 * ------------------------------------------------------------------ */

const byCategory = (id) => courses.filter((c) => c.category === id);
const categoryLabel = (id) => byCategory(id)[0]?.categoryLabel || id;

const llms = `# ASB Training Hub

ASB Training Hub is a career training institute in Trivandrum, Kerala offering job-oriented ERP/SAP-style, programming, AI, management, and internship courses with practical training and placement support.

## Site

- Website: ${siteUrl}/
- Sitemap: ${siteUrl}/sitemap.xml
- Contact: ${siteUrl}/contact
- Apply: ${siteUrl}/apply
- Email: info@asbtraininghub.com
- Phone/WhatsApp: +91 87147 73304
- Address: 105-2, The Atomic, Near Technopark Phase 1, Kazhakootam, Trivandrum, Kerala 695581
- Hours: Monday to Saturday, 9:00 AM to 6:00 PM

## Main Public Pages

- Home: ${siteUrl}/
- About: ${siteUrl}/about
- Courses: ${siteUrl}/courses
- Training: ${siteUrl}/training
- Kerala course locations: ${siteUrl}/locations/kerala
- Local course pages: every published course is available beneath each Kerala location at ${siteUrl}/locations/kerala/{location}/course/{course-slug}
${CATEGORY_IDS.map((id) => `- ${categoryLabel(id)}: ${siteUrl}/courses/${id}`).join('\n')}
- Reviews: ${siteUrl}/reviews
- FAQ: ${siteUrl}/faq
- Blog: ${siteUrl}/blog
- Terms and Conditions: ${siteUrl}/terms-and-conditions

## Courses (${courses.length})

${CATEGORY_IDS.map((id) => {
  const list = byCategory(id);
  if (!list.length) return '';
  return `### ${categoryLabel(id)} (${list.length})\n\n${list
    .map((c) => `- ${c.title} — ${c.duration}, ${c.mode}: ${siteUrl}/course/${c.slug}`)
    .join('\n')}`;
})
  .filter(Boolean)
  .join('\n\n')}

## Training Programmes (${training.length})

${TRAINING_CATEGORY_IDS.map((id) => {
  const list = training.filter((t) => t.category === id);
  if (!list.length) return '';
  return `### ${list[0].categoryLabel || id} (${list.length})\n\n${list
    .map((t) => `- ${t.title} — ${t.duration}, ${t.mode}: ${siteUrl}/training/${t.slug}`)
    .join('\n')}`;
})
  .filter(Boolean)
  .join('\n\n')}

## Crawling Guidance

Use the sitemap for the complete canonical URL list. Every course page carries
schema.org Course markup with syllabus, duration, mode and FAQs. Do not index
admin pages under \`/admin/\`.
`;

await writeFile(path.join(rootDir, 'public/llms.txt'), llms, 'utf8');

console.log(
  `Generated sitemap with ${urls.length} URLs (${courses.length} courses, ${training.length} training, ${blogs.length} posts) and llms.txt.`,
);
