import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  use: {
    baseURL: "http://localhost:4200",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  webServer: {
    command: "npm run start -- --port 4200",
    url: "http://localhost:4200",
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }]
});
