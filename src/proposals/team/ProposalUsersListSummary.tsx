import { FC, useCallback, useMemo } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { TableTabsContainer } from '@/customer/list/TableTabsContainer';
import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';

import { TeamDropdownActions } from './TeamDropdownActions';
import { TEAM_EVENT_TYPES } from './teamRules';
import { useProposalTeamRules } from './useProposalTeamRules';
import { UsersList } from './UsersList';

import '@/proposals/flushTable.scss';

export const ProposalUsersListSummary: FC<{
  scope: Proposal;
  reviews?;
  // Set by the proposal detail for reviewer-only viewers: role expiration is
  // team-admin metadata concealed from reviewers (backend also drops it).
  hideExpiration?: boolean;
}> = (props) => {
  const usersTable = useTable({
    table: `ProposalUsersList`,
    fetchData: createFetcher(proposalProposalsListUsersList, {
      path: { uuid: props.scope.uuid },
    }),
  });

  // Once the proposal is submitted, staff and the call's managers and
  // organisers may still change its team; the applicant team sees it
  // read-only.
  const rules = useProposalTeamRules(props.scope);
  const fetchUsers = usersTable.fetch;
  const { onTeamChange } = rules;
  const refetchUsers = useCallback(() => {
    fetchUsers();
    onTeamChange();
  }, [fetchUsers, onTeamChange]);

  // Staff and the call's managers also see who changed the team, including
  // changes made after submission.
  const canViewTeamLog = rules.canOversee;
  const eventsFilter = useMemo(
    () => ({
      scope: props.scope.url,
      event_type: TEAM_EVENT_TYPES,
    }),
    [props.scope.url],
  );

  const usersList = (
    <>
      {rules.dropdown ? (
        <div className="d-flex justify-content-end pt-3">
          <TeamDropdownActions
            scope={props.scope}
            roleTypes={['proposal']}
            {...rules.dropdown}
            refetchUsers={refetchUsers}
          />
        </div>
      ) : null}
      {rules.teamNote ? (
        <p className="text-muted py-3 mb-0">{rules.teamNote}</p>
      ) : null}
      <UsersList
        table={usersTable}
        scope={props.scope}
        scopeType="proposal"
        hideRole={false}
        hideExpiration={props.hideExpiration}
        readOnly={rules.readOnly}
        canRemoveRow={rules.canRemoveRow}
        getRemoveDisabledReason={rules.getRemoveDisabledReason}
        refetch={refetchUsers}
        cardBordered={false}
        hasActionBar={false}
        tableFooter={
          <FieldReviewComments
            reviews={props.reviews}
            fieldName="comment_team"
            space={0}
          />
        }
      />
    </>
  );

  if (!canViewTeamLog) {
    return <div className="proposal-flush-table">{usersList}</div>;
  }

  return (
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
          <Nav.Item className="text-nowrap">
            <Nav.Link eventKey="permissions">
              {translate('Permissions')}
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>
      <Tab.Content className="overflow-auto">
        <Tab.Pane eventKey="users">
          <div className="proposal-flush-table">{usersList}</div>
        </Tab.Pane>
        <Tab.Pane eventKey="permissions">
          <BaseEventsList
            table={`proposal-team-log${props.scope.url}`}
            filter={eventsFilter}
            cardBordered={false}
            hasActionBar={false}
            fullWidth
            minHeight="auto"
          />
        </Tab.Pane>
      </Tab.Content>
    </TableTabsContainer>
  );
};
