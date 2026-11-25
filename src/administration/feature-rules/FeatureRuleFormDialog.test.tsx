import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { featureRulesUpdate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { FeatureRuleFormDialog } from './FeatureRuleFormDialog';

const rule = {
  uuid: 'r1',
  feature_key: 'user.ssh_keys',
  description: 'Pilot',
  is_active: true,
  users_summary: [{ uuid: 'u1', username: 'alice', full_name: 'Alice' }],
  customers_summary: [],
  organization_groups_summary: [],
  roles: [],
} as any;

const renderDialog = (back?: () => void) =>
  renderWithProviders(
    <FeatureRuleFormDialog
      resolve={{
        featureKey: 'user.ssh_keys',
        featureLabel: 'SSH keys',
        rule,
        back,
      }}
    />,
  );

describe('FeatureRuleFormDialog', () => {
  it('goes back to the rules list on cancel', async () => {
    const back = vi.fn();
    renderDialog(back);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(back).toHaveBeenCalled();
  });

  it('goes back to the rules list after saving, without closing everything', async () => {
    const back = vi.fn();
    vi.mocked(featureRulesUpdate).mockResolvedValue({ data: rule } as any);
    renderDialog(back);
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(back).toHaveBeenCalled());
    expect(useModal().closeDialog).not.toHaveBeenCalled();
  });
});
