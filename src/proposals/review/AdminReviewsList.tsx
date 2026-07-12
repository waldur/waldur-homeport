import { FC, useMemo } from 'react';
import { proposalReviewsList } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { EndingField } from '@/proposals/EndingField';
import { ProposalReview } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import {
  ProposalReviewsFilter,
  selectProposalReviewsFilter,
  ProposalReviewStateOptions,
  ProposalReviewsFilterFormId,
} from '@/table/generated/ProposalReviewsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ReviewExpandableRow } from './ReviewExpandableRow';
import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewStateRenderer } from './ReviewStateRenderer';

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const AdminReviewsList: FC = () => {
  const values = useFilterValues('AdminReviewsList');

  const filter = useMemo(() => selectProposalReviewsFilter(values), [values]);

  const tableProps = useTable({
    table: 'AdminReviewsList',
    syncFiltersToURL: true,
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
          inlineFilter: (row) => ({ name: row.call_name, uuid: row.call_uuid }),
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
            ProposalReviewStateOptions.filter((s) => s.value === row.state),
          keys: ['state'],
          id: 'state',
        },
      ]}
      title={translate('All reviews')}
      verboseName={translate('Reviews')}
      standalone
      hasQuery={true}
      filters={<ProposalReviewsFilter />}
      rowActions={ReviewsRowActions}
      expandableRow={ReviewExpandableRow}
      showPageSizeSelector={true}
      hasOptionalColumns
      formId={ProposalReviewsFilterFormId}
    />
  );
};
