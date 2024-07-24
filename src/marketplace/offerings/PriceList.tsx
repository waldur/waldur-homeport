import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { BillingPeriod } from '../common/BillingPeriod';
import { getBillingTypeLabel } from '../resources/usage/utils';

export const PriceList: FunctionComponent = () => {
  const props = useTable({
    table: 'MarketplacePriceList',
    fetchData: createFetcher('marketplace-plan-components'),
  });

  const columns = [
    {
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
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
    />
  );
};
