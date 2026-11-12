import { screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ENV } from '@/core/config';
import { PermissionEnum, RoleEnum } from '@/permissions/enums';
import { renderWithProviders } from '@/test/harness';
import * as workspaceHooks from '@/workspace/hooks';

import { TeamSection } from './TeamSection';

const { fetchCount, dropdownProps, usersListProps } = vi.hoisted(() => ({
  fetchCount: { value: 0 },
  dropdownProps: { value: null as any },
  usersListProps: { value: null as any },
}));

// Like useTableQuery, run onFetch from an effect keyed on the callback: an
// unstable callback then fires on every render. The first call is the first
// fetch, later ones are refetches.
vi.mock('waldur-table/src/useTable', () => ({
  useTable: (options) => {
    useEffect(() => {
      options.onFetch?.([], 0, fetchCount.value++ === 0);
    }, [options.onFetch]);
    return { fetch: vi.fn() };
  },
}));

vi.mock('./UsersList', () => ({
  UsersList: (props) => {
    usersListProps.value = props;
    return null;
  },
}));
vi.mock('./InvitationsList', () => ({ InvitationsList: () => null }));
vi.mock('./TeamDropdownActions', () => ({
  TeamDropdownActions: (props) => {
    dropdownProps.value = props;
    return null;
  },
}));
vi.mock('@/events/BaseEventsList', () => ({ BaseEventsList: () => null }));
vi.mock('../proposal/create-review/FieldReviewComments', () => ({
  FieldReviewComments: () => null,
}));

const proposal = (state = 'draft') =>
  ({
    uuid: 'proposal-1',
    url: '/api/proposal-proposals/proposal-1/',
    state,
    call_uuid: 'call-1',
    call_managing_organisation_uuid: 'organizer-1',
    created_by_uuid: 'creator',
  }) as any;

const holder = (role_name: string) =>
  ({
    uuid: 'viewer',
    permissions: [
      { role_name, scope_type: 'proposal', scope_uuid: 'proposal-1' },
    ],
  }) as any;

describe('TeamSection', () => {
  beforeEach(() => {
    fetchCount.value = 0;
    dropdownProps.value = null;
    vi.spyOn(ENV, 'roles', 'get').mockReturnValue([
      {
        name: RoleEnum.PROPOSAL_MANAGER,
        content_type: 'proposal',
        is_active: true,
        permissions: [
          PermissionEnum.MANAGE_PROPOSAL,
          PermissionEnum.UPDATE_PROPOSAL,
        ],
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
    ] as any);
  });
  afterEach(() => vi.restoreAllMocks());

  const renderSection = (user, props = {}) => {
    vi.mocked(workspaceHooks.useUser).mockReturnValue(user);
    const render = () => (
      <TeamSection
        scope={proposal()}
        roleTypes={['proposal']}
        title={null}
        {...props}
      />
    );
    return { ...renderWithProviders(render()), render };
  };

  it('does not reload anything when the form re-renders it', () => {
    const change = vi.fn();
    const { rerender, render, queryClient } = renderSection(
      holder(RoleEnum.PROPOSAL_MANAGER),
      { change },
    );
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    // Every keystroke in the draft form re-renders the step.
    for (let i = 0; i < 5; i++) {
      rerender(render());
    }
    expect(change).toHaveBeenCalledTimes(1);
    expect(invalidate).not.toHaveBeenCalled();
  });

  it('re-reads whether the proposal can be submitted after a team change', () => {
    const { queryClient } = renderSection(holder(RoleEnum.PROPOSAL_MANAGER));
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
    dropdownProps.value.refetchUsers();
    expect(invalidate).toHaveBeenCalledWith({
      queryKey: ['ProposalCanSubmit', 'proposal-1'],
    });
  });

  it('offers a proposal manager every proposal role', () => {
    renderSection(holder(RoleEnum.PROPOSAL_MANAGER));
    expect(dropdownProps.value.roles).toEqual([
      RoleEnum.PROPOSAL_MANAGER,
      RoleEnum.PROPOSAL_ADMIN,
      RoleEnum.PROPOSAL_MEMBER,
    ]);
    expect(dropdownProps.value.canInvite).toBe(true);
    expect(screen.getByText('Invitations')).toBeInTheDocument();
    expect(screen.getByText('Team changes')).toBeInTheDocument();
  });

  it('leaves the team to the managers for an administrator', () => {
    renderSection(holder(RoleEnum.PROPOSAL_ADMIN));
    expect(dropdownProps.value).toBeNull();
    expect(
      screen.getByText('Only a proposal manager can change the proposal team.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Invitations')).not.toBeInTheDocument();
    expect(screen.queryByText('Team changes')).not.toBeInTheDocument();
  });

  const callTeam = {
    scope: { uuid: 'call-1', url: '/api/proposal-protected-calls/call-1/' },
    roleTypes: ['call', 'call_organizer'],
    roles: [
      RoleEnum.CALL_MANAGER,
      RoleEnum.CALL_PANEL_MEMBER,
      RoleEnum.CALL_REVIEWER,
    ],
  };

  it("expands only a call reviewer's row, to show their reviewer profile", () => {
    renderSection(holder(RoleEnum.PROPOSAL_MANAGER), {
      ...callTeam,
      showReviewerProfiles: true,
    });
    expect(usersListProps.value.expandableRow).toBeDefined();
    const { isRowExpandable } = usersListProps.value;
    expect(isRowExpandable({ role_name: RoleEnum.CALL_REVIEWER })).toBe(true);
    expect(isRowExpandable({ role_name: RoleEnum.CALL_MANAGER })).toBe(false);
    expect(isRowExpandable({ role_name: RoleEnum.CALL_PANEL_MEMBER })).toBe(
      false,
    );
  });

  it('expands no row for a viewer not shown the reviewer profiles', () => {
    renderSection(holder(RoleEnum.PROPOSAL_MANAGER), callTeam);
    expect(usersListProps.value.expandableRow).toBeUndefined();
  });

  it('gives a team without the reviewer role no expandable rows', () => {
    renderSection(holder(RoleEnum.PROPOSAL_MANAGER));
    expect(usersListProps.value.expandableRow).toBeUndefined();
  });
});
