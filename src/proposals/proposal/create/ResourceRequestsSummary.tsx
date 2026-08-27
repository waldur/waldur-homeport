import { proposalProposalsResourcesList } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { translate } from '@/i18n';
import { usesCallVocabulary } from '@/proposals/presentation';
import { Proposal, ProposalResource, ProposalReview } from '@/proposals/types';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import '@/proposals/flushTable.scss';

import { FieldReviewComments } from '../create-review/FieldReviewComments';

import { ResourceRequestExpandableRow } from './resource-requests-step/ResourceRequestExpandableRow';

interface ResourceRequestsSummaryProps {
  proposal: Proposal;
  reviews?: ProposalReview[];
}

export const ResourceRequestsSummary = ({
  proposal,
  reviews,
}: ResourceRequestsSummaryProps) => {
  const tableProps = useTable({
    table: 'ProposalResourcesList',
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
        columns={[
          {
            title: translate('Offering'),
            render: ({ row }) => <>{row.requested_offering.offering_name}</>,
          },
          {
            title: translate('Provider'),
            render: ({ row }) => <>{row.requested_offering.provider_name}</>,
          },
          {
            title: translate('Category'),
            render: ({ row }) => (
              <>{renderFieldOrDash(row.requested_offering.category_name)}</>
            ),
          },
        ]}
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
