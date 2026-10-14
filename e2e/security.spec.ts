import { test, expect } from "./fixtures";

test("pages send security headers with Clarity and GA4 allowed by the CSP", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  const csp = headers["content-security-policy"] || "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("https://www.clarity.ms");
  expect(csp).toMatch(/https:\/\/\*\.clarity\.ms/);
  expect(csp).toMatch(/https:\/\/\*\.google-analytics\.com/);
  expect(headers["x-content-type-options"]).toBe("nosniff");
  // nginx owns HSTS in production; the backend must not duplicate it.
  expect(headers["strict-transport-security"]).toBeUndefined();
});

test("admin APIs refuse anonymous requests", async ({ request }) => {
  expect((await request.get("/api/admin/submissions")).status()).toBe(401);
  expect((await request.post("/api/admin/blogs", { data: { title: "x" } })).status()).toBe(401);
});

test("public read APIs are not rate-limited at normal crawl speed", async ({ request }) => {
  const statuses = await Promise.all(Array.from({ length: 60 }, () => request.get("/api/blogs/python-vs-java").then((r) => r.status())));
  expect(statuses.filter((s) => s !== 200)).toEqual([]);
});

test("blog HTML cannot run injected scripts", async ({ page }) => {
  let dialog = false;
  page.on("dialog", async (d) => { dialog = true; await d.dismiss(); });
  await page.goto("/blog/python-vs-java");
  await page.waitForLoadState("networkidle");
  expect(dialog).toBe(false);
});
