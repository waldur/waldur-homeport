import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BaseButton } from 'waldur-ui';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { OrderProviderActions } from './OrderProviderActions';

const order: any = {
  uuid: 'order-uuid',
  state: 'pending-provider',
  type: 'Create',
  customer_uuid: 'consumer-uuid',
  project_uuid: 'project-uuid',
  provider_uuid: 'provider-uuid',
  offering_uuid: 'offering-a',
};

const offeringManager = (offering_uuid: string) => ({
  is_staff: false,
  permissions: [
    {
      role_name: 'OFFERING.MANAGER',
      scope_type: 'offering',
      scope_uuid: offering_uuid,
      customer_uuid: 'provider-uuid',
    },
  ],
});

describe('OrderProviderActions', () => {
  let originalRoles;

  beforeEach(() => {
    originalRoles = ENV.roles;
    ENV.roles = [
      {
        name: 'OFFERING.MANAGER',
        permissions: [
          PermissionEnum.APPROVE_ORDER,
          PermissionEnum.REJECT_ORDER,
        ],
      },
    ] as any;
  });

  afterEach(() => {
    ENV.roles = originalRoles;
  });

  it('lets the offering manager review an order for their offering', () => {
    vi.mocked(useUser).mockReturnValue(offeringManager('offering-a') as any);
    renderWithProviders(
      <OrderProviderActions order={order} refetch={vi.fn()} as={BaseButton} />,
    );
    expect(screen.getByRole('button', { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Decline/ })).toBeInTheDocument();
  });

  it('offers nothing to the manager of another offering', () => {
    vi.mocked(useUser).mockReturnValue(offeringManager('offering-b') as any);
    renderWithProviders(
      <OrderProviderActions order={order} refetch={vi.fn()} as={BaseButton} />,
    );
    expect(screen.queryByRole('button', { name: /Approve/ })).toBeNull();
  });
});
