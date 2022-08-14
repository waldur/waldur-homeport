import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { useEffect, FunctionComponent, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncFn } from 'react-use';

import { ENV } from '@waldur/configs/default';
import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { LayoutContext } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { showError, showSuccess } from '@waldur/store/notify';

import { Invoice } from '../types';

import { BillingRecordDetails } from './BillingRecordDetails';
import { InvoiceDetailActions } from './InvoiceDetailActions';
import { InvoiceDetails } from './InvoiceDetails';

import './BillingDetails.scss';

const loadData = (invoiceId: string) => {
  if (isFeatureVisible('paypal')) {
    return getById<Invoice>('/paypal-invoices/', invoiceId);
  } else {
    return getById<Invoice>('/invoices/', invoiceId);
  }
};

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
    () => loadData(invoiceId),
    [invoiceId],
  );

  useEffect(() => {
    if (!invoiceId) {
      router.stateService.go('errorPage.notFound');
    } else {
      callback();
    }
  }, [invoiceId, router.stateService, callback]);

  useEffect(() => {
    if ((error as any)?.status === 404) {
      router.stateService.go('errorPage.notFound');
    }
  }, [error, router.stateService]);

  const layoutContext = useContext(LayoutContext);
  useEffect(() => {
    layoutContext.setActions(<InvoiceDetailActions invoice={invoice} />);
    return () => {
      layoutContext.setActions(null);
    };
  }, [invoice, layoutContext]);

  const dispatch = useDispatch();
  useEffect(() => {
    if (status === 'succeeded') {
      dispatch(showSuccess(translate('Payment succeeded.')));
    } else if (status === 'failed') {
      dispatch(showError(translate('Payment failed.')));
    } else if (status === 'skipped') {
      dispatch(showSuccess(translate('Payment has already been done.')));
    }
  }, [status, dispatch]);

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
