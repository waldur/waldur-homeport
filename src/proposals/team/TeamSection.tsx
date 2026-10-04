import { useQueryClient } from '@tanstack/react-query';
import { FC, ReactNode, useCallback, useMemo, useRef } from 'react';
import { Card, Nav, Tab } from 'react-bootstrap';
import {
  proposalProposalsListUsersList,
  proposalProtectedCallsListUsersList,
  userInvitationsList,
} from 'waldur-js-client';

import { TableTabsContainer } from '@/customer/list/TableTabsContainer';
import { BaseEventsList } from '@/events/BaseEventsList';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { GenericInvitationContext } from '@/invitations/types';
import { RoleEnum } from '@/permissions/enums';
import { GenericPermission } from '@/permissions/types';
import { createFetcher } from '@/table/api';
import { TableTabs } from '@/table/TableTabs';
import { useTable } from '@/table/useTable';

import { CALL_REVIEWERS_QUERY_KEY } from '../constants';
import { AddCommentButton } from '../proposal/create-review/AddCommentButton';
import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';
import { Proposal, ProposalReview } from '../types';

import { InvitationsList } from './InvitationsList';
import { ReviewerExpandableRow } from './ReviewerExpandableRow';
import { getTeamScopeType } from './teamApi';
import { TeamDropdownActions } from './TeamDropdownActions';
import { TEAM_EVENT_TYPES } from './teamRules';
import { useProposalTeamRules } from './useProposalTeamRules';
import { UsersList } from './UsersList';

export const TeamSection: FC<
  GenericInvitationContext & {
    title: string;
    change?(field: string, value: any): void;
    reviews?: ProposalReview[];
    onAddCommentClick?({ commentField, label }): void;
    readOnlyMode?: boolean;
    id?: string;
    hasTeamTabs?: boolean;
    extraRowActions?: FC<{ row: GenericPermission }>;
    hasExtraRowActions?: (row: GenericPermission) => boolean;
    roleSuffix?: (row: GenericPermission) => ReactNode;
  }
> = (props) => {
  const queryClient = useQueryClient();
  const hideRole = props.roles && props.roles.length === 1;

  const roleType = props.roleTypes?.[0];
  // A proposal's team follows rules of its own: who may grant or revoke which
  // role depends on the proposal's state and the viewer's role on it or on
  // its call, not only on the scope's team permission.
  const isProposalTeam = roleType === 'proposal' && !props.roles;
  const proposal = isProposalTeam ? (props.scope as Proposal) : undefined;
  const rules = useProposalTeamRules(proposal);
  const scopeType = getTeamScopeType(props.roleTypes);

  const usersFilter = useMemo(
    () => ({
      role: props.roles,
    }),
    [props.roles],
  );

  // useTableQuery runs onFetch in an effect keyed on the callback, so an
  // inline function would run it on every render (every keystroke in the
  // draft form). The latest handler is kept in a ref behind a stable callback.
  const onUsersFetchRef = useRef<(rows: any[]) => void>(undefined);
  onUsersFetchRef.current = (rows) => {
    if (props.change) {
      props.change('users', rows);
    }
    // Update query data for the call reviewers
    if (props.roles && props.roles.includes(RoleEnum.CALL_REVIEWER)) {
      const newReviewers = rows.filter(
        (row) => row.role_name === RoleEnum.CALL_REVIEWER,
      );
      queryClient.setQueryData(
        [CALL_REVIEWERS_QUERY_KEY, props.scope.uuid],
        newReviewers,
      );
    }
  };
  const onUsersFetch = useCallback(
    (rows: any[]) => onUsersFetchRef.current?.(rows),
    [],
  );

  const usersTable = useTable({
    table: `UserList${props.title}`,
    fetchData: createFetcher(
      roleType === 'proposal'
        ? proposalProposalsListUsersList
        : proposalProtectedCallsListUsersList,
      { path: { uuid: props.scope.uuid } },
    ),
    filter: usersFilter,
    onFetch: onUsersFetch,
  });

  const invitationsFilter = useMemo(
    () => ({ scope: props.scope.url }),
    [props.scope],
  );
  const invitationsTable = useTable({
    table: `UserInvitations${props.title}`,
    fetchData: createFetcher(userInvitationsList),
    queryField: 'email',
    filter: invitationsFilter,
  });

  const eventsFilter = useMemo(
    () => ({
      scope: props.scope.url,
      event_type: TEAM_EVENT_TYPES,
    }),
    [props.scope],
  );

  // After a member was added or removed, not on every reload of the table
  // (paging, search): the team change may decide whether the proposal can be
  // submitted.
  const fetchUsers = usersTable.fetch;
  const onTeamChange = rules?.onTeamChange;
  const refetchUsers = useCallback(() => {
    fetchUsers();
    onTeamChange?.();
  }, [fetchUsers, onTeamChange]);

  const showTeamActions = !props.readOnlyMode && (!rules || rules.dropdown);
  // Invitations and the change log are for those who manage the team.
  const showManagementTabs =
    !props.readOnlyMode && (!rules || rules.canManageTeam);

  return (
    <Card className="card-bordered" id={props.id}>
      <Card.Header className="pt-4 pb-2">
        <Card.Title>
          <h3>{props.title}</h3>
        </Card.Title>
        <div className="card-toolbar gap-4">
          {showTeamActions ? (
            <TeamDropdownActions
              refetchUsers={refetchUsers}
              refetchInvitations={invitationsTable.fetch}
              {...props}
              {...rules?.dropdown}
            />
          ) : props.onAddCommentClick ? (
            <AddCommentButton
              review={props.reviews?.[0]}
              onClick={() =>
                props.onAddCommentClick({
                  commentField: 'comment_team',
                  label: props.title,
                })
              }
            />
          ) : null}
        </div>
      </Card.Header>
      {props.hasTeamTabs &&
        !isFeatureVisible(MarketplaceFeatures.call_only) && (
          <Card.Header className="table-tabs border-bottom align-items-stretch py-0 min-h-auto">
            <TableTabs
              tabs={[
                {
                  key: 'reviewers',
                  title: translate('Reviewers'),
                  state: 'protected-call.main',
                  params: { tab: 'reviewers' },
                },
                {
                  key: 'managers',
                  title: translate('Managers'),
                  state: 'protected-call.main',
                  params: { tab: 'managers' },
                },
              ]}
            />
          </Card.Header>
        )}
      <Card.Body className="pt-0">
        <TableTabsContainer
          defaultActiveKey="users"
          unmountOnExit
          className="min-h-175px"
        >
          <div className="overflow-auto">
            <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
              <Nav.Item className="text-nowrap">
                <Nav.Link eventKey="users">{translate('Users')}</Nav.Link>
              </Nav.Item>
              {/* Invitations and the permissions log are management surfaces the
                  backend denies to reviewers; in read-only (review) mode we show
                  only the team roster so the info matches the viewer's role. */}
              {showManagementTabs && (
                <>
                  <Nav.Item className="text-nowrap">
                    <Nav.Link eventKey="invitations">
                      {translate('Invitations')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item className="text-nowrap">
                    <Nav.Link eventKey="permissions">
                      {translate('Permissions')}
                    </Nav.Link>
                  </Nav.Item>
                </>
              )}
            </Nav>
          </div>
          <Tab.Content className="overflow-auto">
            <Tab.Pane eventKey="users">
              {rules?.teamNote && !props.readOnlyMode ? (
                <p className="text-muted py-3 mb-0">{rules.teamNote}</p>
              ) : null}
              <UsersList
                table={usersTable}
                scope={props.scope}
                hideRole={hideRole}
                cardBordered={false}
                hasActionBar={false}
                fullWidth
                expandableRow={
                  props.roles?.includes(RoleEnum.CALL_REVIEWER)
                    ? ReviewerExpandableRow
                    : undefined
                }
                readOnly={props.readOnlyMode || rules?.readOnly}
                extraRowActions={props.extraRowActions}
                hasExtraRowActions={props.hasExtraRowActions}
                roleSuffix={props.roleSuffix}
                canRemoveRow={rules?.canRemoveRow}
                getRemoveDisabledReason={rules?.getRemoveDisabledReason}
                scopeType={scopeType}
                refetch={refetchUsers}
              />
            </Tab.Pane>
            <Tab.Pane eventKey="invitations">
              <InvitationsList
                table={invitationsTable}
                hideRole={hideRole}
                cardBordered={false}
                hasActionBar={false}
                fullWidth
              />
            </Tab.Pane>
            <Tab.Pane eventKey="permissions">
              <BaseEventsList
                table={`permissions-log${props.scope.url}`}
                filter={eventsFilter}
                cardBordered={false}
                hasActionBar={false}
                fullWidth
                minHeight="auto"
              />
            </Tab.Pane>
          </Tab.Content>
        </TableTabsContainer>

        <FieldReviewComments
          reviews={props.reviews}
          fieldName="comment_team"
          space={0}
        />
      </Card.Body>
    </Card>
  );
};
