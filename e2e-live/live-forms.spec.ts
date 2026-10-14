import { test, expect } from "@playwright/test";
/**
 * Read-only smoke test of the LIVE site's lead forms: loads each page, checks
 * the form is usable, and never submits. Run after every deploy:
 *   npm run check:live
 * Turnstile does not issue tokens to automated browsers, so the token is only
 * reported, not asserted; the backend keeps token-less enquiries as unverified.
 */
for (const path of ["/contact", "/", "/apply", "/course-training/Diploma-in-warehouse-Management/warehouse-course-in-kochi"]) {
  test(`live form on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text().slice(0, 200)); });
    await page.route(/googletagmanager|google-analytics|clarity\.ms|c\.bing\.com/, (r) => r.abort());
    await page.goto("https://www.asbtraininghub.com" + path, { waitUntil: "networkidle" });
    const form = page.locator("form").filter({ has: page.getByPlaceholder("Phone Number *") }).first();
    await form.scrollIntoViewIfNeeded();
    const visible = await form.isVisible();
    const humanBox = await page.getByText("I am human").count();
    const token = await form.locator('input[name="cf-turnstile-response"]').first().inputValue({ timeout: 20000 }).catch(() => "NONE");
    const button = form.getByRole("button", { name: /submit|send|enquire|inquir|apply/i }).first();
    const pageErrors = errors.filter((e) => e.startsWith("pageerror"));
    console.log(JSON.stringify({ path, formVisible: visible, turnstileToken: token ? "issued" : "not issued (normal for automation)", pageErrors }));
    expect(visible, "lead form is not visible").toBe(true);
    expect(humanBox, "the manual 'I am human' step is back").toBe(0);
    await expect(button).toBeEnabled();
    expect(pageErrors, pageErrors.join(" | ")).toEqual([]);
  });
}
