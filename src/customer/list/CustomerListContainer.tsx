import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';
import { invoicesList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { getOptions } from './AccountingRunningField';
import { CustomerList } from './CustomerList';
import { makeAccountingPeriods } from './utils';

async function oldestInvoice() {
  const response = await invoicesList({
    query: {
      page_size: 1,
      o: ['year', 'month'],
      field: ['year', 'month'],
    },
  });
  if (response.data.length === 1) {
    const invoice = response.data[0];
    return DateTime.fromObject({
      year: invoice.year,
      month: invoice.month,
    });
  } else {
    return DateTime.now().startOf('month');
  }
}

async function loadData() {
  const start = await oldestInvoice();
  const accountingPeriods = makeAccountingPeriods(start);
  const initialValues = {
    accounting_period: accountingPeriods[0],
    accounting_is_running: getOptions()[0],
  };
  return { initialValues, accountingPeriods };
}

export const CustomerListContainer: FunctionComponent = () => {
  const { loading, error, value: data } = useAsync(loadData);
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load financial overview.')}</>;
  }
  return <CustomerList {...data} />;
};
