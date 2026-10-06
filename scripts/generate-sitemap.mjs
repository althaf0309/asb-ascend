/**
 * Generates public/sitemap.xml and public/llms.txt at build time.
 *
 * Courses and blog posts are admin-managed, so both are read from the backend's
 * JSON store rather than from anything bundled. In production nginx proxies
 * /sitemap.xml to the backend, which builds it on every request - so a course
 * added in the admin appears immediately. This build-time copy is the fallback
 * for when the backend is unreachable, and the source for llms.txt.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
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
const AI_LANDING_SLUGS = ['generative-ai-course-kerala','agentic-ai-course-kerala','prompt-engineering-course-kerala','chatgpt-course-kerala','llm-course-kerala','rag-course-kerala','mcp-course-kerala','ai-agent-development-course-kerala','ai-automation-course-kerala','ai-course-for-beginners-kerala','ai-course-working-professionals-kerala','online-ai-course-kerala','offline-ai-course-trivandrum','ai-course-placement-support-kerala','ai-career-guide-kerala','ai-tools-training-kerala'];
const aiLandingRoutes = [{ loc:'/ai-courses',priority:'0.9',changefreq:'monthly' },...AI_LANDING_SLUGS.map(slug=>({loc:`/ai-courses/${slug}`,priority:'0.8',changefreq:'monthly'}))];
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
const aiGuides = JSON.parse(await readFile(path.join(rootDir, 'src/data/aiGuidePages.json'), 'utf8'));
const seoAiPages = JSON.parse(await readFile(path.join(rootDir, 'src/data/seoAiPages.json'), 'utf8'));
const seoLogisticsPages = JSON.parse(await readFile(path.join(rootDir, 'src/data/seoLogisticsPages.json'), 'utf8'));

const svgEscape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const hashText = (value) => [...value].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 7);
const palettes = [
  ['#071a2b', '#0f766e', '#fb923c'], ['#111827', '#1d4ed8', '#f97316'],
  ['#172554', '#0369a1', '#f59e0b'], ['#052e2b', '#15803d', '#fb7185'],
  ['#20102f', '#7e22ce', '#f59e0b'], ['#292524', '#b45309', '#22c55e'],
];
const wrapTitle = (title, maximum = 35) => {
  const lines = [];
  let line = '';
  for (const word of title.split(/\s+/)) {
    if (`${line} ${word}`.trim().length > maximum && line) {
      lines.push(line);
      line = word;
    } else line = `${line} ${word}`.trim();
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
};
const logisticsHeroSvg = (page) => {
  const seed = hashText(`${page.family}:${page.slug}`);
  const [dark, middle, accent] = palettes[seed % palettes.length];
  const lines = wrapTitle(page.title);
  const label = page.family === 'warehouse' ? 'WAREHOUSE & INVENTORY' : 'LOGISTICS & SUPPLY CHAIN';
  const context = page.location ? `COURSE GUIDE · ${page.location.toUpperCase()}` : `PRACTICAL ${page.intent.toUpperCase()} GUIDE`;
  const title = lines.map((line, index) => `<text x="110" y="${330 + (index * 72)}" fill="#fff" font-family="Arial, sans-serif" font-size="56" font-weight="700">${svgEscape(line)}</text>`).join('');
  const offset = seed % 90;
  const warehouseGraphic = `<g transform="translate(${965 + offset} 205)"><rect width="430" height="420" rx="28" fill="#fff" fill-opacity=".09" stroke="#fff" stroke-opacity=".28"/><path d="M45 150L215 55l170 95v215H45z" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="8"/><path d="M90 205h250M90 270h250M90 335h250M170 205v160M260 205v160" stroke="${accent}" stroke-width="10"/><rect x="110" y="225" width="40" height="25" fill="#fff"/><rect x="280" y="290" width="40" height="25" fill="#fff"/></g>`;
  const logisticsGraphic = `<g transform="translate(${920 + offset} 205)"><circle cx="235" cy="210" r="205" fill="#fff" fill-opacity=".08" stroke="#fff" stroke-opacity=".25"/><path d="M55 295h330l-30-105H175l-45-70H55z" fill="none" stroke="#fff" stroke-width="14" stroke-linejoin="round"/><circle cx="145" cy="335" r="35" fill="${accent}"/><circle cx="325" cy="335" r="35" fill="${accent}"/><path d="M80 80h165M245 80l-45-35m45 35l-45 35" stroke="${accent}" stroke-width="14" stroke-linecap="round"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" role="img" aria-labelledby="title description"><title id="title">${svgEscape(page.title)}</title><desc id="description">Original ASB Training Hub illustration for ${svgEscape(page.title)}</desc><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${dark}"/><stop offset=".62" stop-color="${middle}"/><stop offset="1" stop-color="${accent}"/></linearGradient><pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="#fff" stroke-opacity=".055"/></pattern></defs><rect width="1600" height="900" fill="url(#bg)"/><rect width="1600" height="900" fill="url(#grid)"/><circle cx="${1370 - offset}" cy="${85 + offset}" r="260" fill="${accent}" fill-opacity=".15"/><path d="M0 770C330 ${690 + offset},580 855,920 745s510-70 680 20v135H0z" fill="#000" fill-opacity=".18"/><text x="110" y="190" fill="${accent}" font-family="Arial, sans-serif" font-size="26" font-weight="700" letter-spacing="3">${label}</text>${title}<rect x="110" y="${650 + (seed % 28)}" width="520" height="3" fill="${accent}"/><text x="110" y="730" fill="#fff" fill-opacity=".86" font-family="Arial, sans-serif" font-size="23" letter-spacing="1">${svgEscape(context)}</text>${page.family === 'warehouse' ? warehouseGraphic : logisticsGraphic}<text x="1215" y="820" fill="#fff" font-family="Arial, sans-serif" font-size="23" font-weight="700">ASB TRAINING HUB</text></svg>`;
};

const generatedHeroRoot = path.join(rootDir, 'public/generated/logistics');
for (const family of ['logistics', 'warehouse']) await mkdir(path.join(generatedHeroRoot, family), { recursive: true });
for (let index = 0; index < seoLogisticsPages.length; index += 50) {
  await Promise.all(seoLogisticsPages.slice(index, index + 50).map((page) => writeFile(
    path.join(generatedHeroRoot, page.family, `${page.slug}.svg`), logisticsHeroSvg(page), 'utf8',
  )));
}
const seoAiRoutes = ['agentic','generative'].map((family) => ({ loc: `/course-training/${family}/ai`, priority: '0.9', changefreq: 'weekly' })).concat(seoAiPages.map((page) => ({ loc: `/course-training/${page.family}/ai/${page.slug}`, priority: page.question ? '0.65' : '0.75', changefreq: 'monthly' })));
const logisticsFamilies = {
  logistics: { segment: 'Diploma-in-Logistics-and-Supply-Chain-Management', primarySlug: 'diploma-in-logistics-and-supply-chain-management' },
  warehouse: { segment: 'Diploma-in-warehouse-Management', primarySlug: 'diploma-in-warehouse-management' },
};
const logisticsPath = (page) => {
  const family = logisticsFamilies[page.family];
  const base = `/course-training/${family.segment}`;
  return page.slug === family.primarySlug ? base : `${base}/${page.slug}`;
};
const seoLogisticsRoutes = seoLogisticsPages.map((page) => ({ loc: logisticsPath(page), priority: page.slug === logisticsFamilies[page.family].primarySlug ? '0.9' : page.question ? '0.65' : '0.75', changefreq: page.slug === logisticsFamilies[page.family].primarySlug ? 'weekly' : 'monthly' }));
seoLogisticsRoutes.unshift(
  { loc: '/course-training/logistics', priority: '0.85', changefreq: 'monthly' },
  { loc: '/course-training/warehouse', priority: '0.85', changefreq: 'monthly' },
);
const aiGuideRoutes = [{ loc: '/ai-guides', priority: '0.8', changefreq: 'monthly' }, ...aiGuides.map((guide) => ({ loc: `/ai-guides/${guide.slug}`, priority: '0.65', changefreq: 'monthly' }))];
const keywordCourseRoutes = [{ loc: '/keyword-courses', priority: '0.85', changefreq: 'monthly' }, ...aiGuides.filter((guide) => guide.kind === 'keyword').map((guide) => ({ loc: `/keyword-courses/${guide.slug}`, priority: '0.7', changefreq: 'monthly' }))];

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

const urls = [...staticRoutes, ...aiLandingRoutes, ...aiGuideRoutes, ...keywordCourseRoutes, ...seoAiRoutes, ...seoLogisticsRoutes, ...locationRoutes, ...categoryRoutes, ...courseRoutes, ...localizedCourseRoutes, ...trainingRoutes, ...blogRoutes];

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
