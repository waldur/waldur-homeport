import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { MultiStartAction } from './MultiStartAction';

const stoppedVm = {
  uuid: 'r1',
  resource_uuid: 'i1',
  name: 'vm',
  resource_type: 'OpenStack.Instance',
  project_uuid: 'p1',
  customer_uuid: 'c1',
  backend_metadata: { state: 'OK', runtime_state: 'SHUTOFF' },
};

const startItem = () => screen.getByRole('menuitem', { name: /Start/ });

describe('MultiStartAction', () => {
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      {
        name: 'CUSTOMER.OWNER',
        permissions: ['OPENSTACK_INSTANCE.MANAGE_POWER'],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  it('is enabled for an organization owner holding the power permission', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [
        {
          scope_type: 'customer',
          scope_uuid: 'c1',
          role_name: 'CUSTOMER.OWNER',
        },
      ],
    } as any);
    renderWithProviders(
      inActionsMenu(<MultiStartAction rows={[stoppedVm]} refetch={vi.fn()} />),
    );

    expect(startItem()).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('is disabled for a user without the power permission', () => {
    vi.mocked(useUser).mockReturnValue({
      is_staff: false,
      permissions: [],
    } as any);
    renderWithProviders(
      inActionsMenu(<MultiStartAction rows={[stoppedVm]} refetch={vi.fn()} />),
    );

    expect(startItem()).toHaveAttribute('aria-disabled', 'true');
  });
});
