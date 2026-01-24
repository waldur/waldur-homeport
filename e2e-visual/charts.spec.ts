import { test, expect, Page } from '@playwright/test';

/**
 * Visual regression tests for ECharts components.
 * These tests authenticate and navigate to pages containing charts
 * to capture screenshots for visual regression testing.
 *
 * Run with: yarn test:visual
 * Update baselines: yarn test:visual:update
 */

// Test credentials
const TEST_USER = 'staff';
const TEST_PASSWORD = 'demo';

// Helper to login
async function login(page: Page) {
  // Set cookie consent in localStorage before navigating (like Cypress does)
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('waldur/cookies/consent', 'true');
  });
  await page.reload();

  // Dismiss any modal that might be blocking (Terms of Service, cookie consent, etc.)
  const dismissModal = async () => {
    // Try cookie alert first
    const cookieAccept = page.locator('.cookiealert button:has-text("Accept")');
    if ((await cookieAccept.count()) > 0) {
      await cookieAccept.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    // Try any modal close button
    const modalCloseButton = page
      .locator(
        '.modal.show button.btn-close, .modal.show button:has-text("Accept"), .modal.show button:has-text("Close"), .modal.show button:has-text("OK")',
      )
      .first();
    if ((await modalCloseButton.count()) > 0) {
      await modalCloseButton.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  };

  // Try to dismiss any modal
  await page.waitForTimeout(1000);
  await dismissModal();

  // Wait for login page to load
  await page.waitForSelector('button:has-text("Sign in with local account")', {
    timeout: 10000,
  });

  // Dismiss any modal again if it reappeared
  await dismissModal();

  // Click "Sign in with local account" to reveal the form
  await page.click('button:has-text("Sign in with local account")', {
    force: true,
  });

  // Wait for the username/password form to appear
  await page.waitForSelector('input[placeholder="Enter your username"]', {
    timeout: 5000,
  });

  // Fill credentials
  await page.fill('input[placeholder="Enter your username"]', TEST_USER);
  await page.fill('input[placeholder="Enter your password"]', TEST_PASSWORD);

  // Submit
  await page.click('button:has-text("Login")', { force: true });

  // Wait for navigation away from login
  await page.waitForURL(/^(?!.*login).*$/, { timeout: 30000 });

  // Accept cookies if dialog appears
  const cookieButton = page.locator('button:has-text("Accept")');
  if ((await cookieButton.count()) > 0) {
    await cookieButton.click().catch(() => {});
  }

  // Wait for app to load
  await page.waitForSelector('#kt_content_container', { timeout: 30000 });
}

// Helper to wait for charts to render
async function waitForCharts(page: Page, timeout = 10000) {
  // Wait for any canvas elements (ECharts renders to canvas)
  await page.waitForSelector('canvas', { timeout }).catch(() => {
    // No canvas found - page may not have charts
  });

  // Give charts time to animate and render
  await page.waitForTimeout(2000);
}

// Helper to wait for page load and spinners
async function waitForPageLoad(page: Page) {
  // Wait for content container
  await page
    .waitForSelector('#kt_content_container', { timeout: 15000 })
    .catch(() => {});

  // Wait for spinners to disappear
  await page
    .waitForSelector('.animation-spin', { state: 'hidden', timeout: 15000 })
    .catch(() => {});

  await page.waitForTimeout(1000);
}

test.describe('EChart Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Organization Dashboard Charts', () => {
    test('cost chart renders correctly', async ({ page }) => {
      // Navigate to organizations list first to find an organization
      await page.goto('/profile/');
      await waitForPageLoad(page);

      // Click on workspace selector to find an organization
      const workspaceSelector = page.locator(
        '[data-cy=select-workspace-toggle]',
      );
      if ((await workspaceSelector.count()) > 0) {
        await workspaceSelector.click();
        await page.waitForTimeout(500);

        // Select first organization if available
        const orgOption = page
          .locator('.modal-content .list-group-item')
          .first();
        if ((await orgOption.count()) > 0) {
          await orgOption.click();
          await waitForPageLoad(page);

          // Navigate to dashboard
          const dashboardLink = page.locator('a:has-text("Dashboard")').first();
          if ((await dashboardLink.count()) > 0) {
            await dashboardLink.click();
            await waitForPageLoad(page);
            await waitForCharts(page);

            // Screenshot the cost widget
            const costWidget = page
              .locator('[class*="cost"], [class*="Cost"]')
              .first();
            if ((await costWidget.count()) > 0) {
              await expect(costWidget).toHaveScreenshot('org-cost-chart.png');
            }

            // Full page screenshot
            await expect(page).toHaveScreenshot('org-dashboard-full.png', {
              fullPage: true,
            });
          }
        }
      }
    });

    test('credit chart renders correctly', async ({ page }) => {
      await page.goto('/profile/');
      await waitForPageLoad(page);

      const workspaceSelector = page.locator(
        '[data-cy=select-workspace-toggle]',
      );
      if ((await workspaceSelector.count()) > 0) {
        await workspaceSelector.click();
        await page.waitForTimeout(500);

        const orgOption = page
          .locator('.modal-content .list-group-item')
          .first();
        if ((await orgOption.count()) > 0) {
          await orgOption.click();
          await waitForPageLoad(page);

          // Look for credit widget
          const creditWidget = page
            .locator('[class*="credit"], [class*="Credit"]')
            .first();
          if ((await creditWidget.count()) > 0) {
            await waitForCharts(page);
            await expect(creditWidget).toHaveScreenshot('org-credit-chart.png');
          }
        }
      }
    });
  });

  test.describe('Project Dashboard Charts', () => {
    test('project cost chart renders correctly', async ({ page }) => {
      await page.goto('/profile/');
      await waitForPageLoad(page);

      // Open workspace selector
      const workspaceSelector = page.locator(
        '[data-cy=select-workspace-toggle]',
      );
      if ((await workspaceSelector.count()) > 0) {
        await workspaceSelector.click();
        await page.waitForTimeout(500);

        // Look for a project in the selector
        const projectTab = page.locator('.modal-content').getByText('Projects');
        if ((await projectTab.count()) > 0) {
          await projectTab.click();
          await page.waitForTimeout(500);

          const projectOption = page
            .locator('.modal-content .list-group-item')
            .first();
          if ((await projectOption.count()) > 0) {
            await projectOption.click();
            await waitForPageLoad(page);
            await waitForCharts(page);

            // Screenshot the project dashboard
            await expect(page).toHaveScreenshot('project-dashboard.png', {
              fullPage: true,
            });
          }
        }
      }
    });
  });

  test.describe('Reporting Charts', () => {
    test('growth chart renders correctly', async ({ page }) => {
      // Navigate directly to reporting growth page (staff has access)
      await page.goto('/reporting/growth/');
      await waitForPageLoad(page);
      await waitForCharts(page, 15000);

      // Screenshot the growth chart
      const chartContainer = page.locator('.card-body canvas').first();
      if ((await chartContainer.count()) > 0) {
        await expect(page).toHaveScreenshot('reporting-growth-chart.png', {
          fullPage: true,
        });
      }
    });

    test('resource usage chart renders correctly', async ({ page }) => {
      await page.goto('/reporting/resource-usage/');
      await waitForPageLoad(page);

      // The usage charts are in expandable rows
      // Click on first expandable row if available
      const expandButton = page.locator('[data-testid="expand-row"]').first();
      if ((await expandButton.count()) > 0) {
        await expandButton.click();
        await waitForCharts(page, 15000);

        await expect(page).toHaveScreenshot('resource-usage-expanded.png', {
          fullPage: true,
        });
      } else {
        // Take screenshot of the page even without expanded rows
        await expect(page).toHaveScreenshot('resource-usage-list.png', {
          fullPage: true,
        });
      }
    });

    test('user usage chart renders correctly', async ({ page }) => {
      await page.goto('/reporting/user-usage/');
      await waitForPageLoad(page);

      // Expand first row if available
      const expandButton = page.locator('[data-testid="expand-row"]').first();
      if ((await expandButton.count()) > 0) {
        await expandButton.click();
        await waitForCharts(page, 15000);

        await expect(page).toHaveScreenshot('user-usage-expanded.png', {
          fullPage: true,
        });
      } else {
        await expect(page).toHaveScreenshot('user-usage-list.png', {
          fullPage: true,
        });
      }
    });
  });

  test.describe('Provider Dashboard Charts', () => {
    test('provider revenue chart renders correctly', async ({ page }) => {
      // Navigate to providers page first
      await page.goto('/providers/');
      await waitForPageLoad(page);

      // Click first provider if available
      const providerLink = page.locator('table tbody tr a').first();
      if ((await providerLink.count()) > 0) {
        await providerLink.click();
        await waitForPageLoad(page);
        await waitForCharts(page);

        await expect(page).toHaveScreenshot('provider-dashboard.png', {
          fullPage: true,
        });
      }
    });
  });

  test.describe('Quota Charts', () => {
    test('quota pie charts render correctly', async ({ page }) => {
      await page.goto('/reporting/quotas/');
      await waitForPageLoad(page);

      // Quota pie charts might be in the table
      const canvasElements = page.locator('canvas');
      if ((await canvasElements.count()) > 0) {
        await waitForCharts(page);

        await expect(page).toHaveScreenshot('quotas-page.png', {
          fullPage: true,
        });
      }
    });
  });

  test.describe('Theme Switching', () => {
    test('charts respond to dark/light theme toggle', async ({ page }) => {
      // Go to reporting growth which has visible charts
      await page.goto('/reporting/growth/');
      await waitForPageLoad(page);
      await waitForCharts(page, 15000);

      // Take light theme screenshot
      await expect(page).toHaveScreenshot('chart-light-theme.png');

      // Find and click theme toggle
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], [data-kt-element="mode"]',
      );
      if ((await themeToggle.count()) > 0) {
        await themeToggle.click();
        await page.waitForTimeout(1000);
        await waitForCharts(page);

        // Take dark theme screenshot
        await expect(page).toHaveScreenshot('chart-dark-theme.png');
      }
    });
  });

  test.describe('Chart Export', () => {
    test('charts with export functionality', async ({ page }) => {
      // Resource usage page has export functionality
      await page.goto('/reporting/resource-usage/');
      await waitForPageLoad(page);

      // Look for export buttons
      const exportButton = page.locator('button:has-text("Export")').first();
      if ((await exportButton.count()) > 0) {
        await expect(exportButton).toBeVisible();
        // We don't actually click export in visual tests,
        // just verify the button exists
      }
    });
  });

  test.describe('EChart Error Handling', () => {
    test('no console errors from ECharts', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text().toLowerCase();
          // Check for ECharts-related errors
          if (text.includes('echart') || text.includes('zrender')) {
            errors.push(text);
          }
        }
      });

      // Navigate to a page with charts
      await page.goto('/reporting/growth/');
      await waitForPageLoad(page);
      await page.waitForTimeout(5000);

      expect(errors).toHaveLength(0);
    });
  });
});
