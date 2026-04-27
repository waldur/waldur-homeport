import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { translate } from '@/i18n';
import { SimpleTable } from '@/table/SimpleTable';
import { Column } from '@/table/types';

interface TopProvidersTableProps {
  data: any[];
}

const TOP_COUNT = 5;

export const TopProvidersTable: FC<TopProvidersTableProps> = ({ data }) => {
  const columns: Column[] = useMemo(
    () => [
      {
        title: translate('Service provider'),
        render: ({ row }) => row.customer_name,
      },
      {
        title: translate('Resources'),
        render: ({ row }) => row.resources_count || 0,
        className: 'text-end',
        headerClassName: 'text-end',
      },
      {
        title: translate('Projects'),
        render: ({ row }) => row.projects_count || 0,
        className: 'text-end',
        headerClassName: 'text-end',
      },
    ],
    [],
  );

  const rows = useMemo(() => (data || []).slice(0, TOP_COUNT), [data]);

  const getExportData = useCallback(
    () => ({
      fields: [
        translate('Service provider'),
        translate('Resources'),
        translate('Projects'),
      ],
      data: rows.map((sp: any) => [
        sp.customer_name,
        sp.resources_count || 0,
        sp.projects_count || 0,
      ]),
    }),
    [rows],
  );

  return (
    <ChartCard
      title={translate('Top 5 service providers')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
      showPNG={false}
    >
      {() => <SimpleTable columns={columns} rows={rows} />}
    </ChartCard>
  );
};
