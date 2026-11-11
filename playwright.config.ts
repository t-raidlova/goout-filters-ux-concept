import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const CI = !!process.env.CI

/**
 * End-to-end tests run against the production build (`vite build` + `vite preview`),
 * served under the same base path as GitHub Pages.
 *
 * Projects:
 * - chromium: every spec (Chrome, Edge).
 * - webkit: user flows in Safari's engine. Keyboard specs are skipped: WebKit follows
 *   Safari's default, where Tab skips buttons and links.
 * - mobile: user flows on an iPhone viewport with touch.
 * Accessibility and layout specs run once, in chromium: axe checks the DOM, and the
 * layout spec sets its own viewports.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: CI ? 2 : undefined,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}/goout-filters-ux-concept/`,
    locale: 'cs-CZ',
    timezoneId: 'Europe/Prague',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: [/keyboard\.spec/, /a11y\.spec/, /layout\.spec/],
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
      testIgnore: [/keyboard\.spec/, /a11y\.spec/, /layout\.spec/],
    },
  ],
  webServer: {
    command: `npx vite build && npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/goout-filters-ux-concept/`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
})
