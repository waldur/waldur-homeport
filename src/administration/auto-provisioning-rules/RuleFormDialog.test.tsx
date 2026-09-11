import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  autoprovisioningRulesCreate,
  autoprovisioningRulesUpdate,
} from 'waldur-js-client';

import { ENV } from '@/core/config';
import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { RuleFormDialog } from './RuleFormDialog';

// The dialog only offers deployment-wide project roles, and the shared config
// mock (test/mocks/config.js) seeds none. ENV is a mutable singleton, so the
// role is re-seeded per test to avoid cross-test leakage.
const systemProjectRole = {
  name: 'admin',
  description: 'Administrator',
  content_type: 'project',
  is_active: true,
  is_system_role: true,
};

const renderDialog = (resolve: any = { refetch: vi.fn() }) =>
  renderWithProviders(<RuleFormDialog resolve={resolve} />);

/** Advance the wizard by one step. */
const next = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /^Next$/i }));
};

/** Step 1 asks only for the rule name; the roles live on step 2. */
const fillMatchingStep = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Rule name/i), 'Default users');
};

const fillGrantsStep = async (user: ReturnType<typeof userEvent.setup>) => {
  // Resolving the organization from the claim avoids driving the async
  // organization autocomplete, and is what the original tests did.
  await user.click(screen.getByLabelText(/Use user organization/i));
  const roleSelect = screen.getByLabelText(/Project role/i);
  await user.click(roleSelect);
  await user.click(await screen.findByText('Administrator'));
};

describe('RuleFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ENV.roles = ENV.roles.filter((r: any) => !r.is_system_role);
    ENV.roles.push(systemProjectRole as any);
  });

  it('submits the parsed lists after the user types into the list fields', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();
    vi.mocked(autoprovisioningRulesCreate).mockResolvedValue({
      data: { uuid: 'new-uuid' },
    } as any);

    renderDialog({ refetch });

    await screen.findByText('Add auto-provisioning rule');
    await fillMatchingStep(user);

    // The list controls hand the form an array, not the string the submit
    // handler used to assume — typing into either one made Confirm inert.
    await user.type(screen.getByLabelText(/Affiliations/i), 'student, faculty');
    await user.type(
      screen.getByLabelText(/Email patterns/i),
      '.*@example.com .*@example.org',
    );

    await next(user);
    await fillGrantsStep(user);
    await next(user);

    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(autoprovisioningRulesCreate).toHaveBeenCalledWith({
        body: expect.objectContaining({
          name: 'Default users',
          project_role_name: 'admin',
          user_affiliations: ['student', 'faculty'],
          user_email_patterns: ['.*@example.com', '.*@example.org'],
        }),
      });
    });
    await waitFor(() => expect(refetch).toHaveBeenCalled());
  });

  it('asks for confirmation only when no filter is configured', async () => {
    const user = userEvent.setup();
    vi.mocked(autoprovisioningRulesCreate).mockResolvedValue({
      data: { uuid: 'new-uuid' },
    } as any);

    renderDialog();

    await screen.findByText('Add auto-provisioning rule');
    await fillMatchingStep(user);
    await next(user);
    await fillGrantsStep(user);
    await next(user);

    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => expect(useModal().confirm).toHaveBeenCalled());
    await waitFor(() => expect(autoprovisioningRulesCreate).toHaveBeenCalled());
  });

  it('submits the lists loaded into an edited rule untouched', async () => {
    const user = userEvent.setup();
    vi.mocked(autoprovisioningRulesUpdate).mockResolvedValue({} as any);

    renderDialog({
      refetch: vi.fn(),
      rule: {
        uuid: 'rule-uuid',
        name: 'Existing rule',
        customer: 'https://example.com/api/customers/1/',
        customer_name: 'Org',
        project_role_display_name: 'admin',
        use_user_organization_as_customer_name: false,
        user_affiliations: ['student'],
        user_email_patterns: ['.*@example.com'],
      },
    });

    await screen.findByText('Edit auto-provisioning rule');

    // Seeded values carry across the steps untouched; walk to the last one.
    await next(user);
    await next(user);
    await user.click(screen.getByRole('button', { name: /^Edit$/i }));

    await waitFor(() => {
      expect(autoprovisioningRulesUpdate).toHaveBeenCalledWith({
        path: { uuid: 'rule-uuid' },
        body: expect.objectContaining({
          user_affiliations: ['student'],
          user_email_patterns: ['.*@example.com'],
        }),
      });
    });
  });
});
