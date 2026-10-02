import { renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { useOrderEditable } from '../details/hooks';

import { ApproveByConsumerButton } from './ApproveByConsumerButton';
import { checkOrderCanBeApproved } from './selectors';

// An order the provider organization's own project placed for one of its
// offerings: its consumer organization is the provider organization.
const order: any = {
  uuid: 'order-uuid',
  state: 'pending-consumer',
  type: 'Create',
  customer_uuid: 'customer-uuid',
  project_uuid: 'project-uuid',
  provider_uuid: 'customer-uuid',
};

const role = (role_name: string, scope_type: string, scope_uuid: string) => ({
  role_name,
  scope_type,
  scope_uuid,
  customer_uuid: 'customer-uuid',
});

const users = {
  providerManager: {
    is_staff: false,
    permissions: [
      role('CUSTOMER.MANAGER', 'service_provider', 'provider-uuid'),
    ],
  },
  projectAdmin: {
    is_staff: false,
    permissions: [role('PROJECT.ADMIN', 'project', 'project-uuid')],
  },
  owner: {
    is_staff: false,
    permissions: [role('CUSTOMER.OWNER', 'customer', 'customer-uuid')],
  },
};

const actAs = (name: keyof typeof users) => {
  const user = users[name] as any;
  vi.mocked(useUser).mockReturnValue(user);
  return user;
};

describe('consumer order actions', () => {
  beforeEach(() => {
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: 'CUSTOMER.MANAGER',
        permissions: [
          PermissionEnum.LIST_ORDERS,
          PermissionEnum.APPROVE_ORDER,
          PermissionEnum.REJECT_ORDER,
        ],
      },
      { name: 'CUSTOMER.OWNER', permissions: [PermissionEnum.APPROVE_ORDER] },
      { name: 'PROJECT.ADMIN', permissions: [PermissionEnum.APPROVE_ORDER] },
    ] as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('for a service provider manager', () => {
    it('hides Approve as consumer', () => {
      actAs('providerManager');
      renderWithProviders(
        inActionsMenu(<ApproveByConsumerButton order={order} />),
      );
      expect(screen.queryByText('Approve')).not.toBeInTheDocument();
    });

    it('does not make the order editable', () => {
      actAs('providerManager');
      const { result } = renderHook(() => useOrderEditable(order));
      expect(result.current).toBe(false);
    });

    it('does not treat their own orders as approved', () => {
      const user = actAs('providerManager');
      expect(
        checkOrderCanBeApproved(
          user,
          { uuid: 'customer-uuid' },
          { uuid: 'project-uuid' },
        ),
      ).toBe(false);
    });
  });

  describe.each(['projectAdmin', 'owner'] as const)('for %s', (name) => {
    it('shows Approve as consumer', () => {
      actAs(name);
      renderWithProviders(
        inActionsMenu(<ApproveByConsumerButton order={order} />),
      );
      expect(screen.getByText('Approve')).toBeInTheDocument();
    });

    it('makes the order editable', () => {
      actAs(name);
      const { result } = renderHook(() => useOrderEditable(order));
      expect(result.current).toBe(true);
    });

    it('treats their own orders as approved', () => {
      const user = actAs(name);
      expect(
        checkOrderCanBeApproved(
          user,
          { uuid: 'customer-uuid' },
          { uuid: 'project-uuid' },
        ),
      ).toBe(true);
    });
  });
});
