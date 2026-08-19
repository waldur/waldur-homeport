import { useQuery } from '@tanstack/react-query';
import { useCurrentStateAndParams } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { invoicesRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { goToNotFound } from '@/error/utils';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { useNotify } from '@/store/notify';

import { BillingRecordDetails } from './BillingRecordDetails';
import { InvoiceDetails } from './InvoiceDetails';

import './BillingDetails.scss';

export const BillingDetails: FunctionComponent = () => {
  useTitle(
    ENV.accountingMode === 'accounting'
      ? translate('Accounting record')
      : translate('Invoice'),
  );

  const {
    params: { invoice_uuid: invoiceId, status },
  } = useCurrentStateAndParams();

  const {
    isLoading: loading,
    error,
    data: invoice,
    refetch: callback,
  } = useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: () =>
      invoicesRetrieve({ path: { uuid: invoiceId } }).then(
        (response) => response.data,
      ),
    enabled: !!invoiceId,
  });

  useEffect(() => {
    if (!invoiceId) {
      goToNotFound();
    }
  }, [invoiceId]);

  useEffect(() => {
    if ((error as any)?.status === 404) {
      goToNotFound();
    }
  }, [error]);

  const { showError, showSuccess } = useNotify();
  useEffect(() => {
    if (status === 'succeeded') {
      showSuccess(translate('Payment succeeded.'));
    } else if (status === 'failed') {
      showError(translate('Payment failed.'));
    } else if (status === 'skipped') {
      showSuccess(translate('Payment has already been done.'));
    }
  }, [status]);

  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data.')}</>
  ) : !invoice ? null : ENV.accountingMode === 'accounting' ? (
    <BillingRecordDetails invoice={invoice} refreshInvoiceItems={callback} />
  ) : (
    <InvoiceDetails invoice={invoice} refreshInvoiceItems={callback} />
  );
};
