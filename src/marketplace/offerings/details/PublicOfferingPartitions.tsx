import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { NestedPartition, Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingPartitionExpandableRow } from '../update/partitions/OfferingPartitionExpandableRow';

interface PublicOfferingPartitionsProps {
  offering: Offering;
}

export const PublicOfferingPartitions: FunctionComponent<
  PublicOfferingPartitionsProps
> = ({ offering }) => {
  const tableProps = useTable({
    table: 'PublicOfferingPartitions',
    fetchData: createClientPaginatedFetcher(offering?.partitions || []),
  });

  return (
    <Row className="mb-10" id="partitions">
      <Col sm={12} md>
        <Table<NestedPartition>
          {...tableProps}
          columns={[
            {
              title: translate('Name'),
              render: ({ row }) => renderFieldOrDash(row.partition_name),
            },
            {
              title: translate('CPU architecture'),
              render: ({ row }) => renderFieldOrDash(row.cpu_arch),
              optional: true,
            },
            {
              title: translate('GPU architecture'),
              render: ({ row }) => renderFieldOrDash(row.gpu_arch),
              optional: true,
            },
            {
              title: translate('Default time limit'),
              render: ({ row }) =>
                row.default_time
                  ? translate('{count} minutes', { count: row.default_time })
                  : 'N/A',
            },
            {
              title: translate('Max time limit'),
              render: ({ row }) =>
                row.max_time
                  ? translate('{count} minutes', { count: row.max_time })
                  : 'N/A',
            },
          ]}
          verboseName={translate('Slurm partitions')}
          title={translate('Slurm partitions')}
          hasQuery={false}
          enableExport={false}
          expandableRow={OfferingPartitionExpandableRow}
        />
      </Col>
    </Row>
  );
};
