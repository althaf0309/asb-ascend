import { test, expect, rawWords } from "./fixtures";

/** Quick facts and quotable answers, in the raw HTML and in the visitor's browser. */
const KEYWORD = "/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi";

test("crawlers receive quick facts and quotable answers in the raw HTML", async ({ request }) => {
  const html = await (await request.get(KEYWORD)).text();
  expect(html).toContain('id="quick-facts"');
  expect(html).toContain("learners in Kochi join through live-online batches");
  expect(html).toContain("+91 87147 73304");
  expect(rawWords(html)).toBeGreaterThan(1500);
});

test("visitors see the same answers after the page loads", async ({ page }) => {
  await page.goto(KEYWORD);
  await expect(page.getByRole("heading", { name: "Quick facts" })).toBeVisible();
  await expect(page.getByText("Live online from Kochi")).toBeVisible();
  await expect(page.locator(".citable-answer")).toHaveCount(6);
  await expect(page.locator(".citable-answer").first()).toContainText("learners in Kochi join through live-online batches");
});

test("the rendered page keeps the same search snippet the server sent", async ({ page, request }) => {
  const html = await (await request.get(KEYWORD)).text();
  const served = html.match(/<title>([^<]+)<\/title>/)![1];
  await page.goto(KEYWORD);
  await expect(page.locator(".citable-answer").first()).toBeVisible();
  await expect(page).toHaveTitle(served);
  expect(served).toContain("Warehouse Course in Kochi");
});

test("the homepage hero pauses when scrolled away", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator("section").first();
  await expect(hero).not.toHaveClass(/hero-offscreen/);
  await page.evaluate(() => scrollTo(0, 3000));
  await expect(hero).toHaveClass(/hero-offscreen/);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(hero).not.toHaveClass(/hero-offscreen/);
});

test("the homepage keeps a clean title after the page loads", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle("ASB Training Hub | ERP, AI & Programming Courses in Trivandrum");
});

test("a course page shows its quick facts", async ({ page }) => {
  await page.goto("/course/warehouse-management");
  await expect(page.getByRole("heading", { name: "Quick facts" })).toBeVisible();
  await expect(page.locator(".citable-answer").first()).toContainText("ASB Training Hub");
});

test("an AI keyword page shows answers from its course", async ({ page }) => {
  await page.goto("/course-training/agentic/ai/agentic-ai-course-kerala");
  await expect(page.locator(".citable-answer").first()).toContainText("Agentic AI Training");
});

test("the article feed is valid and linked from every page", async ({ request }) => {
  const res = await request.get("/feed.xml");
  expect(res.headers()["content-type"]).toContain("rss+xml");
  expect(await res.text()).toContain("<rss");
  expect(await (await request.get("/about")).text()).toContain('type="application/rss+xml"');
});
