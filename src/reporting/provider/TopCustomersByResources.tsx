import { FC, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

import { TopCustomer } from './types';

interface TopCustomersByResourcesProps {
  customers: TopCustomer[];
}

export const TopCustomersByResources: FC<TopCustomersByResourcesProps> = ({
  customers,
}) => {
  const columns: Column<TopCustomer>[] = useMemo(
    () => [
      {
        title: translate('Customer'),
        render: ({ row }) => row.customer_name,
      },
      {
        title: translate('Resources'),
        render: ({ row }) => row.resource_count,
      },
    ],
    [],
  );

  const getExportData = useMemo(
    () => (): ExportData => ({
      fields: [translate('Customer'), translate('Resources')],
      data: (customers || []).map((c) => [
        c.customer_name,
        c.resource_count || 0,
      ]),
    }),
    [customers],
  );

  return (
    <ChartCard
      title={translate('Top customers by resources')}
      getExportData={getExportData}
      isEmpty={!customers || customers.length === 0}
      showPNG={false}
    >
      {() => <SimpleTable columns={columns} rows={customers} />}
    </ChartCard>
  );
};
