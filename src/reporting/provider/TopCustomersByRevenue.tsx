import { FC, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { ExportData } from '@waldur/table/exporters/types';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';

import { TopCustomer } from './types';

interface TopCustomersByRevenueProps {
  customers: TopCustomer[];
}

export const TopCustomersByRevenue: FC<TopCustomersByRevenueProps> = ({
  customers,
}) => {
  const columns: Column<TopCustomer>[] = useMemo(
    () => [
      {
        title: translate('Customer'),
        render: ({ row }) => <span>{row.customer_name}</span>,
      },
      {
        title: translate('Revenue'),
        render: ({ row }) => defaultCurrency(row.revenue || 0),
      },
    ],
    [],
  );

  const getExportData = useMemo(
    () => (): ExportData => ({
      fields: [translate('Customer'), translate('Revenue')],
      data: (customers || []).map((c) => [c.customer_name, c.revenue || 0]),
    }),
    [customers],
  );

  return (
    <ChartCard
      title={translate('Top customers by revenue')}
      getExportData={getExportData}
      isEmpty={!customers || customers.length === 0}
      showPNG={false}
    >
      {() => <SimpleTable columns={columns} rows={customers} />}
    </ChartCard>
  );
};
