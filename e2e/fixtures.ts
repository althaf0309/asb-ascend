import { test as base, expect, type Page, type APIRequestContext } from "@playwright/test";

export const ADMIN = { username: "e2e-admin", password: "e2e-password-123" };

// Third-party trackers would record test traffic as real visitors.
const BLOCKED = /googletagmanager\.com|google-analytics\.com|analytics\.google\.com|clarity\.ms|c\.bing\.com|api\.web3forms\.com/;

/** Errors from the page itself, ignoring blocked third-party requests. */
export type PageProblems = { errors: string[]; cspViolations: string[] };

export const test = base.extend<{ problems: PageProblems }>({
  page: async ({ page }, use) => {
    await page.route(BLOCKED, (route) => route.abort());
    await use(page);
  },
  problems: async ({ page }, use) => {
    const problems: PageProblems = { errors: [], cspViolations: [] };
    page.on("pageerror", (error) => problems.errors.push(error.message));
    page.on("console", (message) => {
      const text = message.text();
      if (message.type() !== "error" || BLOCKED.test(text) || /ERR_FAILED|net::ERR_BLOCKED|Failed to load resource/.test(text)) return;
      if (/Content Security Policy/i.test(text)) problems.cspViolations.push(text);
      else problems.errors.push(text);
    });
    await use(problems);
  },
});

export { expect };

/** Waits until Cloudflare Turnstile has issued a token inside the given form. */
export const waitForTurnstile = async (page: Page, scope = page.locator("form").first()) => {
  await expect(scope.locator('input[name="cf-turnstile-response"]')).toHaveValue(/.+/, { timeout: 20_000 });
};

export const adminToken = async (request: APIRequestContext) => {
  const res = await request.post("/api/admin/login", { data: ADMIN });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).token as string;
};

export const adminSubmissions = async (request: APIRequestContext) => {
  const token = await adminToken(request);
  const res = await request.get("/api/admin/submissions", { headers: { Authorization: `Bearer ${token}` } });
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as Array<Record<string, string>>;
};

/** Visible words in raw server HTML, before any JavaScript runs. */
export const rawWords = (html: string) =>
  (html.split(/<body[^>]*>/i)[1] || "")
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
