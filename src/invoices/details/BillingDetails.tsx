import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import * as React from 'react';
import useAsyncFn from 'react-use/lib/useAsyncFn';

import { getById } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { ENV, ngInjector } from '@waldur/core/services';
import { getUUID } from '@waldur/core/utils';
import { CustomersService } from '@waldur/customer/services/CustomersService';
import { CustomerSidebar } from '@waldur/customer/workspace/CustomerSidebar';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/marketplace/common/api';
import { Layout } from '@waldur/navigation/Layout';
import { useTitle } from '@waldur/navigation/title';
import { WOKSPACE_NAMES } from '@waldur/navigation/workspace/constants';
import { UsersService } from '@waldur/user/UsersService';

import { formatPeriod } from '../utils';

import { BillingRecordDetails } from './BillingRecordDetails';
import { DownloadInvoiceButton } from './DownloadInvoiceButton';
import { InvoiceDetails } from './InvoiceDetails';
import { PrintInvoiceButton } from './PrintInvoiceButton';

const refreshBreadcrumbs = invoice => {
  const currentStateService = ngInjector.get('currentStateService');
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');

  const customerUUID = currentStateService.getCustomerUuid();
  BreadcrumbsService.activeItem = formatPeriod(invoice);
  BreadcrumbsService.items = [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
      params: {
        uuid: customerUUID,
      },
    },
    {
      label:
        ENV.accountingMode === 'accounting'
          ? translate('Accounting records')
          : translate('Invoices list'),
      state: 'organization.billing',
      params: {
        uuid: customerUUID,
      },
    },
  ];
};

const loadData = async (invoiceId: string) => {
  const WorkspaceService = ngInjector.get('WorkspaceService');
  const currentStateService = ngInjector.get('currentStateService');

  let invoice;
  if (isFeatureVisible('paypal')) {
    invoice = await getById('/paypal-invoices/', invoiceId);
  } else {
    invoice = await getById('/invoices/', invoiceId);
  }

  const currentCustomer = await getCustomer(getUUID(invoice.customer));
  WorkspaceService.setWorkspace({
    customer: currentCustomer,
    project: null,
    hasCustomer: true,
    workspace: WOKSPACE_NAMES.organization,
  });
  const currentUser = await UsersService.getCurrentUser();
  const status = CustomersService.checkCustomerUser(
    currentCustomer,
    currentUser,
  );
  currentStateService.setOwnerOrStaff(status);
  currentStateService.setCustomer(currentCustomer);
  refreshBreadcrumbs(invoice);
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
