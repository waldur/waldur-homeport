import { FC, useMemo } from 'react';
import { OfferingCost } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
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
    export: 'offering_name',
    exportTitle: translate('Offering'),
  },
  {
    title: translate('Cost'),
    render: ({ row }) => (
      <span className="fw-bold text-primary">{defaultCurrency(row.cost)}</span>
    ),
    export: (row) => defaultCurrency(row.cost),
    exportTitle: translate('Cost'),
  },
];

export const OfferingCostsTable: FC<OfferingCostsTableProps> = ({ data }) => {
  const sortedData = useMemo(
    () => [...data].sort((a, b) => b.cost - a.cost),
    [data],
  );

  return (
    <SimpleTable<OfferingCost>
      columns={columns}
      rows={sortedData}
      title={translate('Offering costs')}
    />
  );
};
