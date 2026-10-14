import { test, expect } from "./fixtures";

/** Every page type renders in a real browser with its heading, title and no script errors. */
const pages: Array<[string, RegExp]> = [
  ["/", /Transform Your Career/i],
  ["/about", /Empowering Careers/i],
  ["/courses", /course/i],
  ["/courses/erp", /ERP/i],
  ["/course/human-resource-management", /Human Resource/i],
  ["/training", /training/i],
  ["/blog", /blog|insight|article/i],
  ["/blog/python-vs-java", /Python/i],
  ["/ai-courses", /AI/i],
  ["/ai-courses/llm-course-kerala", /LLM/i],
  ["/ai-guides/rag", /RAG/i],
  ["/keyword-courses/rag", /RAG/i],
  ["/course-training/agentic/ai/agentic-ai-course-kerala", /Agentic AI/i],
  ["/course-training/Diploma-in-Logistics-and-Supply-Chain-Management", /Logistics/i],
  ["/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi", /Warehouse course in Kochi/i],
  ["/course-training/logistics", /Logistics/i],
  ["/locations/kerala", /Kerala/i],
  ["/locations/kerala/kochi-ernakulam", /Kochi/i],
  ["/faq", /question/i],
  ["/contact", /Get In Touch/i],
  ["/apply", /Start Your Career Journey/i],
  ["/reviews", /review|success/i],
  ["/terms-and-conditions", /terms/i],
];

for (const [path, heading] of pages) {
  test(`renders ${path}`, async ({ page, problems }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1").first()).toHaveText(heading);
    await expect(page).toHaveTitle(/ASB|Kerala|Course|Training/i);
    // React has taken over from the server-rendered shell.
    await expect(page.locator("main [data-server-rendered]")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    expect(problems.errors, problems.errors.join("\n")).toEqual([]);
    expect(problems.cspViolations, problems.cspViolations.join("\n")).toEqual([]);
  });
}

test("an unknown URL shows the 404 page and is noindexed", async ({ page }) => {
  const response = await page.goto("/this-page-does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("keyword pages show their course photo and unique illustration", async ({ page }) => {
  await page.goto("/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi");
  for (const img of [page.locator('img[src^="/images/"]').first(), page.locator('figure img[src*="/generated/logistics/"]')]) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => `${el.getAttribute("src")} complete=${el.complete} width=${el.naturalWidth}`)).toMatch(/complete=true width=[1-9]/);
  }
});

test("course listing links through to a course detail page", async ({ page }) => {
  await page.goto("/courses/erp");
  const first = page.locator('main a[href^="/course/"]').first();
  const href = await first.getAttribute("href");
  await first.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("h1")).toBeVisible();
});

test("blog listing links through to a post", async ({ page }) => {
  await page.goto("/blog");
  const post = page.locator('main a[href^="/blog/"]').first();
  await post.click();
  await expect(page).toHaveURL(/\/blog\/.+/);
  await expect(page.locator("h1")).toBeVisible();
});

test("related keyword links navigate between logistics pages", async ({ page }) => {
  await page.goto("/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi");
  const related = page.locator('aside a[href^="/course-training/"]').first();
  const href = await related.getAttribute("href");
  await related.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
});

test("navbar links reach the main sections", async ({ page }) => {
  await page.goto("/");
  for (const [label, url] of [["About", /\/about$/], ["Contact", /\/contact$/]] as const) {
    await page.locator("nav").getByRole("link", { name: label, exact: true }).first().click();
    await expect(page).toHaveURL(url);
  }
});
