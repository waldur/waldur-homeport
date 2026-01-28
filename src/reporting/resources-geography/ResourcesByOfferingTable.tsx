import { FC, useMemo } from 'react';
import { OfferingStats } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
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
    () => [...data].sort((a, b) => b.count - a.count),
    [data],
  );

  const noop = () => {};

  return (
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
      title={translate('Resources by offering')}
      verboseName={translate('offerings')}
    />
  );
};
