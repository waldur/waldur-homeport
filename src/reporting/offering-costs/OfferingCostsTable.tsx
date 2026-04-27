import { FC } from 'react';
import { OfferingCost } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';

import { offeringCostsFetcher } from './api';

export const OfferingCostsTable: FC = () => {
  const tableProps = useTable({
    table: 'offeringCosts',
    fetchData: offeringCostsFetcher,
  });

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
        <span className="fw-bold">{defaultCurrency(row.cost)}</span>
      ),
      export: (row) => defaultCurrency(row.cost),
      exportTitle: translate('Cost'),
    },
  ];

  return (
    <Table<OfferingCost>
      {...tableProps}
      title={translate('Offering costs')}
      columns={columns}
      showPageSizeSelector
      enableExport
    />
  );
};
