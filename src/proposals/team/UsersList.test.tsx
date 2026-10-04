import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { UsersList } from './UsersList';

const { tableProps } = vi.hoisted(() => ({ tableProps: { value: null } }));

vi.mock('@/customer/team/TeamTableComponent', () => ({
  TeamTableComponent: (props) => {
    tableProps.value = props;
    return null;
  },
}));

const { canRemoveHook } = vi.hoisted(() => ({
  canRemoveHook: vi.fn<(scope: unknown, skip?: boolean) => boolean>(
    () => false,
  ),
}));

vi.mock('./UserRemoveButton', () => ({
  UserRemoveButton: () => null,
  useCanRemoveTeamMember: canRemoveHook,
}));

const scope = {
  uuid: 'proposal-1',
  url: '/api/proposal-proposals/proposal-1/',
};

describe('UsersList', () => {
  afterEach(() => {
    tableProps.value = null;
  });

  it('declares row actions before any row has loaded', () => {
    // The table enables its Actions column once, at mount, and only when row
    // actions are passed then: they must not wait for the rows.
    const { rerender } = renderWithProviders(
      <UsersList
        table={{ rows: [] }}
        scope={scope}
        scopeType="proposal"
        canRemoveRow={() => true}
      />,
    );
    expect(tableProps.value.rowActions).toBeInstanceOf(Function);
    rerender(
      <UsersList
        table={{
          rows: [{ user_uuid: 'user-1', role_name: 'PROPOSAL.MEMBER' }],
        }}
        scope={scope}
        scopeType="proposal"
        canRemoveRow={() => true}
      />,
    );
    expect(tableProps.value.rowActions).toBeInstanceOf(Function);
  });

  it('leaves the Actions column out of a read-only team', () => {
    renderWithProviders(
      <UsersList
        table={{ rows: [] }}
        scope={scope}
        scopeType="proposal"
        readOnly
      />,
    );
    expect(tableProps.value.rowActions).toBeNull();
  });

  it('skips the team permission check when the caller decides', () => {
    renderWithProviders(
      <UsersList
        table={{ rows: [] }}
        scope={scope}
        scopeType="proposal"
        canRemoveRow={() => true}
      />,
    );
    expect(canRemoveHook).toHaveBeenLastCalledWith(scope, true);
  });
});
