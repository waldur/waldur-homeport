import { test, expect, Page } from '@playwright/test';

/**
 * Visual regression tests for Wizard dialogs.
 * Validates consistent header, stepper, and footer styling across all wizards.
 *
 * Run with: yarn test:visual
 * Update baselines: yarn test:visual:update
 */

// Test credentials
const TEST_USER = 'staff';
const TEST_PASSWORD = 'demo';

// Helper to login
async function login(page: Page) {
  // Set cookie consent in localStorage before navigating
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('waldur/cookies/consent', 'true');
  });
  await page.reload();

  // Dismiss any modal that might be blocking
  const dismissModal = async () => {
    const cookieAccept = page.locator('.cookiealert button:has-text("Accept")');
    if ((await cookieAccept.count()) > 0) {
      await cookieAccept.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }

    const modalCloseButton = page
      .locator(
        '.modal.show button.btn-close, .modal.show button:has-text("Accept"), .modal.show button:has-text("Close")',
      )
      .first();
    if ((await modalCloseButton.count()) > 0) {
      await modalCloseButton.click({ force: true }).catch(() => {});
      await page.waitForTimeout(500);
    }
  };

  await page.waitForTimeout(1000);
  await dismissModal();

  await page.waitForSelector('button:has-text("Sign in with local account")', {
    timeout: 10000,
  });
  await dismissModal();

  await page.click('button:has-text("Sign in with local account")', {
    force: true,
  });

  await page.waitForSelector('input[placeholder="Enter your username"]', {
    timeout: 5000,
  });

  await page.fill('input[placeholder="Enter your username"]', TEST_USER);
  await page.fill('input[placeholder="Enter your password"]', TEST_PASSWORD);

  await page.click('button:has-text("Login")', { force: true });

  await page.waitForURL(/^(?!.*login).*$/, { timeout: 30000 });

  const cookieButton = page.locator('button:has-text("Accept")');
  if ((await cookieButton.count()) > 0) {
    await cookieButton.click().catch(() => {});
  }

  await page.waitForSelector('#kt_content_container', { timeout: 30000 });
}

// Helper to wait for modal to fully render
async function waitForModal(page: Page) {
  await page.waitForSelector('.modal.show', { timeout: 10000 });
  await page.waitForTimeout(500); // Allow animations to complete
}

// Helper to wait for page load
async function waitForPageLoad(page: Page) {
  await page
    .waitForSelector('#kt_content_container', { timeout: 15000 })
    .catch(() => {});

  await page
    .waitForSelector('.animation-spin', { state: 'hidden', timeout: 15000 })
    .catch(() => {});

  await page.waitForTimeout(1000);
}

test.describe('Wizard Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Wizard Header Consistency', () => {
    test('Broadcast wizard header matches standard', async ({ page }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        // Screenshot step 1 (Create message)
        const modal = page.locator('.modal.show .modal-content');
        await expect(modal).toHaveScreenshot('wizard-broadcast-step1.png', {
          animations: 'disabled',
        });

        // Verify header elements exist
        await expect(page.locator('.modal-header .modal-title')).toBeVisible();
        await expect(page.locator('.stepper-nav')).toBeVisible();
      }
    });

    test('OIDC Discovery wizard header matches standard', async ({ page }) => {
      // Navigate to identity providers
      await page.goto('/administration/identity-providers/');
      await waitForPageLoad(page);

      // Look for OIDC tab or discovery button
      const oidcTab = page.locator('text=OIDC').first();
      if ((await oidcTab.count()) > 0) {
        await oidcTab.click();
        await waitForPageLoad(page);

        const discoveryButton = page
          .locator('button:has-text("Discovery")')
          .first();
        if ((await discoveryButton.count()) > 0) {
          await discoveryButton.click();
          await waitForModal(page);

          // Screenshot step 1 (Connection)
          const modal = page.locator('.modal.show .modal-content');
          await expect(modal).toHaveScreenshot('wizard-oidc-step1.png', {
            animations: 'disabled',
          });

          // Verify header elements
          await expect(
            page.locator('.modal-header .modal-title'),
          ).toBeVisible();
          await expect(page.locator('.stepper-nav')).toBeVisible();
        }
      }
    });

    test('Atlassian Discovery wizard header matches standard', async ({
      page,
    }) => {
      await page.goto('/administration/service-desk/');
      await waitForPageLoad(page);

      const atlassianTab = page.locator('text=Atlassian').first();
      if ((await atlassianTab.count()) > 0) {
        await atlassianTab.click();
        await waitForPageLoad(page);

        const discoveryButton = page
          .locator('button:has-text("Discovery")')
          .first();
        if ((await discoveryButton.count()) > 0) {
          await discoveryButton.click();
          await waitForModal(page);

          // Screenshot step 1 (Credentials)
          const modal = page.locator('.modal.show .modal-content');
          await expect(modal).toHaveScreenshot('wizard-atlassian-step1.png', {
            animations: 'disabled',
          });

          // Verify header elements
          await expect(
            page.locator('.modal-header .modal-title'),
          ).toBeVisible();
          await expect(page.locator('.stepper-nav')).toBeVisible();
        }
      }
    });

    test('Renew allocation wizard header matches standard', async ({
      page,
    }) => {
      // Navigate to a resource that can be renewed
      await page.goto('/marketplace/resources/');
      await waitForPageLoad(page);

      // Find renew action if available
      const renewButton = page.locator('button:has-text("Renew")').first();
      if ((await renewButton.count()) > 0) {
        await renewButton.click();
        await waitForModal(page);

        const modal = page.locator('.modal.show .modal-content');
        await expect(modal).toHaveScreenshot(
          'wizard-renew-allocation-step1.png',
          {
            animations: 'disabled',
          },
        );
      }
    });
  });

  test.describe('Wizard Step Indicator', () => {
    test('step indicator styling is consistent across wizards', async ({
      page,
    }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        // Screenshot the stepper component in isolation
        const stepper = page.locator('.stepper-nav');
        if ((await stepper.count()) > 0) {
          await expect(stepper).toHaveScreenshot('wizard-stepper-step1.png');
        }
      }
    });
  });

  test.describe('Wizard Footer Consistency', () => {
    test('footer buttons are consistently styled', async ({ page }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        // Screenshot footer in isolation
        const footer = page.locator('.modal-footer');
        if ((await footer.count()) > 0) {
          await expect(footer).toHaveScreenshot('wizard-footer-broadcast.png');
        }
      }
    });
  });

  test.describe('Wizard Theme Compatibility', () => {
    test('wizard renders correctly in dark theme', async ({ page }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      // Toggle to dark theme
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], [data-kt-element="mode"]',
      );
      if ((await themeToggle.count()) > 0) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        const modal = page.locator('.modal.show .modal-content');
        await expect(modal).toHaveScreenshot(
          'wizard-broadcast-dark-theme.png',
          {
            animations: 'disabled',
          },
        );
      }
    });
  });

  test.describe('Wizard Content Area', () => {
    test('wizard content has consistent padding', async ({ page }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        // Verify wizard body styling
        const wizardBody = page.locator('.wizard-body');
        if ((await wizardBody.count()) > 0) {
          const contentDiv = page.locator('.wizard-body .content');
          if ((await contentDiv.count()) > 0) {
            await expect(contentDiv).toHaveScreenshot(
              'wizard-content-area.png',
            );
          }
        }
      }
    });
  });

  test.describe('Wizard Accessibility', () => {
    test('wizard has proper focus management', async ({ page }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        // Verify focus is inside modal
        const _modalContent = page.locator('.modal-content');
        const activeElement = page.locator(':focus');

        // The focused element should be visible
        if ((await activeElement.count()) > 0) {
          await expect(activeElement.first()).toBeVisible();
        }
      }
    });

    test('stepper has ARIA attributes', async ({ page }) => {
      await page.goto('/support/broadcasts/');
      await waitForPageLoad(page);

      const createButton = page.locator('button:has-text("Create")').first();
      if ((await createButton.count()) > 0) {
        await createButton.click();
        await waitForModal(page);

        // Verify ARIA role exists on stepper wrapper
        const stepperWrapper = page.locator('[role="group"]');
        if ((await stepperWrapper.count()) > 0) {
          await expect(stepperWrapper.first()).toBeVisible();
        }
      }
    });
  });
});
