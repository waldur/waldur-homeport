import { FC } from 'react';
import {
  marketplaceStatsCountActiveResourcesGroupedByOfferingList,
  OfferingStats,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

const columns: Column<OfferingStats>[] = [
  {
    title: translate('Offering'),
    render: ({ row }) => row.name,
    export: (row) => row.name,
  },
  {
    title: translate('Resources'),
    render: ({ row }) => row.count,
    export: (row) => row.count,
  },
];

export const ResourcesByOfferingTable: FC = () => {
  const tableProps = useTable({
    table: 'ResourcesByOfferingTable',
    fetchData: createFetcher(
      marketplaceStatsCountActiveResourcesGroupedByOfferingList,
    ),
  });

  return (
    <Table<OfferingStats>
      {...tableProps}
      columns={columns}
      title={translate('Resources by offering')}
      verboseName={translate('offerings')}
      showPageSizeSelector
      enableExport
      initialSorting={{ field: 'count', mode: 'desc' }}
    />
  );
};
