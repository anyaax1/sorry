import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 3,
  timeout: 30000,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://127.0.0.1:5177', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5177 --strictPort',
    url: 'http://127.0.0.1:5177',
    reuseExistingServer: false,
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:5177', VITE_ANALYTICS_ENABLED: 'true' },
  },
  projects: [
    { name: 'unit', testMatch: 'geometry.spec.ts' },
    ...[
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'laptop', width: 1280, height: 720 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'phone', width: 390, height: 844 },
      { name: 'narrow', width: 320, height: 568 },
      { name: 'landscape', width: 844, height: 390 },
    ].map(({ name, width, height }) => ({ name, testIgnore: 'geometry.spec.ts', use: { browserName: 'chromium' as const, viewport: { width, height }, hasTouch: width < 800 } })),
    { name: 'webkit-phone', testIgnore: 'geometry.spec.ts', use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
});
