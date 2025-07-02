import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { ProposalReviewsListData } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ProposalReview } from '@waldur/proposals/types';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { EndingField } from '../EndingField';

import { ReviewsExpandableRow } from './ReviewsExpandableRow';
import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewsTableFilter } from './ReviewsTableFilter';
import { ReviewStateRenderer } from './ReviewStateRenderer';

const filtersSelctor = createSelector(
  getUser,
  getFormValues(USER_REVIEWS_FILTER_FORM_ID),
  (user, filters: any) => {
    const result: ProposalReviewsListData['query'] = {};
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

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const UserReviewsList: FC = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'MyReviewsList',
    fetchData: createFetcher('proposal-reviews'),
    queryField: 'proposal_name',
    filter,
    mandatoryFields,
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
          render: ({ row }) => (
            <span className="text-gray-700 fw-bold">{row.proposal_name}</span>
          ),

          keys: ['proposal_name'],
          id: 'proposal',
        },
        {
          title: translate('Call'),
          render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
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
      title={translate('My reviews')}
      verboseName={translate('My reviews')}
      hasQuery={true}
      rowActions={ReviewsRowActions}
      filters={<ReviewsTableFilter />}
      expandableRow={ReviewsExpandableRow}
      hasOptionalColumns
    />
  );
};
