import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { proposalReviewsList } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { EndingField } from '@waldur/proposals/EndingField';
import { ProposalReview } from '@waldur/proposals/types';
import { createFetcher } from '@waldur/table/api';
import {
  ProposalReviewsFilter,
  selectProposalReviewsFilter,
  ProposalReviewStateOptions,
} from '@waldur/table/generated/ProposalReviewsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ReviewsRowActions } from '../review/ReviewsRowActons';
import { ReviewStateRenderer } from '../review/ReviewStateRenderer';
import { Call } from '../types';

import { CallReviewExpandableRow } from './CallReviewExpandableRow';

interface CallReviewsListProps {
  call: Call;
}

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const CallReviewsList: FC<CallReviewsListProps> = ({ call }) => {
  const formFilters = useSelector(selectProposalReviewsFilter);

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      ...formFilters,
    }),
    [call.uuid, formFilters],
  );

  const tableProps = useTable({
    table: `CallReviewsList-${call.uuid}`,
    filter,
    fetchData: createFetcher(proposalReviewsList),
    queryField: 'proposal_name',
    mandatoryFields,
  });

  return (
    <Table<ProposalReview>
      {...tableProps}
      id="reviews"
      columns={[
        {
          title: translate('Proposal'),
          render: ({ row }) => (
            <Link
              state="call-management.proposal-details"
              params={{
                proposal_uuid: row.proposal_uuid,
                uuid: call.customer_uuid,
                review_uuid: row.uuid,
              }}
              label={row.proposal_name}
            />
          ),
          keys: ['proposal_name', 'proposal_uuid'],
          id: 'proposal',
          filter: 'proposal',
          inlineFilter: (row) => ({
            name: row.proposal_name,
            uuid: row.proposal_uuid,
          }),
        },
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{renderFieldOrDash(row.reviewer_full_name)}</>,
          keys: ['reviewer_full_name', 'reviewer_uuid'],
          id: 'reviewer',
          filter: 'reviewer',
          inlineFilter: (row) => ({
            full_name: row.reviewer_full_name,
            uuid: row.reviewer_uuid,
          }),
        },
        {
          title: translate('Round ID'),
          render: ({ row }) => <>{renderFieldOrDash(row.round_slug)}</>,
          copyField: (row) => row.round_slug || '',
          keys: ['round_slug', 'round_uuid'],
          id: 'round',
          filter: 'round',
          inlineFilter: (row) => ({
            name: row.round_slug,
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
          keys: ['state'],
          id: 'state',
          filter: 'state',
          inlineFilter: (row) =>
            ProposalReviewStateOptions.filter((s) => s.value === row.state),
        },
      ]}
      title={translate('Reviews')}
      hasQuery
      verboseName={translate('Reviews')}
      rowActions={ReviewsRowActions}
      filters={<ProposalReviewsFilter callUuid={call.uuid} />}
      expandableRow={CallReviewExpandableRow}
    />
  );
};
