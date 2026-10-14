import { defineConfig, devices } from "@playwright/test";
export default defineConfig({ testDir: ".", timeout: 60_000, workers: 2, projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }, { name: "phone", use: { ...devices["Pixel 7"] } }] });
