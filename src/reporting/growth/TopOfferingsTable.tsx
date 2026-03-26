import { FC, useCallback, useMemo } from 'react';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { SimpleTable } from '@waldur/table/SimpleTable';
import { Column } from '@waldur/table/types';

interface TopOfferingsTableProps {
  data: any[];
}

const TOP_COUNT = 5;

export const TopOfferingsTable: FC<TopOfferingsTableProps> = ({ data }) => {
  const columns: Column[] = useMemo(
    () => [
      {
        title: translate('Offering'),
        render: ({ row }) => row.name,
      },
      {
        title: translate('Resources'),
        render: ({ row }) => row.count || 0,
        className: 'text-end',
        headerClassName: 'text-end',
      },
    ],
    [],
  );

  const rows = useMemo(() => (data || []).slice(0, TOP_COUNT), [data]);

  const getExportData = useCallback(
    () => ({
      fields: [translate('Offering'), translate('Resources')],
      data: rows.map((offering: any) => [offering.name, offering.count || 0]),
    }),
    [rows],
  );

  return (
    <ChartCard
      title={translate('Top 5 offerings')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
      showPNG={false}
    >
      {() => <SimpleTable columns={columns} rows={rows} />}
    </ChartCard>
  );
};
