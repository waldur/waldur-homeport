import { useMemo } from 'react';
import { proposalProposalsResourcesList } from 'waldur-js-client';

import { AccordionCard } from 'waldur-ui';

import { translate } from '@/i18n';
import { AwardComparisonRow } from '@/proposals/awardedResources';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal, ProposalResource, ProposalReview } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import '@/proposals/flushTable.scss';

import { AwardChangeBadge } from '../AwardComparison';
import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { resourceRequestColumns } from './resource-requests-step/resourceRequestColumns';
import { ResourceRequestExpandableRow } from './resource-requests-step/ResourceRequestExpandableRow';

// The same columns the applicant filled the table under, so a reviewer or
// manager weighs the same figures. Provider and category stay in the expanded
// row.
const columns = resourceRequestColumns();

// Offering, recurring, subscription, period, purchase order. Without widths
// every column keeps a 150px floor (200px for the first), which pushed this
// table past the card beside the progress rail; here the cells wrap instead,
// inside widths that add up to the card. The applicant's own table sits in a
// full-width form and keeps the defaults.
const SUMMARY_COLUMN_WIDTHS = ['28%', '18%', '18%', '14%', '22%'];

const fitSummaryColumns = (
  summaryColumns: Column<ProposalResource>[],
): Column<ProposalResource>[] =>
  summaryColumns.map((column, index) => ({
    ...column,
    width: SUMMARY_COLUMN_WIDTHS[index] ?? column.width,
    ellipsis: false,
  }));

/**
 * The offering column, with what became of the request in the award beneath
 * the name for a viewer who may read it. Beneath rather than in a column of
 * its own: the progress rail leaves this table no room for another.
 */
const offeringWithAwardColumn = (
  awardRows: AwardComparisonRow[],
): Column<ProposalResource> => ({
  title: translate('Offering'),
  render: ({ row }) => {
    const match = awardRows.find((award) => award.requested?.uuid === row.uuid);
    return (
      <div className="d-flex flex-column gap-1 align-items-start">
        <span>{row.requested_offering.offering_name}</span>
        {match && <AwardChangeBadge change={match.change} />}
        {match?.change === 'moved' && (
          <span className="text-muted fs-7">
            {translate('To {offering}', {
              offering: match.awarded.requested_offering.offering_name,
            })}
          </span>
        )}
      </div>
    );
  },
});

interface ResourceRequestsSummaryProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
  /** The award set against the request; absent when the viewer cannot read it. */
  awardRows?: AwardComparisonRow[];
}

export const ResourceRequestsSummary = ({
  proposal,
  reviews,
  awardRows,
}: ResourceRequestsSummaryProps) => {
  const tableColumns = useMemo(
    () =>
      fitSummaryColumns(
        awardRows
          ? [offeringWithAwardColumn(awardRows), ...columns.slice(1)]
          : columns,
      ),
    [awardRows],
  );
  const tableProps = useTable({
    // Its own key: the applicant's editable table keeps separate state.
    table: 'ProposalResourcesSummary',
    fetchData: createFetcher(proposalProposalsResourcesList, {
      path: { uuid: proposal.uuid },
    }),
  });

  // What the card holds, without opening it. Named while there are few
  // enough to read at a glance — the offering is the thing actually chosen —
  // and counted once a list would crowd the header.
  const rows = tableProps.rows ?? [];
  const count = tableProps.pagination?.resultCount ?? rows.length;
  const chosen =
    count === 0
      ? undefined
      : count <= 2 && rows.length === count
        ? rows
            .map((row) => row.requested_offering.offering_name)
            .filter(Boolean)
            .join(', ')
        : count === 1
          ? translate('{count} offering', { count })
          : translate('{count} offerings', { count });

  return (
    <AccordionCard
      id="step-resource-requests"
      title={translate('Resource requests')}
      actions={
        chosen ? (
          <span className="text-muted fw-semibold fs-7">{chosen}</span>
        ) : undefined
      }
      subtitle={
        usesCallVocabulary()
          ? translate('Resources requested for this proposal.')
          : translate('Resources requested for this access request.')
      }
      defaultOpen={false}
    >
      <Table<ProposalResource>
        {...tableProps}
        className="proposal-flush-table"
        cardBordered={false}
        title={null}
        hasActionBar={false}
        columns={tableColumns}
        hideRefresh
        expandableRow={ResourceRequestExpandableRow}
        minHeight="auto"
        footer={
          <FieldReviewComments
            reviews={reviews}
            fieldName="comment_resource_requests"
            space={0}
            className="mt-5"
          />
        }
      />
    </AccordionCard>
  );
};
