import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { Round, ProposalReview } from '@waldur/proposals/types';
import { formatReviewState } from '@waldur/proposals/utils';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';
import { EndingField } from '@waldur/user/proposals/EndingField';
import { ReviewsListExpandableRow } from '@waldur/user/proposals/reviews/ReviewsListExpandableRow';
import { ReviewsListPlaceholder } from '@waldur/user/proposals/reviews/ReviewsListPlaceholder';
import { ReviewsTableFilter } from '@waldur/user/proposals/reviews/ReviewsTableFilter';
import { getCustomer } from '@waldur/workspace/selectors';

interface ReviewsListProps {
  round: Round;
}

const filtersSelctor = createSelector(
  getCustomer,
  getFormValues(USER_REVIEWS_FILTER_FORM_ID),
  (customer, filters: any) => {
    const result: Record<string, any> = {};
    if (customer) {
      result.organization_uuid = customer.uuid;
    }
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call = filters.call.uuid;
    }
    return result;
  },
);

export const ReviewsList: FC<ReviewsListProps> = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'ReviewsList',
    fetchData: createFetcher('proposal-reviews'),
    queryField: 'proposal_name',
    filter,
  });

  return (
    <Table<ProposalReview>
      {...tableProps}
      placeholderComponent={<ReviewsListPlaceholder />}
      columns={[
        {
          title: translate('Proposal'),
          render: ({ row }) => <>{row.proposal_name}</>,
        },
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.reviewer_full_name}</>,
        },
        {
          title: translate('Call'),
          render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
        },
        {
          title: translate('Review due'),
          render: ({ row }) => <EndingField endDate={row.review_end_date} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{formatReviewState(row.state)}</>,
        },
      ]}
      title={translate('Reviews')}
      verboseName={translate('Reviews')}
      hasQuery={true}
      expandableRow={ReviewsListExpandableRow}
      filters={<ReviewsTableFilter />}
    />
  );
};
