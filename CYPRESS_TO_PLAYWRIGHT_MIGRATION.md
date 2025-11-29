# Cypress to Playwright Migration Guide

This document provides a complete analysis of the existing Cypress test suite and detailed instructions for migrating to Playwright.

## Table of Contents
1. [Current Cypress Setup Analysis](#current-cypress-setup-analysis)
2. [Installation Instructions](#installation-instructions)
3. [Configuration](#configuration)
4. [Custom Commands Conversion](#custom-commands-conversion)
5. [Selector Migration Reference](#selector-migration-reference)
6. [Test File Migration](#test-file-migration)
7. [Fixtures](#fixtures)
8. [CI/CD Updates](#cicd-updates)

---

## Current Cypress Setup Analysis

### Overview

| Metric | Value |
|--------|-------|
| Total Test Files | 38 active spec files |
| Custom Commands | 21 commands in `cypress/support/commands.ts` |
| Fixtures | 90 JSON files (~7,000 lines) |
| Test Areas | 13 functional domains |
| Viewport | 1440x900 |
| Default Timeout | 10,000ms |
| Base URL | http://localhost:8001/ |

### Cypress Configuration (`cypress.config.js`)

```javascript
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
```

### Test File Structure

```
cypress/
├── e2e/
│   ├── administration/
│   │   ├── categories.spec.ts
│   │   ├── customers.spec.ts
│   │   ├── features.spec.ts
│   │   └── users.spec.ts
│   ├── common/
│   │   ├── link.spec.ts
│   │   └── public-pages.spec.ts
│   ├── customer/
│   │   ├── billing.spec.ts
│   │   ├── create-buttons.spec.ts (disabled)
│   │   ├── create-dialog.ts
│   │   └── team.spec.ts
│   ├── group-invitations/
│   │   └── group-invitations.spec.ts
│   ├── invitations/
│   │   └── invitations.spec.ts
│   ├── join-organization.ts
│   ├── marketplace/
│   │   ├── create.spec.ts
│   │   ├── google-calendar-actions.spec.ts
│   │   ├── landing.spec.ts
│   │   ├── provider-offerings-actions.spec.ts
│   │   ├── public-offerings.spec.ts
│   │   ├── public-resources.spec.ts
│   │   ├── report-usage.spec.ts
│   │   └── search-popup.spec.ts
│   ├── openstack/
│   │   ├── create-vpc.spec.ts
│   │   ├── instance/
│   │   │   ├── commands.ts
│   │   │   └── create.spec.ts
│   │   └── volume/
│   │       └── detail-view.spec.ts
│   ├── project/
│   │   ├── bulk-import.spec.ts
│   │   ├── create-dialog.spec.ts
│   │   ├── manage.spec.ts
│   │   └── team.spec.ts
│   ├── proposals/
│   │   └── proposals.spec.ts
│   ├── reporting/
│   │   └── reports.spec.ts
│   ├── resources/
│   │   ├── resource-actions.spec.ts
│   │   └── set-backend-id.spec.ts
│   ├── support/
│   │   ├── broadcast.spec.ts
│   │   ├── issues.spec.ts
│   │   └── workspace.spec.ts
│   └── user/
│       ├── manage.spec.ts
│       ├── resources.spec.ts
│       ├── ssh-keys.spec.ts
│       └── workspace.spec.ts
├── fixtures/
│   ├── administration/
│   ├── calls/
│   ├── configuration/
│   ├── customers/
│   ├── dashboard/
│   ├── group-invitations/
│   ├── invitations/
│   ├── marketplace/
│   ├── offerings/
│   ├── openstack/
│   ├── projects/
│   ├── proposals/
│   ├── reporting/
│   ├── support/
│   └── users/
└── support/
    ├── commands.ts
    └── e2e.ts
```

### Dependencies

Current Cypress-related dependencies in `package.json`:
```json
{
  "devDependencies": {
    "cypress": "^14.5.0",
    "cypress-recurse": "^1.35.3",
    "eslint-plugin-cypress": "^4.1.0"
  }
}
```

---

## Installation Instructions

### Step 1: Install Playwright

```bash
yarn add -D @playwright/test
npx playwright install chromium
```

### Step 2: Create Directory Structure

```bash
mkdir -p playwright/tests
mkdir -p playwright/utils
mkdir -p playwright/fixtures
```

---

## Configuration

### Create `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/tests',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration (matching Cypress JUnit output)
  reporter: [
    ['html'],
    ['junit', { outputFile: 'playwright/results/output.xml' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL matching Cypress config
    baseURL: 'http://localhost:8001/',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Viewport matching Cypress config
    viewport: { width: 1440, height: 900 },
  },

  // Global timeout matching Cypress defaultCommandTimeout
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'yarn ci:start',
    url: 'http://localhost:8001/',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Create `playwright/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "baseUrl": ".",
    "paths": {
      "@fixtures/*": ["../cypress/fixtures/*"],
      "@utils/*": ["./utils/*"]
    }
  },
  "include": ["**/*.ts"]
}
```

---

## Custom Commands Conversion

### Create `playwright/utils/commands.ts`

This file converts all 21 Cypress custom commands to Playwright helper functions:

```typescript
import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Helper to load fixtures
export function loadFixture(fixturePath: string): unknown {
  const fullPath = path.join(__dirname, '../../cypress/fixtures', fixturePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

// ============================================
// Authentication & Setup Commands
// ============================================

/**
 * Sets authentication token in localStorage
 * Cypress equivalent: cy.setToken()
 */
export async function setToken(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.setItem('waldur/auth/token', 'valid');
  });
}

/**
 * Sets cookie consent flag in localStorage
 * Cypress equivalent: cy.setAcceptCookies()
 */
export async function setAcceptCookies(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.setItem('waldur/cookies/consent', 'true');
  });
}

/**
 * Accepts cookie alert if present
 * Cypress equivalent: cy.acceptCookies()
 */
export async function acceptCookies(page: Page): Promise<void> {
  const alert = page.locator('.cookiealert');
  if (await alert.isVisible()) {
    await alert.getByRole('button', { name: 'Accept' }).click();
  }
}

/**
 * Fill and submit login form
 * Cypress equivalent: cy.fillAndSubmitLoginForm(username, password)
 */
export async function fillAndSubmitLoginForm(
  page: Page,
  username = 'staff',
  password = 'secret'
): Promise<void> {
  await page.locator('input[placeholder="Username"]').fill(username);
  await page.locator('input[placeholder="Password"]').fill(password);
  await page.locator('button[type="submit"]').click();
}

// ============================================
// Wait Commands
// ============================================

/**
 * Wait for loading spinner to disappear
 * Cypress equivalent: cy.waitForSpinner()
 */
export async function waitForSpinner(page: Page): Promise<void> {
  await page.locator('.animation-spin').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
    // Spinner might not be present, that's ok
  });
}

/**
 * Wait for page to load completely
 * Cypress equivalent: cy.waitForPage()
 */
export async function waitForPage(page: Page): Promise<void> {
  await page.locator('#kt_content_container').waitFor({ state: 'visible' });
  await page.waitForTimeout(1600);
  await waitForSpinner(page);
}

// ============================================
// Dropdown & Select Commands
// ============================================

/**
 * Open dropdown by label text
 * Cypress equivalent: cy.openDropdownByLabel(label)
 */
export async function openDropdownByLabel(page: Page, label: string): Promise<void> {
  const labelElement = page.locator('label').filter({ hasText: label });
  const dropdown = labelElement.locator('..').locator('div[class$="placeholder"]');
  await dropdown.click({ force: true });
}

/**
 * Open dropdown by label (with force/double click)
 * Cypress equivalent: cy.openDropdownByLabelForce(label)
 */
export async function openDropdownByLabelForce(page: Page, label: string): Promise<void> {
  await openDropdownByLabel(page, label);
  await openDropdownByLabel(page, label);
}

/**
 * Select role from dropdown
 * Cypress equivalent: cy.selectRole(label)
 */
export async function selectRole(page: Page, roleLabel: string): Promise<void> {
  const roleContainer = page.locator('label').filter({ hasText: 'Role' }).locator('..');
  await roleContainer.locator('[class*="-control"]').click({ force: true });
  await page.locator('[class*="-option"]').filter({ hasText: roleLabel }).click({ force: true });
}

/**
 * Select first option from dropdown
 * Cypress equivalent: cy.selectTheFirstOptionOfDropdown()
 */
export async function selectTheFirstOptionOfDropdown(page: Page): Promise<void> {
  await page.locator('[role="option"]').first().click({ force: true });
}

/**
 * Open select dialog and choose option
 * Cypress equivalent: cy.openSelectDialog(selectId, option)
 */
export async function openSelectDialog(
  page: Page,
  selectId: string,
  option: string
): Promise<void> {
  await page.locator(`a#${selectId}`).click();
  await page.locator('.modal-content').waitFor({ state: 'visible' });
  await page.locator('.modal-content').getByText(option).click();
}

// ============================================
// Table Filter Commands
// ============================================

/**
 * Select table filter
 * Cypress equivalent: cy.selectTableFilter(label, value, apply, type)
 */
export async function selectTableFilter(
  page: Page,
  label: string,
  value?: string | null,
  apply = false,
  type = false
): Promise<void> {
  await acceptCookies(page);

  // Open filter menu
  await page.locator('.card-table button.btn-toggle-filters').click();

  const filterMenu = page.locator('.card-table .table-filters-menu:not(.column-filter)');
  const menuLink = filterMenu.locator('.menu-link').filter({ hasText: label });
  await menuLink.click();

  const menuParent = menuLink.locator('..');
  const filterField = menuParent.locator('.menu-sub .filter-field > *').first();

  // Check if it's a checkbox or select
  const isCheckbox = await filterField.evaluate(el => el.classList.contains('form-check'));

  if (isCheckbox) {
    await menuParent.locator('.menu-sub .filter-field .form-check input').click({ force: true });
  } else {
    const control = menuParent.locator('.menu-sub .filter-field div[class$="-control"]');
    if (type && value) {
      await control.click();
      await control.pressSequentially(value);
    } else {
      await control.click();
    }

    // Select option
    if (value === null || value === undefined) {
      await selectTheFirstOptionOfDropdown(page);
    } else {
      await page.locator('div[id^="react-select"]').filter({ hasText: value }).click({ force: true });
    }
  }

  if (apply) {
    await menuParent.locator('.filter-footer button').filter({ hasText: 'Apply' }).click({ force: true });
    // Wait for loading
    const spinner = page.locator('[data-cy=loading-spinner]').first();
    if (await spinner.isVisible()) {
      await waitForSpinner(page);
    }
  }
}

// ============================================
// Date Picker Commands
// ============================================

/**
 * Select date from react-datepicker
 * Cypress equivalent: cy.selectDate()
 */
export async function selectDate(page: Page): Promise<void> {
  await page.locator('.react-datepicker-wrapper input').click();
  await page
    .locator('.react-datepicker__week:last-child .react-datepicker__day:first-child')
    .click();
}

/**
 * Select date from flatpickr
 * Cypress equivalent: cy.selectFlatpickrDate(inputQueryPath, date)
 */
export async function selectFlatpickrDate(
  page: Page,
  inputQueryPath: string,
  date?: string
): Promise<void> {
  if (date) {
    const d = new Date(date);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = months[d.getMonth()];

    await page.locator(inputQueryPath).click({ force: true });
    await page.locator('.flatpickr-calendar').waitFor({ state: 'visible' });

    // Navigate to correct month
    let currentMonth = await page.locator('.flatpickr-calendar .cur-month').textContent();
    while (currentMonth?.trim() !== monthName) {
      await page.locator('.flatpickr-calendar .flatpickr-next-month').click();
      currentMonth = await page.locator('.flatpickr-calendar .cur-month').textContent();
    }

    // Set year
    await page.locator('.flatpickr-calendar input.cur-year').fill(d.getFullYear().toString());

    // Click day
    await page
      .locator('.flatpickr-calendar .flatpickr-innerContainer .dayContainer span.flatpickr-day')
      .filter({ hasText: new RegExp(`^${d.getDate()}$`) })
      .click();
  } else {
    await page.locator(inputQueryPath).locator('..').locator('.btn-circle').click({ force: true });
  }
}

// ============================================
// Navigation Commands
// ============================================

/**
 * Open workspace selector
 * Cypress equivalent: cy.openWorkspaceSelector()
 */
export async function openWorkspaceSelector(page: Page): Promise<void> {
  await waitForSpinner(page);
  await page.locator('[data-cy=select-workspace-toggle]').filter({ hasText: 'Select project' }).click();
  await page.locator('.modal-content').waitFor({ state: 'visible' });
  await waitForSpinner(page);
}

/**
 * Click sidebar menu item
 * Cypress equivalent: cy.clickSidebarMenuItem(menu, submenu)
 */
export async function clickSidebarMenuItem(
  page: Page,
  menu: string,
  submenu?: string
): Promise<void> {
  const menuItem = page.locator(`.aside-menu .menu-item`).filter({ hasText: menu });
  await menuItem.click();
  await page.waitForTimeout(500);

  if (submenu) {
    const hasShowClass = await menuItem.evaluate(el => el.classList.contains('show'));
    if (!hasShowClass) {
      await menuItem.click();
    }
    await page.waitForTimeout(500);

    const submenuItem = menuItem.locator('.menu-item').filter({ hasText: submenu });
    await submenuItem.click();
    await waitForSpinner(page);
    await expect(submenuItem).toHaveClass(/here/);
  } else {
    await waitForSpinner(page);
    await expect(menuItem).toHaveClass(/here/);
  }
}

/**
 * Assert button is disabled
 * Cypress equivalent: cy.buttonShouldBeDisabled(btnClass)
 */
export async function buttonShouldBeDisabled(page: Page, btnClass: string): Promise<void> {
  await expect(page.locator(btnClass)).toBeDisabled();
}
```

### Create `playwright/utils/mocks.ts`

This file handles API mocking (equivalent to `cy.intercept()`):

```typescript
import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

function loadFixture(fixturePath: string): unknown {
  const fullPath = path.join(__dirname, '../../cypress/fixtures', fixturePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

/**
 * Mock configuration endpoints
 * Cypress equivalent: cy.mockConfigs()
 */
export async function mockConfigs(page: Page): Promise<void> {
  await page.route('**/api/configuration/', route =>
    route.fulfill({ json: loadFixture('configuration.json') })
  );
  await page.route('**/api/events/**', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/roles/**', route =>
    route.fulfill({ json: loadFixture('roles.json') })
  );
}

/**
 * Mock user-related endpoints
 * Cypress equivalent: cy.mockUser(userName)
 */
export async function mockUser(page: Page, userName?: string): Promise<void> {
  const userData = userName === 'admin' ? 'admin.json' : 'alice.json';
  const userConfiguration = userName === 'admin' ? 'configuration-admin.json' : 'configuration.json';

  await page.route('**/api/configuration/', route =>
    route.fulfill({ json: loadFixture(userConfiguration) })
  );
  await page.route('**/api-auth/password/', route =>
    route.fulfill({ json: { token: 'valid' } })
  );
  await page.route('**/api/users/me/', route =>
    route.fulfill({ json: loadFixture(`users/${userData}`) })
  );
  await page.route('**/api/roles/**', route =>
    route.fulfill({ json: loadFixture('roles.json') })
  );
  await page.route('**/api/marketplace-categories/**', route =>
    route.fulfill({ json: loadFixture('marketplace/categories.json') })
  );
  await page.route('**/api/marketplace-category-groups/**', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/marketplace-global-categories/**', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/external-links/**', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/admin-announcements/**', route =>
    route.fulfill({ json: [] })
  );
}

/**
 * Mock customer endpoints
 * Cypress equivalent: cy.mockCustomer()
 */
export async function mockCustomer(page: Page): Promise<void> {
  await page.route('**/api/customers/bf6d515c9e6e445f9c339021b30fc96b/counters/', route =>
    route.fulfill({ json: {} })
  );
  await page.route('**/api/customers/bf6d515c9e6e445f9c339021b30fc96b/', route =>
    route.fulfill({ json: loadFixture('customers/alice.json') })
  );
  await page.route('**/api/invoices/**', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/projects/**', route =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/marketplace-orders/**', route =>
    route.fulfill({ json: [] })
  );
}

/**
 * Mock customers list endpoints
 * Cypress equivalent: cy.mockCustomers()
 */
export async function mockCustomers(page: Page): Promise<void> {
  await page.route('**/api/customers/**', route => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({ body: '', headers: {} });
    } else {
      route.fulfill({ json: [] });
    }
  });
}

/**
 * Mock checklists endpoints
 * Cypress equivalent: cy.mockChecklists()
 */
export async function mockChecklists(page: Page): Promise<void> {
  await page.route('**/api/marketplace-checklists/', route => {
    if (route.request().method() === 'HEAD') {
      route.fulfill({
        body: '',
        headers: { 'x-result-count': '1' },
      });
    } else {
      route.fulfill({ json: [] });
    }
  });
  await page.route('**/api/marketplace-checklists-categories/', route =>
    route.fulfill({ json: loadFixture('marketplace/checklists_categories.json') })
  );
}

/**
 * Mock events endpoints
 * Cypress equivalent: cy.mockEvents()
 */
export async function mockEvents(page: Page): Promise<void> {
  await page.route('**/api/events-stats/**', route =>
    route.fulfill({ json: [] })
  );
}
```

### Create `playwright/utils/index.ts`

```typescript
export * from './commands';
export * from './mocks';
```

---

## Selector Migration Reference

### Quick Reference Table

| Cypress | Playwright |
|---------|------------|
| `cy.get('[data-testid="x"]')` | `page.getByTestId('x')` |
| `cy.get('[data-cy="x"]')` | `page.locator('[data-cy="x"]')` |
| `cy.contains('text')` | `page.getByText('text')` |
| `cy.contains('button', 'Submit')` | `page.getByRole('button', { name: 'Submit' })` |
| `cy.get('.class')` | `page.locator('.class')` |
| `cy.get('#id')` | `page.locator('#id')` |
| `cy.get('input[name="x"]')` | `page.locator('input[name="x"]')` |
| `cy.get('input[placeholder="x"]')` | `page.getByPlaceholder('x')` |
| `.first()` | `.first()` |
| `.last()` | `.last()` |
| `.eq(n)` | `.nth(n)` |
| `.find('.child')` | `.locator('.child')` |
| `.parent()` | `.locator('..')` |
| `.next()` | Locator chaining or CSS `+` |
| `.within(() => {})` | Scoped locator |
| `.should('be.visible')` | `await expect(locator).toBeVisible()` |
| `.should('have.text', 'x')` | `await expect(locator).toHaveText('x')` |
| `.should('contain', 'x')` | `await expect(locator).toContainText('x')` |
| `.should('have.class', 'x')` | `await expect(locator).toHaveClass(/x/)` |
| `.should('be.disabled')` | `await expect(locator).toBeDisabled()` |
| `.should('exist')` | `await expect(locator).toBeAttached()` |
| `.should('not.exist')` | `await expect(locator).not.toBeAttached()` |
| `.click()` | `await locator.click()` |
| `.type('text')` | `await locator.fill('text')` |
| `.clear()` | `await locator.clear()` |
| `.check()` | `await locator.check()` |
| `.uncheck()` | `await locator.uncheck()` |
| `.select('option')` | `await locator.selectOption('option')` |
| `cy.wait(1000)` | `await page.waitForTimeout(1000)` |
| `cy.wait('@alias')` | `await page.waitForResponse()` |
| `cy.intercept()` | `await page.route()` |
| `cy.visit('/path')` | `await page.goto('/path')` |
| `cy.reload()` | `await page.reload()` |
| `cy.url()` | `page.url()` |

### Common Pattern Conversions

**Cypress chaining:**
```typescript
cy.get('.container')
  .find('.item')
  .first()
  .click();
```

**Playwright equivalent:**
```typescript
await page.locator('.container').locator('.item').first().click();
```

**Cypress within:**
```typescript
cy.get('.modal').within(() => {
  cy.get('input').type('text');
  cy.get('button').click();
});
```

**Playwright equivalent:**
```typescript
const modal = page.locator('.modal');
await modal.locator('input').fill('text');
await modal.locator('button').click();
```

**Cypress intercept with alias:**
```typescript
cy.intercept('GET', '/api/users').as('getUsers');
cy.visit('/');
cy.wait('@getUsers');
```

**Playwright equivalent:**
```typescript
const responsePromise = page.waitForResponse('**/api/users');
await page.goto('/');
await responsePromise;
```

---

## Test File Migration

### Migration Order (Priority)

**Priority 1 - Core (do these first):**
1. `common/public-pages.spec.ts`
2. `user/manage.spec.ts`
3. `user/workspace.spec.ts`
4. `marketplace/landing.spec.ts`
5. `project/manage.spec.ts`
6. `customer/team.spec.ts`
7. `support/workspace.spec.ts`
8. `invitations/invitations.spec.ts`

**Priority 2 - Key Features:**
- All marketplace tests
- OpenStack integration tests
- Admin tests

**Priority 3 - Remaining:**
- All other test files

### Example Migration: `common/public-pages.spec.ts`

**Original Cypress:**
```typescript
describe('Public pages', () => {
  beforeEach(() => {
    cy.mockConfigs();
  });

  it('should render TOS page', () => {
    cy.visit('/tos/');
    cy.get('h2').should('contain', 'Terms of Service');
  });

  it('should render Privacy Policy page', () => {
    cy.visit('/policy/privacy/');
    cy.get('h2').should('contain', 'Privacy Policy');
  });
});
```

**Migrated Playwright:**
```typescript
import { test, expect } from '@playwright/test';
import { mockConfigs } from '../utils/mocks';

test.describe('Public pages', () => {
  test.beforeEach(async ({ page }) => {
    await mockConfigs(page);
  });

  test('should render TOS page', async ({ page }) => {
    await page.goto('/tos/');
    await expect(page.locator('h2')).toContainText('Terms of Service');
  });

  test('should render Privacy Policy page', async ({ page }) => {
    await page.goto('/policy/privacy/');
    await expect(page.locator('h2')).toContainText('Privacy Policy');
  });
});
```

### Test Template

Use this template for converting each test file:

```typescript
import { test, expect } from '@playwright/test';
import {
  setToken,
  setAcceptCookies,
  waitForSpinner,
  waitForPage,
  // ... other utilities
} from '../utils/commands';
import {
  mockUser,
  mockCustomer,
  mockConfigs,
  // ... other mocks
} from '../utils/mocks';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mocks
    await mockUser(page);
    await mockCustomer(page);

    // Setup auth
    await setToken(page);
    await setAcceptCookies(page);
  });

  test('should do something', async ({ page }) => {
    await page.goto('/path/');
    await waitForPage(page);

    // Test assertions
    await expect(page.locator('.element')).toBeVisible();
  });
});
```

---

## Fixtures

### Reusing Existing Fixtures

All 90 JSON fixture files in `cypress/fixtures/` are fully compatible with Playwright. The `loadFixture()` helper function in `playwright/utils/mocks.ts` loads them directly.

### Fixture Categories

| Directory | Contents |
|-----------|----------|
| `administration/` | Organization groups, features, division types |
| `calls/` | Public call data |
| `configuration/` | App configuration (regular + admin) |
| `customers/` | User data (alice, admin, lebowski), invoices, billing |
| `dashboard/` | SSH key fixtures |
| `group-invitations/` | User group invitation states |
| `invitations/` | Customer invitation states |
| `marketplace/` | Categories, offerings, orders, service providers |
| `offerings/` | OpenStack offerings, flavors, images |
| `openstack/` | OpenStack resources |
| `projects/` | Project types, user lists |
| `proposals/` | Proposal data |
| `reporting/` | Financial reports |
| `support/` | Notifications, issues, comments |
| `users/` | User profiles |

---

## CI/CD Updates

### Update `package.json` Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report"
  }
}
```

### Remove Cypress Dependencies (after full migration)

```bash
yarn remove cypress cypress-recurse eslint-plugin-cypress
```

### Update ESLint Config

Remove or update `cypress/.eslintrc.cjs` for Playwright.

---

## Migration Checklist

- [ ] Install `@playwright/test` and browsers
- [ ] Create `playwright.config.ts`
- [ ] Create `playwright/utils/commands.ts`
- [ ] Create `playwright/utils/mocks.ts`
- [ ] Migrate Priority 1 tests (8 files)
- [ ] Migrate Priority 2 tests (10 files)
- [ ] Migrate Priority 3 tests (20 files)
- [ ] Update `package.json` scripts
- [ ] Update CI/CD pipeline
- [ ] Remove Cypress dependencies
- [ ] Delete `cypress/` directory

---

## Key Differences Summary

| Aspect | Cypress | Playwright |
|--------|---------|------------|
| Async | Implicit (chains) | Explicit (`await`) |
| Assertions | `.should()` chains | `expect()` matchers |
| Network | `cy.intercept()` | `page.route()` |
| Selectors | `cy.get()`, `cy.contains()` | `page.locator()`, `page.getByX()` |
| Custom commands | `Cypress.Commands.add()` | Helper functions |
| Fixtures | `fixture: 'file.json'` | `fs.readFileSync()` |
| Test isolation | `testIsolation: false` | Storage state |
| Browser | Runs inside browser | Runs outside browser |
| Parallelism | Limited | Full parallel support |

---

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Test API](https://playwright.dev/docs/api/class-test)
- [Migrating from Cypress](https://playwright.dev/docs/ci-intro)
- [Playwright Locators](https://playwright.dev/docs/locators)
