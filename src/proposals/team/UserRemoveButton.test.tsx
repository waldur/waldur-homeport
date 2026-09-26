import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { UserRemoveButton } from './UserRemoveButton';

vi.mock('@/modal/useManagedMutation', () => ({
  useManagedMutation: () => ({ isPending: false, mutate: vi.fn() }),
}));

const call = {
  url: '/api/proposal-protected-calls/call-uuid/',
  uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
};

const member = {
  user_uuid: 'user-1',
  role_name: RoleEnum.CALL_PANEL_MEMBER,
} as any;

const renderAs = (user) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    { name: 'CALL.MANAGER', permissions: [] },
    {
      name: 'CUSTOMER.OWNER',
      permissions: [PermissionEnum.DELETE_CALL_PERMISSION],
    },
  ] as any);
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user);
  renderWithProviders(
    inActionsMenu(
      <UserRemoveButton permission={member} scope={call} refetch={vi.fn()} />,
    ),
  );
};

describe('UserRemoveButton', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is offered to an owner of the call organization', () => {
    renderAs({
      permissions: [
        {
          role_name: 'CUSTOMER.OWNER',
          scope_type: 'customer',
          scope_uuid: 'customer-uuid',
        },
      ],
    });
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('is offered to staff', () => {
    renderAs({ is_staff: true, permissions: [] });
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  // Support reads the call team but holds no role that may change it.
  it('is hidden from support', () => {
    renderAs({ is_support: true, permissions: [] });
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('is hidden from a role without the delete permission', () => {
    renderAs({
      permissions: [
        {
          role_name: 'CALL.MANAGER',
          scope_type: 'call',
          scope_uuid: 'call-uuid',
        },
      ],
    });
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });
});
