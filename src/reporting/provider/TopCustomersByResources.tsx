import { FC, useMemo } from 'react';
import { ProviderCustomerTopResource } from 'waldur-js-client';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

interface TopCustomersByResourcesProps {
  customers: ProviderCustomerTopResource[];
}

export const TopCustomersByResources: FC<TopCustomersByResourcesProps> = ({
  customers,
}) => {
  const columns: Column<ProviderCustomerTopResource>[] = useMemo(
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
