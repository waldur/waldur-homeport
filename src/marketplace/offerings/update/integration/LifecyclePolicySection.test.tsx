import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { LifecyclePolicySection } from './LifecyclePolicySection';

const PERIODIC_POLICY = 'Enable SLURM periodic usage policy';
const MAINTENANCE_SYNC = 'Sync maintenance with SLURM reservations';

const openResourceLifecycle = async (
  type: string,
  plugin_options: Record<string, unknown> = {},
) => {
  renderWithProviders(
    <LifecyclePolicySection
      offering={{ uuid: 'offering-uuid', type, plugin_options } as any}
      refetch={vi.fn()}
    />,
  );
  await userEvent.click(
    screen.getByRole('tab', { name: /Resource lifecycle/ }),
  );
  // A field every offering type has: the tab is open.
  expect(await screen.findByText('Supports downscaling')).toBeInTheDocument();
};

describe('LifecyclePolicySection', () => {
  // Both options reach SLURM through the site agent, the legacy type name
  // included; no other offering type reads them.
  it.each(['Marketplace.SiteAgent', 'Marketplace.Slurm'])(
    'offers the SLURM options on a %s offering',
    async (type) => {
      await openResourceLifecycle(type);
      expect(screen.getByText(PERIODIC_POLICY)).toBeInTheDocument();
      expect(screen.getByText(MAINTENANCE_SYNC)).toBeInTheDocument();
    },
  );

  it.each(['Marketplace.Basic', 'OpenStack.Tenant', 'Marketplace.Script'])(
    'does not offer them on a %s offering, even when stored on',
    async (type) => {
      await openResourceLifecycle(type, {
        slurm_periodic_policy_enabled: true,
        slurm_maintenance_sync_enabled: true,
      });
      expect(screen.queryByText(PERIODIC_POLICY)).not.toBeInTheDocument();
      expect(screen.queryByText(MAINTENANCE_SYNC)).not.toBeInTheDocument();
    },
  );
});
