import { test, expect } from "./fixtures";
for (const path of ["/locations/kerala/kochi-ernakulam/course/warehouse-management", "/locations/kerala/trivandrum/generative-ai-course", "/ai-guides/rag", "/keyword-courses/rag"]) {
  test(`react keeps server title ${path}`, async ({ page, request }) => {
    const html = await (await request.get(path)).text();
    const served = html.match(/<title>([^<]+)<\/title>/)![1].replace(/&amp;/g, "&");
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(served);
  });
}
