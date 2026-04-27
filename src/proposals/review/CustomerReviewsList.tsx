import { FC } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { proposalReviewsList, ProposalReviewsListData } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { EndingField } from '@/proposals/EndingField';
import { ProposalReview } from '@/proposals/types';
import { getReviewStateOptions } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import {
  ProposalReviewsFilter,
  selectProposalReviewsFilter,
} from '@/table/generated/ProposalReviewsFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { getCustomer } from '@/workspace/selectors';

import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewStateRenderer } from './ReviewStateRenderer';

const filtersSelector = createSelector(
  getCustomer,
  selectProposalReviewsFilter,
  (customer, filters) => {
    const result: ProposalReviewsListData['query'] = { ...filters };
    if (customer) {
      result.organization_uuid = customer.uuid;
    }
    return result;
  },
);

export const CustomerReviewsList: FC<{}> = () => {
  const filter = useSelector(filtersSelector);

  const tableProps = useTable({
    table: 'ReviewsList',
    fetchData: createFetcher(proposalReviewsList),
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
      filters={<ProposalReviewsFilter />}
      rowActions={ReviewsRowActions}
      hasOptionalColumns
    />
  );
};
