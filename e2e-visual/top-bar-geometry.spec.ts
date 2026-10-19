import { expect, Page, test } from '@playwright/test';

/**
 * Pins the app header's geometry to what the Metronic header had, now that
 * its stylesheets (layout/_header.scss, custom/_nav.scss) are gone and there
 * is nothing left to diff against. Every number below was measured on the
 * legacy header in the signed-in app, at the 13px desktop root and the 12px
 * mobile one: the spacing is rem-based, so it differs between the two.
 *
 * Renders packages/ui/src/TopBar/TopBar.stories.tsx's AppHeaderLayout, which
 * mirrors AppHeader.tsx's composition.
 *
 * Run with: yarn playwright test top-bar-geometry --project visual --workers=1
 */

const STORY =
  'http://localhost:6006/iframe.html?id=navigation-topbar--app-header-layout&viewMode=story&globals=theme:';

const TOLERANCE = 0.3;

const box = async (page: Page, testId: string) => {
  const b = await page.getByTestId(testId).boundingBox();
  if (!b) throw new Error(`${testId} is not rendered`);
  return { ...b, right: b.x + b.width, bottom: b.y + b.height };
};

const near = (actual: number, expected: number, what: string) =>
  expect(
    Math.abs(actual - expected),
    `${what}: ${actual} vs ${expected}`,
  ).toBeLessThanOrEqual(TOLERANCE);

const LAYOUTS = {
  desktop: {
    viewport: { width: 1280, height: 800 },
    height: 65,
    padding: 32,
    // ms-[0.25rem] / ms-[0.75rem] at a 13px root.
    gap: 3.25,
    userGap: 9.75,
  },
  mobile: {
    viewport: { width: 375, height: 812 },
    height: 55,
    padding: 15,
    gap: 3,
    userGap: 9,
  },
} as const;

for (const [name, layout] of Object.entries(LAYOUTS)) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`TopBar geometry — ${name} ${theme}`, () => {
      test.use({ viewport: layout.viewport });

      test.beforeEach(async ({ page }) => {
        await page.goto(STORY + theme);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await page.getByTestId('top-bar').waitFor();
      });

      test('bar', async ({ page }) => {
        const bar = await box(page, 'top-bar');
        near(bar.height, layout.height, 'height');

        const style = await page.getByTestId('top-bar').evaluate((el) => {
          const cs = getComputedStyle(el);
          const token = (n: string) => {
            const probe = document.createElement('div');
            probe.style.color = `var(${n})`;
            document.body.appendChild(probe);
            const c = getComputedStyle(probe).color;
            probe.remove();
            return c;
          };
          return {
            paddingLeft: parseFloat(cs.paddingLeft),
            paddingRight: parseFloat(cs.paddingRight),
            borderBottom: `${cs.borderBottomStyle} ${cs.borderBottomColor}`,
            borderWidth: parseFloat(cs.borderBottomWidth),
            bg: cs.backgroundColor,
            bgToken: token('--bg-primary'),
            borderToken: token('--border-secondary'),
          };
        });
        near(style.paddingLeft, layout.padding, 'padding-left');
        near(style.paddingRight, layout.padding, 'padding-right');
        expect(style.borderWidth).toBeGreaterThan(0);
        expect(style.borderBottom).toBe(`solid ${style.borderToken}`);
        expect(style.bg).toBe(style.bgToken);
      });

      test('actions', async ({ page }) => {
        const bar = await box(page, 'top-bar');
        const border = await page
          .getByTestId('top-bar')
          .evaluate((el) => parseFloat(getComputedStyle(el).borderBottomWidth));
        const search = await box(page, 'search');
        const support = await box(page, 'support');
        const pending = await box(page, 'pending');
        const user = await box(page, 'user');

        for (const [id, b] of Object.entries({ search, support, pending })) {
          near(b.width, 40, `${id} width`);
          near(b.height, 40, `${id} height`);
          // Centred in the bar above its bottom rule.
          near(b.y - bar.y, (layout.height - border - 40) / 2, `${id} top`);
        }
        near(support.x - search.right, layout.gap, 'search → support');
        near(pending.x - support.right, layout.gap, 'support → pending');
        near(user.right, bar.right - layout.padding, 'user menu end');

        if (name === 'desktop') {
          near(user.x - pending.right, layout.userGap, 'pending → user');
          const crumbs = await box(page, 'crumbs');
          near(crumbs.x, bar.x + layout.padding, 'breadcrumbs start');
          await expect(page.getByTestId('nav-toggle')).toBeHidden();
          await expect(page.getByTestId('divider')).toBeHidden();
        } else {
          const divider = await box(page, 'divider');
          near(divider.x - pending.right, layout.gap, 'pending → divider');
          near(divider.height, 40, 'divider height');
          near(user.x - divider.right, layout.userGap, 'divider → user');
          // -ms-[0.5rem] pulls the toggle half a step into the padding.
          const toggle = await box(page, 'nav-toggle');
          near(toggle.x - bar.x, layout.padding - 6, 'nav toggle start');
          near(toggle.width, 40, 'nav toggle width');
        }
      });
    });
  }
}
