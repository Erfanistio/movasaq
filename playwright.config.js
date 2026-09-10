import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
process.env.E2E_ADMIN_PASSWORD ||= randomBytes(24).toString('hex');
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3101', channel: 'chrome', screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'node server/index.js',
    url: 'http://127.0.0.1:3101/api/content',
    env: { PORT: '3101', DB_PATH: ':memory:', NODE_ENV: 'test', ADMIN_USERNAME: 'admin', ADMIN_PASSWORD: process.env.E2E_ADMIN_PASSWORD },
  },
});
