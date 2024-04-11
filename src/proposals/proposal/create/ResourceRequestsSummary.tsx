import { useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ProposalResource } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { ResourceRequestExpandableRow } from './resource-requests-step/ResourceRequestExpandableRow';

export const ResourceRequestsSummary = ({ proposal }) => {
  const filter = useMemo(
    () => ({
      proposal_uuid: proposal.uuid,
    }),
    [proposal],
  );
  const tableProps = useTable({
    table: 'ProposalResourcesList',
    fetchData: createFetcher('proposal-requested-resources'),
    filter,
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
      </Card.Body>
    </Card>
  );
};
