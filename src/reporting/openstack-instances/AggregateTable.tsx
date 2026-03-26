import { FC, useCallback } from 'react';
import { OpenStackInstanceAggregate } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';
import { renderFieldOrDash } from '@waldur/table/utils';

interface AggregateTableProps {
  data: OpenStackInstanceAggregate[];
}

const columns: Column<OpenStackInstanceAggregate>[] = [
  {
    title: translate('Group'),
    render: ({ row }) => renderFieldOrDash(row.group_label || row.group_key),
  },
  {
    title: translate('Instances'),
    render: ({ row }) => row.instance_count,
  },
  {
    title: translate('Total cores'),
    render: ({ row }) => row.total_cores,
  },
  {
    title: translate('Total RAM'),
    render: ({ row }) => formatFilesize(row.total_ram_mb),
  },
  {
    title: translate('Total disk'),
    render: ({ row }) => formatFilesize(row.total_disk_mb),
  },
  {
    title: translate('Total volume size'),
    render: ({ row }) => formatFilesize(row.total_volume_size_mb),
  },
  {
    title: translate('Floating IPs'),
    render: ({ row }) => row.total_floating_ips,
  },
];

export const AggregateTable: FC<AggregateTableProps> = ({ data }) => {
  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Group'),
        translate('Instances'),
        translate('Total cores'),
        translate('Total RAM'),
        translate('Total disk'),
        translate('Total volume size'),
        translate('Floating IPs'),
      ],
      data: (data || []).map((row) => [
        renderFieldOrDash(row.group_label || row.group_key),
        row.instance_count,
        row.total_cores,
        formatFilesize(row.total_ram_mb),
        formatFilesize(row.total_disk_mb),
        formatFilesize(row.total_volume_size_mb),
        row.total_floating_ips,
      ]),
    }),
    [data],
  );

  return (
    <ChartCard
      title={translate('Details')}
      getExportData={getExportData}
      showPNG={false}
    >
      {() => <SimpleTable columns={columns} rows={data} rowKey="group_key" />}
    </ChartCard>
  );
};
