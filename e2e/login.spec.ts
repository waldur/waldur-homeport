import { test, expect, Page } from '@playwright/test';

const CONFIGURATION_RESPONSE = {
  WALDUR_CORE: {
    AUTHENTICATION_METHODS: ['LOCAL_SIGNIN'],
    MARKETPLACE_LANDING_PAGE: 'Marketplace',
    COMPANY_TYPES: [],
    ONLY_STAFF_MANAGES_SERVICES: false,
    USER_MANDATORY_FIELDS: ['full_name', 'email'],
    DEFAULT_IDP: '',
    LANGUAGE_CHOICES: 'en',
    SITE_NAME: 'Waldur',
  },
  WALDUR_AUTH_SOCIAL: {},
  WALDUR_AUTH_SAML2: {
    ENABLE_SINGLE_LOGOUT: false,
    ALLOW_TO_SELECT_IDENTITY_PROVIDER: false,
    IDENTITY_PROVIDER_LABEL: null,
    IDENTITY_PROVIDER_URL: null,
  },
  WALDUR_SUPPORT: { ENABLED: false },
  LANGUAGES: [['en', 'English']],
  LANGUAGE_CODE: 'en',
  FEATURES: {},
};

async function mockApi(page: Page) {
  // Mock the configuration endpoint so the app can bootstrap
  await page.route('**/api/configuration/', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CONFIGURATION_RESPONSE),
    }),
  );

  // Mock other endpoints the app may call during bootstrap
  await page.route('**/api/roles/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/marketplace-categories/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/marketplace-category-groups/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/marketplace-global-categories/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/external-links/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
  await page.route('**/api/admin-announcements/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );
}

async function navigateToLogin(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('waldur/cookies/consent', 'true');
  });
  await page.reload();

  // Click "Sign in with local account" to reveal the login form
  await page
    .getByRole('button', { name: 'Sign in with local account' })
    .click();

  // Wait for the form to appear
  await expect(
    page.getByPlaceholder('Enter your username'),
  ).toBeVisible();
}

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await navigateToLogin(page);
  });

  test('should display the login form', async ({ page }) => {
    await expect(
      page.getByPlaceholder('Enter your username'),
    ).toBeVisible();
    await expect(
      page.getByPlaceholder('Enter your password'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Login' }),
    ).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Mock a failed login response
    await page.route('**/api-auth/password/', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: 'Unable to log in with provided credentials.',
        }),
      }),
    );

    await page.getByPlaceholder('Enter your username').fill('invalid_user');
    await page.getByPlaceholder('Enter your password').fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.getByRole('alert')).toContainText(
      'Unable to log in with provided credentials',
    );
  });

  test('should login successfully with valid credentials', async ({
    page,
  }) => {
    // Mock successful login
    await page.route('**/api-auth/password/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token' }),
      }),
    );
    await page.route('**/api/users/me/', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          uuid: '00000000000000000000000000000001',
          username: 'staff',
          full_name: 'Staff User',
          email: 'staff@example.com',
          is_staff: true,
          is_active: true,
        }),
      }),
    );

    await page.getByPlaceholder('Enter your username').fill('staff');
    await page.getByPlaceholder('Enter your password').fill('demo');
    await page.getByRole('button', { name: 'Login' }).click();

    // After successful login, the URL should change away from the login page
    await expect(page).not.toHaveURL(/signin/, { timeout: 15000 });
  });
});
