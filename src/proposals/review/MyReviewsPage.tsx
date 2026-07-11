import { FC, useCallback, useMemo, useState } from 'react';
import { proposalReviewsList, ProposalReviewsListData } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { ProposalReview } from '@/proposals/types';
import { getReviewStateOptions } from '@/proposals/utils';
import { createFetcher } from '@/table/api';
import {
  ProposalReviewsFilter,
  ProposalReviewsFilterFormId,
  selectProposalReviewsFilter,
} from '@/table/generated/ProposalReviewsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

import { EndingField } from '../EndingField';

import { ReviewerProfileSummaryCard } from './ReviewerProfileSummaryCard';
import { ReviewsExpandableRow } from './ReviewsExpandableRow';
import { ReviewsRowActions } from './ReviewsRowActons';
import { ReviewStateRenderer } from './ReviewStateRenderer';
import { ReviewStatsWidgets } from './ReviewStatsWidgets';
import { useMyReviewsTabs } from './tabs';

const mandatoryFields = ['uuid', 'proposal_name', 'state'];

export const MyReviewsPage: FC = () => {
  const user = useUser();
  const values = useFilterValues('MyReviewsList');
  const filterValues = useMemo(
    () => selectProposalReviewsFilter(values),
    [values],
  );

  const filter = useMemo(() => {
    const result: ProposalReviewsListData['query'] = { ...filterValues };
    if (user) {
      result.reviewer_uuid = user.uuid;
    }
    return result;
  }, [user, filterValues]);

  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const tabs = useMyReviewsTabs();

  const handleProfileStatus = useCallback((profileExists: boolean) => {
    setHasProfile(profileExists);
  }, []);

  const tableProps = useTable({
    table: 'MyReviewsList',
    syncFiltersToURL: true,
    fetchData: createFetcher(proposalReviewsList),
    queryField: 'proposal_name',
    filter,
    mandatoryFields,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="d-flex flex-column" style={{ gap: 16 }}>
      {/* Reviewer profile summary */}
      <ReviewerProfileSummaryCard onProfileStatus={handleProfileStatus} />
      {/* Only show reviews content if user has a profile */}
      {hasProfile && (
        <>
          {/* Stats widgets */}
          <ReviewStatsWidgets />

          {/* Reviews table with tabs */}
          <Table<ProposalReview>
            {...tableProps}
            formId={ProposalReviewsFilterFormId}
            title={translate('My reviews')}
            tabs={tabs}
            columns={[
              {
                title: translate('UUID'),
                render: ({ row }) => <>{row.uuid}</>,
                keys: ['uuid'],
                id: 'uuid',
                optional: true,
              },
              {
                title: translate('Proposal slug'),
                render: ({ row }) => (
                  <Link
                    state="proposal-review"
                    params={{
                      review_uuid: row.uuid,
                    }}
                    label={(row as any).proposal_slug}
                  />
                ),
                keys: ['proposal_slug'] as any,
                id: 'proposal_slug',
              },
              {
                title: translate('Proposal name'),
                render: ({ row }) => (
                  <span className="text-gray-700 fw-bold">
                    {row.proposal_name}
                  </span>
                ),
                keys: ['proposal_name'],
                id: 'proposal',
              },
              {
                title: translate('Call'),
                render: ({ row }) => <>{renderFieldOrDash(row.call_name)}</>,
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
                render: ({ row }) => <>{row.round_name}</>,
                keys: ['round_name'],
                id: 'round',
                optional: true,
              },
              {
                title: translate('Review due'),
                render: ({ row }) => (
                  <EndingField endDate={row.review_end_date} />
                ),
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
            verboseName={translate('reviews')}
            hasQuery={true}
            rowActions={ReviewsRowActions}
            filters={<ProposalReviewsFilter />}
            showPageSizeSelector={true}
            expandableRow={ReviewsExpandableRow}
            hasOptionalColumns
          />
        </>
      )}
    </div>
  );
};
