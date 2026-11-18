import {defineConfig,devices} from '@playwright/test'

export default defineConfig({
  testDir:'./src/tests/e2e',
  testMatch:'pwa.spec.ts',
  reporter:process.env.CI?'github':'list',
  use:{baseURL:'http://127.0.0.1:4175/netcals/',...devices['Desktop Chrome']},
  webServer:{command:'node scripts/serve-pwa-preview.mjs',url:'http://127.0.0.1:4175/netcals/',reuseExistingServer:!process.env.CI,timeout:30000},
})
