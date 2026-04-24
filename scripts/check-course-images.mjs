#!/usr/bin/env node
/**
 * Scans every Unsplash photo ID referenced in src/data/courseImages.ts,
 * checks each for HTTP 200, and emits human-readable reports:
 *
 *   /mnt/documents/course-image-report.csv
 *   /mnt/documents/course-image-report.html
 *
 * Each broken image row includes:
 *   - the image ID
 *   - which course key + slot (primary/secondary) it powers
 *   - the page URL where it appears (course detail page, category page)
 *   - a suggested replacement ID (a known-good ID from the same category)
 *
 * Exits non-zero when broken references exist so it can gate CI.
 *
 * Usage: node scripts/check-course-images.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const imagesSrc = readFileSync(resolve(root, 'src/data/courseImages.ts'), 'utf8');
const coursesSrc = readFileSync(resolve(root, 'src/data/courses.ts'), 'utf8');

// ---------- Parse courseImages.ts ----------
const imageEntries = [];
const quoted = /'([^']+)':\s*\{\s*primary:\s*u\('([^']+)'\),\s*secondary:\s*u\('([^']+)'\)/g;
const bare = /(\w+):\s*\{\s*primary:\s*u\('([^']+)'\),\s*secondary:\s*u\('([^']+)'\)\s*\}/g;
let m;
while ((m = quoted.exec(imagesSrc))) imageEntries.push({ key: m[1], primary: m[2], secondary: m[3] });
while ((m = bare.exec(imagesSrc))) imageEntries.push({ key: m[1], primary: m[2], secondary: m[3] });

// ---------- Parse courses.ts to map id -> { slug, title, category } ----------
const courseLineRe = /\.\.\.(\w+)Defaults,\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*slug:\s*'([^']+)'/g;
const defaultsToCategory = {
  erp: 'erp',
  prog: 'programming',
  ai: 'ai',
  mgmt: 'management',
  intern: 'internship',
};
const courseById = {};
while ((m = courseLineRe.exec(coursesSrc))) {
  const [, defaultsName, id, title, slug] = m;
  courseById[id] = {
    id,
    title,
    slug,
    category: defaultsToCategory[defaultsName] || 'unknown',
  };
}

const categoryKeys = new Set(['erp', 'programming', 'ai', 'management', 'internship']);

const pageInfo = (key) => {
  if (categoryKeys.has(key)) {
    return {
      type: 'Category fallback',
      category: key,
      pages: [`/courses/${key}`],
    };
  }
  const c = courseById[key];
  if (!c) return { type: 'Unknown', category: '—', pages: ['(unmapped)'] };
  return {
    type: 'Course',
    category: c.category,
    title: c.title,
    pages: [`/course/${c.slug}`, `/courses/${c.category}`],
  };
};

// ---------- HEAD-check every unique ID ----------
const url = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60`;
const check = async (id) => {
  try {
    const r = await fetch(url(id), { method: 'HEAD' });
    return r.status;
  } catch {
    return 'ERR';
  }
};

const uniqueIds = new Set();
for (const e of imageEntries) {
  uniqueIds.add(e.primary);
  uniqueIds.add(e.secondary);
}
const statusById = new Map();
const ids = [...uniqueIds];
const concurrency = 10;
for (let i = 0; i < ids.length; i += concurrency) {
  const batch = ids.slice(i, i + concurrency);
  const results = await Promise.all(batch.map(check));
  batch.forEach((id, j) => statusById.set(id, results[j]));
}

// ---------- Build per-category pool of healthy IDs for suggestions ----------
const healthyByCategory = {};
for (const e of imageEntries) {
  const info = pageInfo(e.key);
  const cat = info.category;
  if (!healthyByCategory[cat]) healthyByCategory[cat] = [];
  for (const slot of ['primary', 'secondary']) {
    const id = e[slot];
    if (statusById.get(id) === 200) healthyByCategory[cat].push(id);
  }
}
const suggestReplacement = (category) => {
  const pool = healthyByCategory[category] || healthyByCategory.erp || [];
  return pool[Math.floor(Math.random() * pool.length)] || '(no healthy reference available)';
};

// ---------- Collect broken rows ----------
const broken = [];
for (const e of imageEntries) {
  for (const slot of ['primary', 'secondary']) {
    const id = e[slot];
    const status = statusById.get(id);
    if (status === 200) continue;
    const info = pageInfo(e.key);
    broken.push({
      key: e.key,
      slot,
      id,
      status,
      type: info.type,
      title: info.title || '—',
      category: info.category,
      pages: info.pages.join(' | '),
      brokenUrl: url(id),
      suggestedId: suggestReplacement(info.category),
    });
  }
}

// ---------- Write reports ----------
const outDir = '/mnt/documents';
mkdirSync(outDir, { recursive: true });

// CSV
const csvHeader = ['Course Key', 'Slot', 'Type', 'Title', 'Category', 'Pages', 'Status', 'Broken ID', 'Broken URL', 'Suggested Replacement ID'];
const escape = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvRows = broken.map((b) => [b.key, b.slot, b.type, b.title, b.category, b.pages, b.status, b.id, b.brokenUrl, b.suggestedId].map(escape).join(','));
const csv = [csvHeader.join(','), ...csvRows].join('\n');
writeFileSync(`${outDir}/course-image-report.csv`, csv, 'utf8');

// HTML
const generated = new Date().toISOString();
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Course Image Health Report</title>
<style>
  :root { --bg:#0f172a; --panel:#1e293b; --text:#f1f5f9; --muted:#94a3b8; --bad:#ef4444; --ok:#10b981; --accent:#f59e0b; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); margin: 0; padding: 32px; }
  h1 { margin: 0 0 4px; font-size: 28px; }
  .meta { color: var(--muted); margin-bottom: 24px; font-size: 14px; }
  .summary { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
  .card { background: var(--panel); padding: 16px 20px; border-radius: 12px; min-width: 160px; }
  .card .label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
  .card .value { font-size: 28px; font-weight: 700; margin-top: 4px; }
  .card.bad .value { color: var(--bad); }
  .card.ok .value { color: var(--ok); }
  table { width: 100%; border-collapse: collapse; background: var(--panel); border-radius: 12px; overflow: hidden; }
  th, td { padding: 12px 14px; text-align: left; font-size: 13px; vertical-align: top; }
  th { background: rgba(255,255,255,0.05); color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; font-size: 11px; }
  tr + tr td { border-top: 1px solid rgba(255,255,255,0.05); }
  code { background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .pill.bad { background: rgba(239,68,68,0.15); color: var(--bad); }
  .pill.ok { background: rgba(16,185,129,0.15); color: var(--ok); }
  .pill.cat { background: rgba(245,158,11,0.15); color: var(--accent); }
  a { color: #60a5fa; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .empty { background: var(--panel); padding: 48px; text-align: center; border-radius: 12px; }
  .empty .big { font-size: 48px; margin-bottom: 8px; }
</style>
</head>
<body>
  <h1>Course Image Health Report</h1>
  <div class="meta">Generated ${generated}</div>

  <div class="summary">
    <div class="card"><div class="label">Image entries</div><div class="value">${imageEntries.length}</div></div>
    <div class="card"><div class="label">Unique IDs scanned</div><div class="value">${uniqueIds.size}</div></div>
    <div class="card ${broken.length ? 'bad' : 'ok'}"><div class="label">Broken</div><div class="value">${broken.length}</div></div>
    <div class="card ok"><div class="label">Healthy</div><div class="value">${uniqueIds.size - new Set(broken.map(b => b.id)).size}</div></div>
  </div>

  ${broken.length === 0
    ? `<div class="empty"><div class="big">✅</div><div>All course images are loading correctly.</div></div>`
    : `<table>
        <thead>
          <tr>
            <th>Course Key</th>
            <th>Slot</th>
            <th>Title / Type</th>
            <th>Category</th>
            <th>Pages</th>
            <th>Status</th>
            <th>Broken ID</th>
            <th>Suggested Replacement</th>
          </tr>
        </thead>
        <tbody>
          ${broken.map((b) => `
            <tr>
              <td><code>${b.key}</code></td>
              <td>${b.slot}</td>
              <td>${b.title}<br/><span class="pill cat">${b.type}</span></td>
              <td>${b.category}</td>
              <td>${b.pages.split(' | ').map(p => `<a href="${p}">${p}</a>`).join('<br/>')}</td>
              <td><span class="pill bad">${b.status}</span></td>
              <td><a href="${b.brokenUrl}" target="_blank"><code>${b.id}</code></a></td>
              <td><code>${b.suggestedId}</code></td>
            </tr>
          `).join('')}
        </tbody>
      </table>`}
</body>
</html>`;
writeFileSync(`${outDir}/course-image-report.html`, html, 'utf8');

// ---------- Console summary ----------
console.log(`Checked ${uniqueIds.size} unique image IDs across ${imageEntries.length} entries.`);
if (broken.length === 0) {
  console.log('✅ All course images OK');
} else {
  console.log(`❌ ${broken.length} broken references:`);
  for (const b of broken) console.log(`  - ${b.key}.${b.slot} [${b.status}] ${b.id} → suggest ${b.suggestedId}`);
}
console.log(`\nReports written:`);
console.log(`  ${outDir}/course-image-report.csv`);
console.log(`  ${outDir}/course-image-report.html`);

process.exit(broken.length === 0 ? 0 : 1);
