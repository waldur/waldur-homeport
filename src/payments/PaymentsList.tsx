import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/services';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableOptionsType } from '@waldur/table-react/types';

import { PaymentStateIndicator } from './PaymentStateIndicator';

const TableComponent = props => {
  const { translate } = props;
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('State'),
          render: ({ row }) => <PaymentStateIndicator payment={row} />,
        },
        {
          title: translate('Type'),
          render: () => 'PayPal',
        },
        {
          title: translate('Date'),
          render: ({ row }) => formatDateTime(row.created) || 'N/A',
        },
        {
          title: translate('Amount'),
          render: ({ row }) => defaultCurrency(row.amount) || 'N/A',
        },
      ]}
      verboseName={translate('payments')}
    />
  );
};

const TableOptions: TableOptionsType = {
  table: 'paypal-payments',
  fetchData: createFetcher('paypal-payments'),
  queryField: 'type',
};

export const PaymentsList = connectTable(TableOptions)(TableComponent);
