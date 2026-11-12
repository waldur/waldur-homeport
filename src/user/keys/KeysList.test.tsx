import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useUser } from '@/workspace/hooks';

import { KeysList } from './KeysList';

const table = vi.hoisted(() => ({ rows: [] as any[] }));

vi.mock('waldur-table/src/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: table.rows }),
}));

// Render each row's actions inline, as the table would in its actions column.
vi.mock('@/table/Table', () => ({
  default: ({ rows, rowActions: RowActions, fetch }) =>
    RowActions ? (
      <>
        {rows.map((row) => (
          <div key={row.uuid} data-testid={`row-${row.uuid}`}>
            <RowActions row={row} fetch={fetch} />
          </div>
        ))}
      </>
    ) : null,
}));

vi.mock('waldur-table/src/ActionsDropdown', () => ({
  ActionsDropdown: ({ actions, row, refetch }) => (
    <div data-testid="actions-menu">
      {actions.map((Action, index) => (
        <Action key={index} row={row} refetch={refetch} />
      ))}
    </div>
  ),
}));

vi.mock('./KeyRemoveButton', () => ({
  KeyRemoveButton: () => <span>Remove</span>,
}));

vi.mock('./KeyVersionHistoryAction', () => ({
  KeyVersionHistoryAction: () => <span>Version history</span>,
}));

vi.mock('./KeyCreateButton', () => ({
  KeyCreateButton: () => null,
}));

const me = { uuid: 'me', is_staff: false, is_support: false };
const key = (overrides) => ({
  uuid: 'key',
  name: 'laptop',
  user_uuid: 'me',
  is_shared: false,
  ...overrides,
});

const renderKeys = (currentUser, listUser = { uuid: currentUser.uuid }) => {
  vi.mocked(useUser).mockReturnValue(currentUser as any);
  return render(<KeysList user={listUser} />);
};

describe('KeysList row actions', () => {
  beforeEach(() => {
    table.rows = [];
  });

  it('shows no row actions on another user’s profile to a non-staff user', () => {
    table.rows = [key({ user_uuid: 'other' })];
    renderKeys(me, { uuid: 'other' });
    expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument();
  });

  it('offers no Remove on a key the caller does not own', () => {
    // The list asks only for the profile owner's keys, so this guards the
    // rule itself rather than anything a user can reach today.
    table.rows = [key({ user_uuid: 'other' })];
    renderKeys(me);
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('offers Remove on an own key that is not shared', () => {
    table.rows = [key({})];
    renderKeys(me);
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('offers Remove to support on their own key that is not shared', () => {
    table.rows = [key({})];
    renderKeys({ ...me, is_support: true });
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('offers no Remove, nor an empty menu, on a shared key to its non-staff owner', () => {
    // Mastermind lets only staff delete a shared key.
    table.rows = [key({ is_shared: true })];
    renderKeys(me);
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    expect(screen.queryByTestId('actions-menu')).not.toBeInTheDocument();
  });

  it('keeps Version history on a shared key for support', () => {
    table.rows = [key({ is_shared: true })];
    renderKeys({ ...me, is_support: true });
    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
    expect(screen.getByText('Version history')).toBeInTheDocument();
  });

  it('offers Remove on a shared key to staff', () => {
    table.rows = [key({ is_shared: true })];
    renderKeys({ ...me, is_staff: true });
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });
});
