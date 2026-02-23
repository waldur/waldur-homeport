import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { marketplacePlanComponentsList, PlanComponent } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import {
  PriceListFilter,
  selectPriceListFilter,
} from '@waldur/table/generated/PriceListFilter';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';

import { BillingPeriod } from '../common/BillingPeriod';
import { getBillingTypeLabel } from '../resources/usage/utils';

export const PriceList = () => {
  const formFilter = useSelector(selectPriceListFilter);
  const filter = useMemo(() => formFilter, [formFilter?.offering_uuid]);
  const props = useTable({
    table: 'MarketplacePriceList',
    fetchData: createFetcher(marketplacePlanComponentsList),
    filter,
  });

  const columns: Column<PlanComponent>[] = [
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
      filter: 'offering',
      inlineFilter: (row) => ({
        name: row.offering_name,
        uuid: row.offering_uuid,
      }),
      export: 'offering_name',
    },
    {
      title: translate('Plan'),
      render: ({ row }) => row.plan_name,
      export: 'plan_name',
    },
    {
      title: translate('Component'),
      render: ({ row }) => row.component_name,
      export: 'component_name',
    },
    {
      title: translate('Measured unit'),
      render: ({ row }) => row.measured_unit || 'N/A',
      export: (row) => row.measured_unit || 'N/A',
      exportKeys: ['measured_unit'],
    },
    {
      title: translate('Billing type'),
      render: ({ row }) => getBillingTypeLabel(row.billing_type),
      export: 'billing_type',
    },
    {
      title: translate('Billing period'),
      render: ({ row }) => <BillingPeriod unit={row.plan_unit} />,
      export: 'plan_unit',
    },
    {
      title: translate('Amount'),
      render: ({ row }) => row.amount,
      export: 'amount',
    },
    {
      title: translate('Price'),
      render: ({ row }) => row.price,
      export: 'price',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('components')}
      showPageSizeSelector={true}
      enableExport={true}
      filters={<PriceListFilter />}
    />
  );
};
