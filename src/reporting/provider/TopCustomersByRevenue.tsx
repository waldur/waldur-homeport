import { FC, useMemo } from 'react';
import { ProviderCustomerTopRevenue } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

interface TopCustomersByRevenueProps {
  customers: ProviderCustomerTopRevenue[];
}

export const TopCustomersByRevenue: FC<TopCustomersByRevenueProps> = ({
  customers,
}) => {
  const columns: Column<ProviderCustomerTopRevenue>[] = useMemo(
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
