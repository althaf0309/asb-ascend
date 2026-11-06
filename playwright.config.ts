import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end suite: drives the built site and the real backend in Chromium.
 * Run with `npm run test:e2e` (builds dist-e2e/ first).
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: 4,
  // One retry absorbs a slow response from the external Turnstile test script;
  // a real failure fails twice, and a pass on retry is reported as "flaky".
  retries: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: "http://127.0.0.1:4273",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /mobile.spec.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /mobile\.spec\.ts/ },
  ],
  webServer: {
    command: "node e2e/server.mjs",
    url: "http://127.0.0.1:4273/api/health",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
