import * as React from 'react';
import PanelBody from 'react-bootstrap/lib/PanelBody';
import useEffectOnce from 'react-use/lib/useEffectOnce';

import { ngInjector, ENV } from '@waldur/core/services';
import { isFeatureVisible } from '@waldur/features/connect';
import { useTitle } from '@waldur/navigation/title';
import { PayPalInvoicesList } from '@waldur/paypal/PayPalInvoicesList';

import { getTabTitle } from '../utils';

import { AgreementInfo } from './AgreementInfo';
import { BillingRecordsList } from './BillingRecordsList';
import { EstimatedCost } from './EstimatedCost';
import { InvoicesList } from './InvoicesList';

const updateBreadcrumbs = () => {
  if (!ngInjector) {
    return;
  }
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  BreadcrumbsService.activeItem = getTabTitle();
};

export const BillingTabs = () => {
  useTitle(getTabTitle());
  useEffectOnce(updateBreadcrumbs);
  return ENV.accountingMode === 'accounting' ? (
    <PanelBody>
      <AgreementInfo />
      <BillingRecordsList />
    </PanelBody>
  ) : (
    <PanelBody>
      <AgreementInfo />
      <EstimatedCost />
      {isFeatureVisible('paypal') ? <PayPalInvoicesList /> : <InvoicesList />}
    </PanelBody>
  );
};
