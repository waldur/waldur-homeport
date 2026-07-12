import { FC } from 'react';
import { proposalProposalsListUsersList } from 'waldur-js-client';

import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

import { FieldReviewComments } from '../proposal/create-review/FieldReviewComments';

import { UsersList } from './UsersList';

export const ProposalUsersListSummary: FC<{
  scope;
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
  return (
    <UsersList
      table={usersTable}
      scope={props.scope}
      hideRole={false}
      hideExpiration={props.hideExpiration}
      readOnly
      tableFooter={
        <FieldReviewComments
          reviews={props.reviews}
          fieldName="comment_team"
          space={0}
        />
      }
    />
  );
};
