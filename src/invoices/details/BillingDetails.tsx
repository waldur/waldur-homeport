import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import { useSelector } from 'react-redux';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV } from '@waldur/core/services';
import { getUUID } from '@waldur/core/utils';
import { CustomerSidebar } from '@waldur/customer/workspace/CustomerSidebar';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/marketplace/common/api';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { Layout } from '@waldur/navigation/Layout';
import { useTitle } from '@waldur/navigation/title';
import store from '@waldur/store/store';
import {
  setCurrentCustomer,
  setCurrentWorkspace,
} from '@waldur/workspace/actions';
import { getCustomer as getCustomerSelector } from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

import { formatPeriod } from '../utils';

import { BillingRecordDetails } from './BillingRecordDetails';
import { DownloadInvoiceButton } from './DownloadInvoiceButton';
import { InvoiceDetails } from './InvoiceDetails';
import { PrintInvoiceButton } from './PrintInvoiceButton';

const getBreadcrumbs = (customer, invoice): BreadcrumbItem[] => {
  return [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
      params: {
        uuid: customer.uuid,
      },
    },
    {
      label:
        ENV.accountingMode === 'accounting'
          ? translate('Accounting records')
          : translate('Invoices list'),
      state: 'organization.billing',
      params: {
        uuid: customer.uuid,
      },
    },
    {
      label: formatPeriod(invoice),
    },
  ];
};

const loadData = async (invoiceId: string) => {
  let invoice;
  if (isFeatureVisible('paypal')) {
    invoice = await getById('/paypal-invoices/', invoiceId);
  } else {
    invoice = await getById('/invoices/', invoiceId);
  }

  const currentCustomer = await getCustomer(getUUID(invoice.customer));
  store.dispatch(setCurrentWorkspace(ORGANIZATION_WORKSPACE));
  store.dispatch(setCurrentCustomer(currentCustomer));
  return invoice;
};

export const BillingDetails = () => {
  useTitle(
    ENV.accountingMode === 'accounting'
      ? translate('Accounting record')
      : translate('Invoice'),
  );

  const router = useRouter();
  const {
    params: { uuid: invoiceId },
  } = useCurrentStateAndParams();

  const [{ loading, error, value: invoice }, callback] = useAsyncFn(
    () => loadData(invoiceId),
    [invoiceId],
  );

  React.useEffect(() => {
    if (!invoiceId) {
      router.stateService.go('errorPage.notFound');
    } else {
      callback();
    }
  }, [invoiceId, router.stateService, callback]);

  React.useEffect(() => {
    if ((error as any)?.status === 404) {
      router.stateService.go('errorPage.notFound');
    }
  }, [error, router.stateService]);

  const customer = useSelector(getCustomerSelector);
  useBreadcrumbsFn(
    () => (customer && invoice ? getBreadcrumbs(customer, invoice) : []),
    [customer, invoice],
  );

  return (
    <Layout
      sidebar={<CustomerSidebar />}
      actions={
        invoice?.pdf ? (
          <DownloadInvoiceButton invoice={invoice} />
        ) : (
          <PrintInvoiceButton />
        )
      }
      sidebarClass="hidden-print"
    >
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>{translate('Unable to load data.')}</>
      ) : !invoice ? null : ENV.accountingMode === 'accounting' ? (
        <BillingRecordDetails invoice={invoice} />
      ) : (
        <InvoiceDetails invoice={invoice} />
      )}
    </Layout>
  );
};
