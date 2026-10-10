import { FC, useCallback, useMemo } from 'react';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { BaseEventsList } from '@/events/BaseEventsList';
import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
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
    <EmbeddedTabs
      defaultValue="users"
      className="min-h-175px"
      tabs={[
        {
          key: 'users',
          title: translate('Users'),
          content: <div className="proposal-flush-table">{usersList}</div>,
        },
        {
          key: 'permissions',
          title: translate('Permissions'),
          content: (
            <BaseEventsList
              table={`proposal-team-log${props.scope.url}`}
              filter={eventsFilter}
              cardBordered={false}
              hasActionBar={false}
              fullWidth
              minHeight="auto"
            />
          ),
        },
      ]}
    />
  );
};
