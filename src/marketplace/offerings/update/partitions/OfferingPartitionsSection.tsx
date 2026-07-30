import { FC, useState } from 'react';
import { NestedPartition, Offering } from 'waldur-js-client';

import { translate } from '@/i18n';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createClientPaginatedFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { OfferingSectionProps } from '../types';

import { AddOfferingPartitionButton } from './AddOfferingPartitionButton';
import { DeleteOfferingPartition } from './DeleteOfferingPartition';
import { EditOfferingPartitionButton } from './EditOfferingPartitionButton';
import { ManagePartitionQoSButton } from './ManagePartitionQoSButton';
import { OfferingPartitionExpandableRow } from './OfferingPartitionExpandableRow';

const RowActions = ({ row, refetch, offering }) => {
  return (
    <ActionsDropdown
      row={row}
      refetch={refetch}
      data={{ offering }}
      actions={[
        EditOfferingPartitionButton,
        ManagePartitionQoSButton,
        DeleteOfferingPartition,
      ]}
    />
  );
};

export const OfferingPartitionsSection: FC<OfferingSectionProps> = (props) => {
  const [firstFetch, setFirstFetch] = useState(true);

  const tableProps = useTable({
    table: 'OfferingPartitions',
    fetchData: async (request) => {
      let freshData;
      if (!firstFetch) {
        const res = await props.refetch();
        freshData = (res.data?.offering as Offering)?.partitions;
      } else {
        setFirstFetch(false);
      }

      return createClientPaginatedFetcher(
        freshData || props.offering.partitions || [],
      )(request);
    },
  });

  return (
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
      tableActions={
        <AddOfferingPartitionButton
          offering={props.offering}
          refetch={tableProps.fetch}
        />
      }
      rowActions={({ row, fetch }) => (
        <RowActions
          row={row}
          refetch={fetch || props.refetch}
          offering={props.offering}
        />
      )}
      expandableRow={OfferingPartitionExpandableRow}
    />
  );
};
