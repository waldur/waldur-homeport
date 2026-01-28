import { FC, useMemo } from 'react';
import { OfferingCost } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';

interface OfferingCostsTableProps {
  data: OfferingCost[];
}

const columns: Column<OfferingCost>[] = [
  {
    title: translate('Offering'),
    render: ({ row }) => (
      <span className="fw-semibold">{row.offering_name}</span>
    ),
  },
  {
    title: translate('Cost'),
    render: ({ row }) => (
      <span className="fw-bold text-primary">{defaultCurrency(row.cost)}</span>
    ),
  },
];

export const OfferingCostsTable: FC<OfferingCostsTableProps> = ({ data }) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.cost - a.cost),
    [data],
  );

  const noop = () => {};

  return (
    <Table<OfferingCost>
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
      title={translate('Offering costs')}
      verboseName={translate('offerings')}
    />
  );
};
