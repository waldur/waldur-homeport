import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { translate } from '@waldur/i18n';
import { ProposalCallRound, ProposalReview } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';
import { getUser } from '@waldur/workspace/selectors';

import { EndingField } from '../EndingField';

import { ReviewItemAction } from './ReviewItemActions';
import { ReviewsListExpandableRow } from './ReviewsListExpandableRow';
import { ReviewsListPlaceholder } from './ReviewsListPlaceholder';
import { ReviewsTableFilter } from './ReviewsTableFilter';

interface ReviewsListProps {
  round: ProposalCallRound;
}

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
      result.call = filters.call.uuid;
    }
    return result;
  },
);

export const ReviewsList: FC<ReviewsListProps> = () => {
  const filter = useSelector(filtersSelctor);

  const tableProps = useTable({
    table: 'MyReviewsList',
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
          title: translate('Call'),
          render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
        },
        {
          title: translate('Review due'),
          render: ({ row }) => <EndingField endDate={row.review_end_date} />,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{row.state}</>,
        },
      ]}
      title={translate('My reviews')}
      verboseName={translate('My reviews')}
      hasQuery={true}
      hoverableRow={ReviewItemAction}
      expandableRow={ReviewsListExpandableRow}
      filters={<ReviewsTableFilter />}
    />
  );
};
