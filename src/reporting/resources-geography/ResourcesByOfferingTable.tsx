import { FC, useCallback, useMemo } from 'react';
import { OfferingStats } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';

interface ResourcesByOfferingTableProps {
  data: OfferingStats[];
}

const columns: Column<OfferingStats>[] = [
  {
    title: translate('Offering'),
    render: ({ row }) => <span className="fw-semibold">{row.name}</span>,
  },
  {
    title: translate('Resources'),
    render: ({ row }) => (
      <span className="fw-bold text-primary">{row.count.toLocaleString()}</span>
    ),
  },
];

export const ResourcesByOfferingTable: FC<ResourcesByOfferingTableProps> = ({
  data,
}) => {
  const sortedData = useMemo(
    () => [...(data || [])].sort((a, b) => b.count - a.count),
    [data],
  );

  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Count')],
      data: sortedData.map((item) => [item.name, item.count]),
    }),
    [sortedData],
  );

  return (
    <ChartCard
      title={translate('Resources by offering')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
      showPNG={false}
    >
      {() => <SimpleTable<OfferingStats> columns={columns} rows={sortedData} />}
    </ChartCard>
  );
};
