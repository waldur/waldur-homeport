import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: 'Waldur HomePort',
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/results/output-[hash].xml',
  },
  env: {
    USER_UUID: '3a836bc76e1b40349ec1a0d8220f374f',
  },
  defaultCommandTimeout: 10000,
  viewportWidth: 1440,
  viewportHeight: 900,
  e2e: {
    baseUrl: 'http://localhost:8001/',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
