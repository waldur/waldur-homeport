import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { getList } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { getOptions } from './AccountingRunningField';
import { CustomerList } from './CustomerList';
import { CustomerListFilter } from './CustomerListFilter';
import { TotalCostContainer } from './TotalCostComponent';
import { makeAccountingPeriods } from './utils';

interface Invoice {
  year: number;
  month: number;
}

const getInvoices = (params) => getList<Invoice>('/invoices/', params);

async function oldestInvoice() {
  const params = {
    page_size: 1,
    o: ['year', 'month'].join(','),
    field: ['year', 'month'],
  };
  const response = await getInvoices(params);
  if (response.length === 1) {
    const invoice = response[0];
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
  return (
    <>
      <CustomerList filters={<CustomerListFilter {...data} />} />
      <TotalCostContainer />
    </>
  );
};
