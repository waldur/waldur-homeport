import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import { proposalReviewsList, ProposalReviewsListData } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { EndingField } from '@waldur/proposals/EndingField';
import { ProposalReview } from '@waldur/proposals/types';
import { getReviewStateOptions } from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { USER_REVIEWS_FILTER_FORM_ID } from '@waldur/user/constants';

import { AdminReviewsTableFilter } from './AdminReviewsTableFilter';
import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewStateRenderer } from './ReviewStateRenderer';

const filtersSelector = createSelector(
  getFormValues(USER_REVIEWS_FILTER_FORM_ID),
  (filters: any) => {
    const result: ProposalReviewsListData['query'] & { round_uuid?: string } =
      {};
    if (filters?.state) {
      result.state = filters.state.map((option) => option.value);
    }
    if (filters?.call) {
      result.call_uuid = filters.call.uuid;
    }
    if (filters?.round) {
      result.round_uuid = filters.round.uuid;
    }
    if (filters?.organization) {
      result.organization_uuid = filters.organization.uuid;
    }
    if (filters?.reviewer) {
      result.reviewer_uuid = filters.reviewer.uuid;
    }
    return result;
  },
);

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const AdminReviewsList: FC = () => {
  const filterValues = useSelector(filtersSelector);
  const filter = useMemo(() => filterValues, [JSON.stringify(filterValues)]);

  const tableProps = useTable({
    table: 'AdminReviewsList',
    fetchData: createFetcher(proposalReviewsList),
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
          title: translate('Reviewer'),
          render: ({ row }) => <>{renderFieldOrDash(row.reviewer_full_name)}</>,
          keys: ['reviewer_full_name'],
          id: 'reviewer',
        },
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <>{renderFieldOrDash((row as any).organization_name)}</>
          ),
          filter: 'organization',
          inlineFilter: (row) => ({
            name: (row as any).organization_name,
            uuid: (row as any).organization_uuid,
          }),
          keys: ['organization_name'] as any,
          id: 'organization',
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
          inlineFilter: (row) => ({
            name: row.call_name,
            uuid: row.call_uuid,
          }),
          keys: ['call_name'],
          id: 'call',
        },
        {
          title: translate('Round'),
          render: ({ row }) => <>{renderFieldOrDash(row.round_name)}</>,
          keys: ['round_name', 'round_uuid'],
          id: 'round',
          filter: 'round',
          inlineFilter: (row) => ({
            name: row.round_name,
            uuid: row.round_uuid,
          }),
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
      title={translate('All reviews')}
      verboseName={translate('Reviews')}
      hasQuery={true}
      filters={<AdminReviewsTableFilter />}
      rowActions={ReviewsRowActions}
      showPageSizeSelector={true}
      hasOptionalColumns
    />
  );
};
