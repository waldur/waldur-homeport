import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { formatPeriod } from '../utils';

import { InvoicesFilter } from './InvoicesFilter';
import { SendNotificationButton } from './SendNotificationButton';

const RecordPeriodField = ({ row }) => formatPeriod(row);

export const BillingRecordsList: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const stateFilter: any = useSelector(getFormValues('InvoicesFilter'));
  const filter = useMemo(
    () => ({
      ...stateFilter,
      customer: customer.url,
      state: stateFilter?.state?.map((option) => option.value),
      field: [
        'uuid',
        'state',
        'month',
        'year',
        'invoice_date',
        'number',
        'price',
      ],
    }),
    [stateFilter, customer],
  );

  const table = useMemo(() => `invoices-${customer.uuid}`, [customer]);

  const props = useTable({
    table: table,
    fetchData: createFetcher('invoices'),
    filter,
    exportRow,
    exportFields,
    queryField: 'number',
  });

  return (
    <Table
      {...props}
      filters={<InvoicesFilter />}
      columns={[
        {
          title: translate('Record number'),
          render: ({ row }) => (
            <Link
              state="billingDetails"
              params={{ uuid: customer.uuid, invoice_uuid: row.uuid }}
            >
              {row.number}
            </Link>
          ),
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
        },
        {
          title: translate('Record period'),
          render: RecordPeriodField,
        },
        {
          title: (
            <>
              <PriceTooltip /> {translate('Total')}
            </>
          ),
          render: ({ row }) => defaultCurrency(row.price),
        },
      ]}
      hoverableRow={SendNotificationButton}
      verboseName={translate('records')}
      title={translate('Accounting')}
      enableExport={true}
    />
  );
};

const exportRow = (row) => [
  row.number,
  row.state,
  formatPeriod(row),
  defaultCurrency(row.price),
];

const exportFields = ['Record number', 'State', 'Record period', 'Total'];
