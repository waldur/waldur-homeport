import { FC } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { EndingField } from '@waldur/proposals/EndingField';
import { ReviewsTableFilter } from '@waldur/proposals/review/ReviewsTableFilter';
import { ProposalReview } from '@waldur/proposals/types';
import { formatReviewState } from '@waldur/proposals/utils';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';
import { getCustomer, getUser } from '@waldur/workspace/selectors';

import { ReviewItemAction } from './ReviewItemActions';
import { ReviewsListExpandableRow } from './ReviewsListExpandableRow';

const filtersSelector = createSelector(
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
      result.call_uuid = filters.call.uuid;
    }
    return result;
  },
);

export const CustomerReviewsList: FC<{}> = () => {
  const user = useSelector(getUser);
  const ReviewItemActions = ({ row, fetch }) => (
    <>
      <Link
        state="proposal-review"
        params={{
          review_uuid: row.uuid,
        }}
        className="btn btn-outline btn-outline-primary btn-sm border-gray-400 btn-active-secondary px-2"
      >
        {translate('View')}
      </Link>
      {user.is_staff ? <ReviewItemAction row={row} fetch={fetch} /> : null}
    </>
  );

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
          title: translate('Proposal'),
          render: ({ row }) => <>{row.proposal_name}</>,
        },
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.reviewer_full_name}</>,
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
      hoverableRow={ReviewItemActions}
    />
  );
};
