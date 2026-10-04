import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { ProposalUsersListSummary } from './ProposalUsersListSummary';

const { usersListProps, dropdownProps } = vi.hoisted(() => ({
  usersListProps: { value: null as any },
  dropdownProps: { value: null as any },
}));

vi.mock('./UsersList', () => ({
  UsersList: (props) => {
    usersListProps.value = props;
    return null;
  },
}));

vi.mock('./TeamDropdownActions', () => ({
  TeamDropdownActions: (props) => {
    dropdownProps.value = props;
    return null;
  },
}));

vi.mock('@/events/BaseEventsList', () => ({ BaseEventsList: () => null }));

vi.mock('@/table/useTable', () => ({
  useTable: () => ({ fetch: vi.fn(), rows: [] }),
}));

const proposal = (state: string) =>
  ({
    uuid: 'proposal-1',
    url: '/api/proposal-proposals/proposal-1/',
    state,
    call_uuid: 'call-1',
    call_managing_organisation_uuid: 'organizer-1',
    created_by_uuid: 'creator',
  }) as any;

const applicant = {
  uuid: 'applicant',
  permissions: [
    {
      role_name: RoleEnum.PROPOSAL_MANAGER,
      scope_type: 'proposal',
      scope_uuid: 'proposal-1',
    },
  ],
};
const callManager = {
  uuid: 'call-manager',
  permissions: [
    {
      role_name: RoleEnum.CALL_MANAGER,
      scope_type: 'call',
      scope_uuid: 'call-1',
    },
  ],
};

const FIXED_NOTE =
  'The team is fixed after submission; the call manager can change it.';

const renderAs = (user, state: string) => {
  vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
    {
      name: RoleEnum.PROPOSAL_MANAGER,
      content_type: 'proposal',
      is_active: true,
      permissions: [PermissionEnum.MANAGE_PROPOSAL],
    },
    {
      name: RoleEnum.PROPOSAL_ADMIN,
      content_type: 'proposal',
      is_active: true,
      permissions: [PermissionEnum.UPDATE_PROPOSAL],
    },
    {
      name: RoleEnum.PROPOSAL_MEMBER,
      content_type: 'proposal',
      is_active: true,
      permissions: [],
    },
    {
      name: RoleEnum.CALL_MANAGER,
      content_type: 'call',
      is_active: true,
      permissions: [PermissionEnum.UPDATE_CALL],
    },
  ] as any);
  vi.mocked(workspaceHooks.useUser).mockReturnValue(user);
  renderWithProviders(<ProposalUsersListSummary scope={proposal(state)} />);
  return usersListProps.value;
};

describe('ProposalUsersListSummary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    usersListProps.value = null;
    dropdownProps.value = null;
  });

  it('is read-only for the applicant once the proposal is submitted', () => {
    const props = renderAs(applicant, 'submitted');
    expect(props.readOnly).toBe(true);
    expect(dropdownProps.value).toBeNull();
    expect(screen.getByText(FIXED_NOTE)).toBeInTheDocument();
  });

  it('lets a call manager change the whole team after submission', () => {
    const props = renderAs(callManager, 'submitted');
    expect(props.readOnly).toBe(false);
    expect(dropdownProps.value.roles).toEqual([
      RoleEnum.PROPOSAL_MANAGER,
      RoleEnum.PROPOSAL_ADMIN,
      RoleEnum.PROPOSAL_MEMBER,
    ]);
    // Invite by mail is enabled for them, not greyed out by the generic
    // team permission check.
    expect(dropdownProps.value.canInvite).toBe(true);
    const memberRow = {
      user_uuid: 'applicant',
      role_name: RoleEnum.PROPOSAL_MEMBER,
    };
    expect(props.canRemoveRow(memberRow)).toBe(true);
    expect(screen.queryByText(FIXED_NOTE)).not.toBeInTheDocument();
  });

  it('shows the team change log to a call manager', () => {
    renderAs(callManager, 'submitted');
    expect(screen.getByText('Permissions')).toBeInTheDocument();
  });

  it('hides the team change log from the applicant', () => {
    renderAs(applicant, 'submitted');
    expect(screen.queryByText('Permissions')).not.toBeInTheDocument();
  });

  it('disables Remove on the last proposal manager', async () => {
    vi.mocked(proposalProposalsListUsersList).mockResolvedValue({
      data: [{ user_uuid: 'applicant', role_name: RoleEnum.PROPOSAL_MANAGER }],
    } as any);
    renderAs(callManager, 'submitted');
    const managerRow = {
      user_uuid: 'applicant',
      role_name: RoleEnum.PROPOSAL_MANAGER,
    };
    await waitFor(() =>
      expect(usersListProps.value.getRemoveDisabledReason(managerRow)).toBe(
        'A proposal must keep at least one proposal manager. Grant the role to someone else first.',
      ),
    );
    expect(
      usersListProps.value.getRemoveDisabledReason({
        user_uuid: 'other',
        role_name: RoleEnum.PROPOSAL_ADMIN,
      }),
    ).toBeUndefined();
  });
});
