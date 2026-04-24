#!/usr/bin/env node
/**
 * Scans every Unsplash photo ID referenced in src/data/courseImages.ts
 * and reports any that return a non-200 status.
 *
 * Usage:
 *   node scripts/check-course-images.mjs
 *
 * Exits with code 1 if any broken references are found, so it can be wired
 * into CI to prevent broken course images from regressing.
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, '../src/data/courseImages.ts');
const src = readFileSync(filePath, 'utf8');

const entries = [];
const quoted = /'([^']+)':\s*\{\s*primary:\s*u\('([^']+)'\),\s*secondary:\s*u\('([^']+)'\)/g;
const bare = /(\w+):\s*\{\s*primary:\s*u\('([^']+)'\),\s*secondary:\s*u\('([^']+)'\)\s*\}/g;
let m;
while ((m = quoted.exec(src))) entries.push({ key: m[1], primary: m[2], secondary: m[3] });
while ((m = bare.exec(src))) entries.push({ key: m[1], primary: m[2], secondary: m[3] });

const url = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=60`;

const check = async (id) => {
  try {
    const r = await fetch(url(id), { method: 'HEAD' });
    return r.status;
  } catch {
    return 'ERR';
  }
};

const seen = new Map();
const broken = [];
for (const e of entries) {
  for (const slot of ['primary', 'secondary']) {
    const id = e[slot];
    if (!seen.has(id)) seen.set(id, await check(id));
    const status = seen.get(id);
    if (status !== 200) broken.push({ key: e.key, slot, id, status });
  }
}

console.log(`Checked ${seen.size} unique image IDs across ${entries.length} entries.`);
if (broken.length === 0) {
  console.log('✅ All course images OK');
  process.exit(0);
} else {
  console.log(`❌ ${broken.length} broken references:`);
  for (const b of broken) console.log(`  - ${b.key}.${b.slot} [${b.status}] ${b.id}`);
  process.exit(1);
}
