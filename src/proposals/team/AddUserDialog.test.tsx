import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { AddUserDialog } from './AddUserDialog';

vi.mock('@/customer/team/utils', () => ({
  usersAutocomplete: vi.fn(() =>
    Promise.resolve({ options: [], hasMore: false }),
  ),
}));

const call = {
  url: '/api/proposal-protected-calls/call-uuid/',
  uuid: 'call-uuid',
  customer_uuid: 'customer-uuid',
};

const searchForUnknownUser = async (user) => {
  // The user picker comes first, before the role and expiry fields.
  const input = screen.getAllByRole('combobox')[0];
  await user.type(input, 'newcomer');
};

vi.mock('./ProposalExpiryHint', () => ({
  ProposalExpiryHint: () => <span data-testid="expiry-hint" />,
}));

describe('AddUserDialog', () => {
  it('explains the expiry against the project length only for a proposal', () => {
    renderWithProviders(
      <AddUserDialog scope={call} roleTypes={['call']} refetch={vi.fn()} />,
    );
    expect(screen.queryByTestId('expiry-hint')).not.toBeInTheDocument();

    renderWithProviders(
      <AddUserDialog
        scope={
          {
            url: '/api/proposal-proposals/p1/',
            uuid: 'p1',
            call_uuid: 'call-uuid',
          } as any
        }
        roleTypes={['proposal']}
        refetch={vi.fn()}
      />,
    );
    expect(screen.getByTestId('expiry-hint')).toBeInTheDocument();
  });

  it('offers an invitation when no user matches the search', async () => {
    const user = userEvent.setup();
    const onInviteByMail = vi.fn();
    renderWithProviders(
      <AddUserDialog
        scope={call}
        roleTypes={['call']}
        refetch={vi.fn()}
        onInviteByMail={onInviteByMail}
      />,
    );
    await searchForUnknownUser(user);
    const link = await screen.findByRole('button', {
      name: 'Invite them by email',
    });
    await user.click(link);
    expect(onInviteByMail).toHaveBeenCalled();
  });

  it('only says nothing was found when the user may not invite', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <AddUserDialog scope={call} roleTypes={['call']} refetch={vi.fn()} />,
    );
    await searchForUnknownUser(user);
    await waitFor(() =>
      expect(screen.getByText('No users found.')).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: 'Invite them by email' }),
    ).toBeNull();
  });
});
