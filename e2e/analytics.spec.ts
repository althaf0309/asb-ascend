import { test, expect, adminToken } from "./fixtures";

// The server ignores headless browsers as bots; present as an ordinary phone browser.
test.use({ userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36" });

test("clicks reach the admin report with app, page, location and device, without double-tap duplicates", async ({ page, request }) => {
  await page.route(/wa\.me/, (route) => route.abort());
  await page.goto("/contact");
  await page.waitForLoadState("networkidle");
  const visitor = await page.evaluate(() => localStorage.getItem("asb_visitor_id"));
  expect(visitor).toBeTruthy();

  const whatsapp = page.locator('a[data-placement="floating_button"]');
  await whatsapp.dispatchEvent("click");
  await whatsapp.dispatchEvent("click"); // double-tap: must count once
  await page.locator("nav").getByRole("link", { name: "About", exact: true }).first().click();
  await expect(page).toHaveURL(/\/about$/);

  const token = await adminToken(request);
  await expect.poll(async () => {
    const res = await request.get("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });
    const mine = ((await res.json()).clickLog as Array<Record<string, unknown>>).filter((c) => c.visitor === visitor!.slice(0, 8));
    return mine.map((c) => `${c.channel}|${c.path}|${c.placement}|${c.device}|${c.location}`).sort();
  }).toEqual([
    "navigation|/contact|navbar|Mobile|Local network",
    "whatsapp|/contact|floating_button|Mobile|Local network",
  ]);
});

test("admin analytics page shows the click report", async ({ page, request }) => {
  await adminToken(request);
  await page.goto("/admin/analytics");
  await page.getByPlaceholder("Username").fill("e2e-admin");
  await page.getByPlaceholder("Password").fill("e2e-password-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  for (const heading of ["Contact clicks by app", "Visitor locations", "Most clicked", "Click log"]) {
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
