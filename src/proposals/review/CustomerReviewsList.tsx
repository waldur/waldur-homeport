import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { ProposalReviewsListData } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { EndingField } from '@waldur/proposals/EndingField';
import { ReviewsTableFilter } from '@waldur/proposals/review/ReviewsTableFilter';
import { ProposalReview } from '@waldur/proposals/types';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';
import { getCustomer } from '@waldur/workspace/selectors';

import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewStateRenderer } from './ReviewStateRenderer';

const filtersSelector = createSelector(
  getCustomer,
  getFormValues(USER_REVIEWS_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: ProposalReviewsListData['query'] = {};
    if (customer) {
      result.organization_uuid = customer.uuid;
    }
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call_uuid = filters.call.uuid;
    }
    return result;
  },
);

export const CustomerReviewsList: FC<{}> = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'ReviewsList',
    fetchData: createFetcher('proposal-reviews'),
    queryField: 'proposal_name',
    filter,
  });

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
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.reviewer_full_name}</>,
          keys: ['reviewer_full_name'],
          id: 'reviewer',
        },
        {
          title: translate('Call'),
          render: ({ row }) => (
            <Link
              state="protected-call.main"
              params={{ call_uuid: row.call_uuid }}
              label={row.call_name}
            />
          ),

          filter: 'call',
          inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
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
          render: ReviewStateRenderer,

          filter: 'state',
          inlineFilter: (row) =>
            getReviewStateOptions().filter((s) => s.value === row.state),
          keys: ['state'],
          id: 'state',
        },
      ]}
      title={translate('Reviews')}
      verboseName={translate('Reviews')}
      hasQuery={true}
      filters={<ReviewsTableFilter />}
      rowActions={ReviewsRowActions}
      hasOptionalColumns
    />
  );
};
