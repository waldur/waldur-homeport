# Testing

## Unit tests

Unit tests are used for testing React components and utilities. They are written in `.test.ts` or `.test.tsx` files located next to the code they test.

Run tests using `yarn test` command.

Unit tests use written using:

* [Vitest](https://vitest.dev/) as the test runner
* [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) for testing React components
* [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) for simulating user interactions

## E2E tests

E2E tests are implemented using [Playwright](https://playwright.dev/).

* Run E2E tests: `yarn test:e2e`
* Run visual regression tests: `yarn test:visual`
* Update visual snapshots: `yarn test:visual:update`

E2E tests are located in:

* `e2e/` - E2E test specifications
* `e2e-visual/` - Visual regression tests
* `playwright.config.ts` - Playwright configuration
