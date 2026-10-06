import { test, expect, Page } from '@playwright/test';

/**
 * A row's actions menu must stay anchored to the button that opened it.
 *
 * The regression this guards against (#258) was a timing one, which is why
 * it needs a delayed action fetch to show up at all: a row's actions are
 * loaded *after* the menu opens, so the panel is first positioned while it
 * still reads "Loading actions" and only then grows to its real height. The
 * old menu was portaled onto document.body without a live reference to its
 * trigger, so it kept the placement computed for the small panel — landing
 * ~300px above the row and ~46px past the right edge of the window, which
 * gave the whole page a horizontal scrollbar for as long as it stayed open.
 *
 * Mock the actions as instantly available and the bug does not reproduce,
 * so DELAY below is load-bearing, not incidental.
 */

const VIEWPORT = { width: 1600, height: 900 };

/** Long enough that the menu is measurably positioned before the actions land. */
const ACTIONS_DELAY_MS = 700;

/** The row whose menu is opened — far enough down that a stale placement is
 * obvious, and not the last row, whose menu legitimately opens upwards. */
const ROW_INDEX = 4;

const CONFIGURATION_RESPONSE = {
  WALDUR_CORE: {
    AUTHENTICATION_METHODS: ['LOCAL_SIGNIN'],
    MARKETPLACE_LANDING_PAGE: 'Marketplace',
    COMPANY_TYPES: [],
    ONLY_STAFF_MANAGES_SERVICES: false,
    USER_MANDATORY_FIELDS: ['full_name', 'email'],
    DEFAULT_IDP: '',
    LANGUAGE_CHOICES: ['en'],
    SITE_NAME: 'Waldur',
  },
  WALDUR_AUTH_SOCIAL: {},
  WALDUR_SUPPORT: { ENABLED: false },
  WALDUR_MARKETPLACE: {},
  LANGUAGES: [['en', 'English']],
  LANGUAGE_CODE: 'en',
  FEATURES: {},
};

const RESOURCES = Array.from({ length: 12 }, (_, i) => ({
  url: `/api/marketplace-resources/r${i}/`,
  uuid: `uuid-${i}`,
  name: `Resource ${i + 1}`,
  // A non-null scope is what routes the row to the actions *fetch* — the
  // async path this test exists for.
  scope: `/api/openstacktenant-instances/i${i}/`,
  offering_type: 'Marketplace.Basic',
  offering_name: `Offering ${i + 1}`,
  offering_uuid: `off-${i}`,
  offering_state: 'Active',
  category_title: 'Compute',
  customer_name: 'Big Org',
  customer_uuid: 'cust-1',
  project_name: 'Demo project',
  project_uuid: 'proj-1',
  state: 'OK',
  backend_id: 'b-0',
  created: '2026-01-01T00:00:00Z',
  resource_type: 'Test.Resource',
  plan_name: 'Basic',
}));

async function mockApi(page: Page) {
  // Catch-all first: Playwright runs the most recently registered matching
  // handler, so the specific routes below must come after it to win.
  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'x-result-count': '0' },
      contentType: 'application/json',
      body: '[]',
    }),
  );

  await page.route('**/api/configuration/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(CONFIGURATION_RESPONSE),
    }),
  );

  await page.route('**/api/users/me/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: '/api/users/me/',
        uuid: 'me',
        username: 'alice',
        full_name: 'Alice Staff',
        email: 'alice@example.com',
        is_staff: true,
        is_support: true,
        token_expires_at: '2099-01-01T00:00:00Z',
        permissions: [],
      }),
    }),
  );

  await page.route('**/api/marketplace-resources/**', (route) =>
    route.fulfill({
      status: 200,
      headers: { 'x-result-count': String(RESOURCES.length) },
      contentType: 'application/json',
      body: JSON.stringify(RESOURCES),
    }),
  );

  await page.route('**/api/marketplace-resources/uuid-*/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(RESOURCES[0]),
    }),
  );

  // The slow one: the menu is open and positioned before this resolves.
  await page.route('**/api/openstacktenant-instances/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, ACTIONS_DELAY_MS));
    const index =
      route
        .request()
        .url()
        .match(/i(\d+)\//)?.[1] ?? '0';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: route.request().url(),
        uuid: `i${index}`,
        name: `Resource ${Number(index) + 1}`,
        resource_type: 'OpenStackTenant.Instance',
        marketplace_resource_uuid: `uuid-${index}`,
        state: 'OK',
      }),
    });
  });
}

test.describe('Table row actions menu placement', () => {
  test.use({ viewport: VIEWPORT });

  test('stays anchored to its button and inside the window while it fills', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('waldur/cookies/consent', 'true');
      localStorage.setItem('waldur/auth/token', 'test-token');
      localStorage.setItem(
        'waldur/auth/token_expires_at',
        '2099-01-01T00:00:00Z',
      );
    });
    await mockApi(page);

    await page.goto('/all-resources/');

    const rows = page.locator('table tbody tr');
    // The row itself, not just the first one: loading skeletons also render
    // as rows, so indexing before this row exists can measure a placeholder.
    await expect(rows.nth(ROW_INDEX)).toBeVisible();

    const toggle = rows
      .nth(ROW_INDEX)
      .locator('button[aria-haspopup="menu"]')
      .last();
    await expect(toggle).toBeVisible();
    await toggle.scrollIntoViewIfNeeded();
    const toggleBox = await toggle.boundingBox();
    expect(toggleBox).not.toBeNull();

    await toggle.click();

    const menu = page.getByRole('menu').first();
    await expect(menu).toBeVisible();

    // Let the actions land and the panel grow to its real height — the
    // moment the stale placement used to become visible.
    await expect(
      menu.getByText('Loading actions', { exact: false }),
    ).toHaveCount(0, { timeout: ACTIONS_DELAY_MS + 5000 });
    const menuBox = await menu.boundingBox();
    expect(menuBox).not.toBeNull();

    // Inside the window horizontally, and no page-wide horizontal scrollbar.
    expect(menuBox!.x).toBeGreaterThanOrEqual(0);
    expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(VIEWPORT.width);
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);

    // Beside its own button. A tall list is shifted up to fit the window, so
    // the tops need not coincide — but the panel must still cover the button
    // it belongs to. Measured: it used to span 17-465 against a button
    // centred at 489, and now spans 444-900.
    const toggleCentre = toggleBox!.y + toggleBox!.height / 2;
    expect(menuBox!.y).toBeLessThanOrEqual(toggleCentre);
    expect(menuBox!.y + menuBox!.height).toBeGreaterThanOrEqual(toggleCentre);
  });
});
