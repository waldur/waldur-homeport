import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { invoicesList } from 'waldur-js-client';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { makeAccountingPeriods } from '@/customer/list/utils';
import { translate } from '@/i18n';

import { SupportInvoiceItemsList } from './SupportInvoiceItemsList';

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
  };
  return { initialValues, accountingPeriods };
}

export const SupportInvoiceItemsContainer: FunctionComponent = () => {
  const {
    isLoading: loading,
    error,
    data,
  } = useQuery({
    queryKey: ['SupportInvoiceItemsContainer'],
    queryFn: loadData,
  });
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load invoice items.')}</>;
  }
  return <SupportInvoiceItemsList {...data} />;
};
