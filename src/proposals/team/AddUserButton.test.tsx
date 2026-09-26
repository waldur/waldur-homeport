import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum } from '@/permissions/enums';
import { inActionsMenu, renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { AddUserButton } from './AddUserButton';

const call = {
  url: '/api/proposal-protected-calls/call-uuid/',
  uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
};

const proposal = {
  url: '/api/proposal-proposals/proposal-uuid/',
  uuid: 'proposal-uuid',
};

const isEnabled = (user, scope = call) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    {
      name: 'CUSTOMER.OWNER',
      permissions: [PermissionEnum.CREATE_CALL_PERMISSION],
    },
    {
      name: 'PROPOSAL.MANAGER',
      permissions: [PermissionEnum.MANAGE_PROPOSAL],
    },
    { name: 'CALL.PANEL_MEMBER', permissions: [] },
  ] as any);
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user);
  renderWithProviders(
    inActionsMenu(<AddUserButton scope={scope} refetch={vi.fn()} />),
  );
  return !screen
    .getByRole('menuitem', { name: /Member/ })
    .hasAttribute('data-disabled');
};

describe('AddUserButton', () => {
  afterEach(() => vi.restoreAllMocks());

  // The backend checks CALL.CREATE_PERMISSION on the call's organization, where
  // an owner holds it; checking the call alone left owners locked out.
  it('is enabled for an owner of the call organization', () => {
    expect(
      isEnabled({
        permissions: [
          {
            role_name: 'CUSTOMER.OWNER',
            scope_type: 'customer',
            scope_uuid: 'customer-uuid',
          },
        ],
      }),
    ).toBe(true);
  });

  it('is enabled for a proposal manager on their proposal', () => {
    expect(
      isEnabled(
        {
          permissions: [
            {
              role_name: 'PROPOSAL.MANAGER',
              scope_type: 'proposal',
              scope_uuid: 'proposal-uuid',
            },
          ],
        },
        proposal as any,
      ),
    ).toBe(true);
  });

  it('is disabled for support', () => {
    expect(isEnabled({ is_support: true, permissions: [] })).toBe(false);
  });

  it('is disabled for a panel member', () => {
    expect(
      isEnabled({
        permissions: [
          {
            role_name: 'CALL.PANEL_MEMBER',
            scope_type: 'call',
            scope_uuid: 'call-uuid',
          },
        ],
      }),
    ).toBe(false);
  });
});
