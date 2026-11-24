/** @type {import('playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  /* If you are using TypeScript, specify a file extension to use */
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use for test results */
  reporter: [
    ['list'],
    ['html'],
  ],
  /* Shared settings for all the tests */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retain',

    /* Headless mode - set to false to see what's happening */
    headless: true,

    /* Visual viewport */
    viewport: { width: 1280, height: 720 },

    /* More sensible defaults for Next.js */
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
};

module.exports = config;