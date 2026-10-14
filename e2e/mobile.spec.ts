import { test, expect } from "./fixtures";

test("mobile menu opens and navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /menu/i }).click();
  const menu = page.locator("#mobile-menu");
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Contact", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
});

for (const path of ["/", "/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi", "/apply"]) {
  test(`${path} has no horizontal scroll on a phone`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test("the WhatsApp button is visible on a phone", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href*="wa.me"], a[href*="whatsapp"]').first()).toBeVisible();
});
