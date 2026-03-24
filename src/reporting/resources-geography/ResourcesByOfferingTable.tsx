import { FC, useCallback, useMemo } from 'react';
import { OfferingStats } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { ChartCard } from '@waldur/reporting/users/charts/ChartCard';
import Table from '@waldur/table/Table';
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

  const noop = () => {};

  return (
    <ChartCard
      title={translate('Resources by offering')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {() => (
        <Table<OfferingStats>
          columns={columns}
          rows={sortedData}
          fetch={noop}
          loading={false}
          error={null}
          activeColumns={{}}
          columnPositions={[]}
          resetSelection={noop}
          setFilterPosition={noop}
          initColumnPositions={noop}
          resetPagination={noop}
          hasPagination={false}
          verboseName={translate('offerings')}
          hideTitle
          hideRefresh
        />
      )}
    </ChartCard>
  );
};
