import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { FunctionComponent, useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import { invoicesRetrieve } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { LoadingSpinner } from '@/core/LoadingSpinner';
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

  const router = useRouter();
  const {
    params: { invoice_uuid: invoiceId, status },
  } = useCurrentStateAndParams();

  const [{ loading, error, value: invoice }, callback] = useAsyncFn(
    () =>
      invoicesRetrieve({ path: { uuid: invoiceId } }).then(
        (response) => response.data,
      ),
    [invoiceId],
  );

  useEffect(() => {
    if (!invoiceId) {
      router.stateService.go('errorPage.notFound');
    } else {
      callback();
    }
  }, [invoiceId, callback]);

  useEffect(() => {
    if ((error as any)?.status === 404) {
      router.stateService.go('errorPage.notFound');
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
