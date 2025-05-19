import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/frontend',
  timeout: 30000,
  use: {
    baseURL: 'https://my-survey-app.vercel.app',
    browserName: 'chromium',
    headless: true,
  },
});