import { test, expect, rawWords } from "./fixtures";

/**
 * What a crawler receives before any JavaScript runs: Google's first pass,
 * and the only pass for most AI crawlers.
 */
const RAW_HTML: Array<[string, number]> = [
  ["/", 300],
  ["/about", 150],
  ["/ai-courses", 200],
  ["/courses", 150],
  ["/course-training/Diploma-in-Logistics-and-Supply-Chain-Management", 1200],
  ["/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi", 1200],
  ["/course-training/agentic/ai/agentic-ai-course-kerala", 1000],
  // The seeded starter post is short; live posts are longer.
  ["/blog/python-vs-java", 60],
];

for (const [path, minWords] of RAW_HTML) {
  test(`raw HTML of ${path} is complete and self-canonical`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain(`<link rel="canonical" href="https://www.asbtraininghub.com${path === "/" ? "/" : path}"`);
    expect(html).toMatch(/<meta name="robots" content="index, follow">/);
    expect(html).toMatch(/<h1>[^<]+<\/h1>/);
    expect(html).not.toMatch(/<meta\s+name=["']keywords["']/i);
    expect(html).not.toMatch(/ERP, ERP|â€/);
    expect(rawWords(html)).toBeGreaterThanOrEqual(minWords);
  });
}

test("moved keyword pages answer with a permanent redirect", async ({ request }) => {
  const res = await request.get("/course-training/Diploma-in-Logistics-and-Supply-Chain-Management/warehouse-executive-course", { maxRedirects: 0 });
  expect(res.status()).toBe(301);
  expect(res.headers().location).toBe("/course-training/Diploma-in-warehouse-Management/warehouse-executive-course");
});

test("sitemap lists dated, live URLs", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  const urls = [...xml.matchAll(/<loc>https:\/\/www\.asbtraininghub\.com([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(urls.length).toBeGreaterThan(3000);
  expect((xml.match(/<lastmod>/g) || []).length).toBe(urls.length);
  // Spot-check an evenly spread sample end to end.
  const sample = urls.filter((_, i) => i % Math.ceil(urls.length / 40) === 0);
  for (const url of sample) {
    const res = await request.get(url, { maxRedirects: 0 });
    expect(res.status(), url).toBe(200);
    expect(await res.text(), url).toContain(`href="https://www.asbtraininghub.com${url}"`);
  }
});

test("robots.txt and llms.txt are served", async ({ request }) => {
  expect(await (await request.get("/robots.txt")).text()).toMatch(/Sitemap: https:\/\/www\.asbtraininghub\.com\/sitemap\.xml/);
  expect(await (await request.get("/llms.txt")).text()).toMatch(/# ASB Training Hub/);
});

test("structured data on key pages is valid JSON", async ({ request }) => {
  for (const path of ["/", "/course/human-resource-management", "/ai-courses/rag-course-kerala", "/faq"]) {
    const html = await (await request.get(path)).text();
    const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
    expect(blocks.length, path).toBeGreaterThan(0);
    for (const block of blocks) expect(() => JSON.parse(block), path).not.toThrow();
  }
});
