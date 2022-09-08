import { defineConfig } from 'cypress'

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
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:8001/',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
