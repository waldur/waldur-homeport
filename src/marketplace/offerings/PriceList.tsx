import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableOptionsType } from '@waldur/table/types';

import { BillingPeriod } from '../common/BillingPeriod';
import { getBillingTypeLabel } from '../resources/usage/utils';

export const TableComponent: FunctionComponent<any> = (props) => {
  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => row.plan_name,
    },
    {
      title: translate('Component'),
      render: ({ row }) => row.component_name,
    },
    {
      title: translate('Measured unit'),
      render: ({ row }) => row.measured_unit || 'N/A',
    },
    {
      title: translate('Billing type'),
      render: ({ row }) => getBillingTypeLabel(row.billing_type),
    },
    {
      title: translate('Billing period'),
      render: ({ row }) => <BillingPeriod unit={row.plan_unit} />,
    },
    {
      title: translate('Amount'),
      render: ({ row }) => row.amount,
    },
    {
      title: translate('Price'),
      render: ({ row }) => row.price,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('components')}
      showPageSizeSelector={true}
    />
  );
};

export const TableOptions: TableOptionsType = {
  table: 'MarketplacePriceList',
  fetchData: createFetcher('marketplace-plan-components'),
  exportFields: (row) => [
    row.offering_name,
    row.plan_name,
    row.component_name,
    row.measured_unit || 'N/A',
    row.billing_type,
    row.plan_unit,
    row.amount,
    row.price,
  ],
};

export const PriceList = connectTable(TableOptions)(TableComponent);
