import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  proposalProposalsDeleteUser,
  proposalProtectedCallsDeleteUser,
} from 'waldur-js-client';

import { format } from '@/core/ErrorMessageFormatter';
import { RoleEnum } from '@/permissions/enums';
import { useNotify } from '@/store/notify';
import { inActionsMenu, renderWithProviders } from '@/test/harness';

import { deleteTeamUser, getTeamScopeType } from './teamApi';
import { UserRemoveButton } from './UserRemoveButton';

const LAST_MANAGER =
  'A proposal must keep at least one proposal manager. Grant the role to someone else first.';

// What the generated client rejects with on a DRF 400 whose body is a list:
// the body spread onto the error, with the response details beside it.
const lastManagerError = () => ({
  0: LAST_MANAGER,
  response: new Response(JSON.stringify([LAST_MANAGER]), { status: 400 }),
  status: 400,
  statusText: 'Bad Request',
  url: '/api/proposal-proposals/proposal-1/delete_user/',
});

const proposal = {
  uuid: 'proposal-1',
  url: '/api/proposal-proposals/proposal-1/',
};

describe('proposal team API', () => {
  afterEach(() => vi.clearAllMocks());

  it('reaches the endpoint of the scope type it is given', async () => {
    await deleteTeamUser('proposal', 'proposal-1', {
      user: 'u',
      role: 'PROPOSAL.ADMIN',
    });
    await deleteTeamUser('call', 'call-1', {
      user: 'u',
      role: 'CALL.REVIEWER',
    });
    expect(proposalProposalsDeleteUser).toHaveBeenCalledWith({
      path: { uuid: 'proposal-1' },
      body: { user: 'u', role: 'PROPOSAL.ADMIN' },
    });
    expect(proposalProtectedCallsDeleteUser).toHaveBeenCalledWith({
      path: { uuid: 'call-1' },
      body: { user: 'u', role: 'CALL.REVIEWER' },
    });
  });

  it('shows why the backend refused a removal', async () => {
    vi.mocked(proposalProposalsDeleteUser).mockRejectedValueOnce(
      lastManagerError(),
    );
    renderWithProviders(
      inActionsMenu(
        <UserRemoveButton
          permission={
            {
              user_uuid: 'manager',
              user_full_name: 'Manager',
              role_name: RoleEnum.PROPOSAL_MANAGER,
            } as any
          }
          scope={proposal}
          scopeType="proposal"
          refetch={vi.fn()}
          canRemove
        />,
      ),
    );
    await userEvent.click(screen.getByText('Remove'));
    const { showErrorResponse } = vi.mocked(useNotify)();
    await waitFor(() => expect(showErrorResponse).toHaveBeenCalled());
    const [error, message] = vi.mocked(showErrorResponse).mock.calls[0];
    expect(message).toBe('Unable to delete team member.');
    expect(format(error)).toContain(LAST_MANAGER);
  });
});

describe('getTeamScopeType', () => {
  it('reads the scope type from the role types offered', () => {
    expect(getTeamScopeType(['proposal'])).toBe('proposal');
    expect(getTeamScopeType(['call'])).toBe('call');
  });
});
