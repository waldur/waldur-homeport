import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { useCustomerItems } from '@waldur/customer/utils';
import { isFeatureVisible } from '@waldur/features/connect';
import { useTitle } from '@waldur/navigation/title';
import { PayPalInvoicesList } from '@waldur/paypal/PayPalInvoicesList';

import { getTabTitle } from '../utils';

import { AgreementInfo } from './AgreementInfo';
import { BillingRecordsList } from './BillingRecordsList';
import { InvoicesList } from './InvoicesList';
import { OverviewLastMonths } from './OverviewLastMonths';

export const BillingTabs: FunctionComponent = () => {
  useTitle(getTabTitle());
  useCustomerItems();
  return ENV.accountingMode === 'accounting' ? (
    <Card.Body>
      <OverviewLastMonths />
      <AgreementInfo />
      <BillingRecordsList />
    </Card.Body>
  ) : (
    <Card.Body>
      <OverviewLastMonths />
      <AgreementInfo />
      {isFeatureVisible('paypal') ? <PayPalInvoicesList /> : <InvoicesList />}
    </Card.Body>
  );
};
