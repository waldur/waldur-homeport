import { proposalProposalsResourcesList } from 'waldur-js-client';

import { AccordionCard } from '@/core/AccordionCard';
import { translate } from '@/i18n';
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

  return (
    <AccordionCard
      id="step-resource-requests"
      title={translate('Resource requests')}
      subtitle={translate('Resources requested for this proposal.')}
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
