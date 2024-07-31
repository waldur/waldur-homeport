import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ProposalReview } from '@waldur/proposals/types';
import { formatReviewState } from '@waldur/proposals/utils';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { EndingField } from '../EndingField';

import { ReviewItemAction } from './ReviewItemActions';
import { ReviewsTableFilter } from './ReviewsTableFilter';

const filtersSelctor = createSelector(
  getUser,
  getFormValues(USER_REVIEWS_FILTER_FORM_ID),
  (user, filters: any) => {
    const result: Record<string, any> = {};
    result.reviewer_uuid = user.uuid;
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call_uuid = filters.call.uuid;
    }
    return result;
  },
);

export const UserReviewsList: FC = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'MyReviewsList',
    fetchData: createFetcher('proposal-reviews'),
    queryField: 'proposal_name',
    filter,
  });

  const ReviewItemActions = ({ row, fetch }) => (
    <>
      <Link
        state="proposal-review-view"
        params={{
          review_uuid: row.uuid,
        }}
        className="btn btn-outline btn-outline-dark btn-sm border-gray-400 btn-active-secondary px-2"
      >
        {translate('View')}
      </Link>
      <ReviewItemAction row={row} fetch={fetch} />
    </>
  );

  return (
    <Table<ProposalReview>
      {...tableProps}
      columns={[
        {
          title: translate('UUID'),
          render: ({ row }) => <>{row.uuid}</>,
          keys: ['uuid'],
          id: 'uuid',
          optional: true,
        },
        {
          title: translate('Proposal'),
          render: ({ row }) => <>{row.proposal_name}</>,
          keys: ['proposal_name'],
          id: 'proposal',
        },
        {
          title: translate('Call'),
          render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
          filter: 'call',
          keys: ['call_name'],
          id: 'call',
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{row.round_name}</>,
          keys: ['round_name'],
          id: 'round',
          optional: true,
        },
        {
          title: translate('Review due'),
          render: ({ row }) => <EndingField endDate={row.review_end_date} />,
          keys: ['review_end_date'],
          id: 'review_due',
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{formatReviewState(row.state)}</>,
          filter: 'state',
          keys: ['state'],
          id: 'state',
        },
      ]}
      title={translate('My reviews')}
      verboseName={translate('My reviews')}
      hasQuery={true}
      hoverableRow={ReviewItemActions}
      filters={<ReviewsTableFilter />}
      hasOptionalColumns
    />
  );
};
