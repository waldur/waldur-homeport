import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import {
  Proposal,
  ProposalResource,
  ProposalReview,
} from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

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
    fetchData: createFetcher(`proposal-proposals/${proposal.uuid}/resources`),
  });

  return (
    <Card>
      <Card.Header>
        <Card.Title>{translate('Resource requests')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Table<ProposalResource>
          {...tableProps}
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
          hasActionBar={false}
          expandableRow={ResourceRequestExpandableRow}
        />
        <FieldReviewComments
          reviews={reviews}
          fieldName="comment_resource_requests"
        />
      </Card.Body>
    </Card>
  );
};
