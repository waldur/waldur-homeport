import { test, expect, Page } from '@playwright/test';

/**
 * #258: a row's actions menu must stay anchored to the button that opened it.
 * The bug was a timing one — actions load *after* the menu opens, so the panel
 * was placed while it still read "Loading actions" and never re-measured once
 * it grew. Hence the delayed route below: with instant actions nothing
 * reproduces.
 */

const VIEWPORT = { width: 1600, height: 900 };
const ACTIONS_DELAY_MS = 700;
/** Far enough down that a stale placement shows; not the last row. */
const ROW_INDEX = 4;

const RESOURCES = Array.from({ length: 6 }, (_, i) => ({
  url: `/api/marketplace-resources/r${i}/`,
  uuid: `uuid-${i}`,
  name: `Resource ${i + 1}`,
  // A non-null scope is what routes the row to the actions *fetch*.
  scope: `/api/openstacktenant-instances/i${i}/`,
  offering_type: 'Marketplace.Basic',
  offering_state: 'Active',
  state: 'OK',
  resource_type: 'Test.Resource',
}));

const json = (body: unknown, count?: number) => ({
  status: 200,
  contentType: 'application/json',
  headers:
    count === undefined ? undefined : { 'x-result-count': String(count) },
  body: JSON.stringify(body),
});

async function mockApi(page: Page) {
  // Catch-all first: Playwright runs the most recently registered handler, so
  // the specific routes below must be registered after it to win.
  await page.route('**/api/**', (route) => route.fulfill(json([], 0)));
  await page.route('**/api/configuration/**', (route) =>
    route.fulfill(
      json({
        WALDUR_CORE: { SITE_NAME: 'Waldur', LANGUAGE_CHOICES: ['en'] },
        LANGUAGES: [['en', 'English']],
        LANGUAGE_CODE: 'en',
        FEATURES: {},
      }),
    ),
  );
  await page.route('**/api/users/me/**', (route) =>
    route.fulfill(
      json({
        url: '/api/users/me/',
        uuid: 'me',
        username: 'alice',
        full_name: 'Alice Staff',
        is_staff: true,
        is_support: true,
        permissions: [],
      }),
    ),
  );
  await page.route('**/api/marketplace-resources/**', (route) =>
    route.fulfill(json(RESOURCES, RESOURCES.length)),
  );
  await page.route('**/api/marketplace-resources/uuid-*/**', (route) =>
    route.fulfill(json(RESOURCES[0])),
  );
  // The slow one: the menu is open and placed before this resolves.
  await page.route('**/api/openstacktenant-instances/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, ACTIONS_DELAY_MS));
    return route.fulfill(
      json({
        url: route.request().url(),
        uuid: 'i0',
        name: 'Resource 1',
        resource_type: 'OpenStackTenant.Instance',
        marketplace_resource_uuid: 'uuid-0',
        state: 'OK',
      }),
    );
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

    // The target row, not just the first: skeletons also render as rows.
    const row = page.locator('table tbody tr').nth(ROW_INDEX);
    await expect(row).toBeVisible();
    const toggle = row.locator('button[aria-haspopup="menu"]').last();
    await expect(toggle).toBeVisible();
    const toggleBox = (await toggle.boundingBox())!;

    await toggle.click();
    const menu = page.getByRole('menu').first();
    await expect(menu).toBeVisible();
    // Let the actions land and the panel grow — when the stale placement showed.
    await expect(
      menu.getByText('Loading actions', { exact: false }),
    ).toHaveCount(0, { timeout: ACTIONS_DELAY_MS + 5000 });
    // Poll: the panel is repositioned a frame after it grows, so a single
    // measurement can catch it mid-move.
    const centre = toggleBox.y + toggleBox.height / 2;
    await expect
      .poll(async () => {
        const m = (await menu.boundingBox())!;
        return {
          insideWindow: m.x >= 0 && m.x + m.width <= VIEWPORT.width,
          // A tall list is shifted up to fit the window, so the tops need not
          // coincide — but the panel must cover the button it belongs to. It
          // used to span 17-465 against a button centred at 489.
          coversItsButton: m.y <= centre && m.y + m.height >= centre,
          noHorizontalScrollbar: await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        };
      })
      .toEqual({
        insideWindow: true,
        coversItsButton: true,
        noHorizontalScrollbar: true,
      });
  });
});
