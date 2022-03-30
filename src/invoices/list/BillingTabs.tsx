import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { useTitle } from '@waldur/navigation/title';
import { PayPalInvoicesList } from '@waldur/paypal/PayPalInvoicesList';

import { getTabTitle } from '../utils';

import { AgreementInfo } from './AgreementInfo';
import { BillingRecordsList } from './BillingRecordsList';
import { EstimatedCost } from './EstimatedCost';
import { InvoicesList } from './InvoicesList';

export const BillingTabs: FunctionComponent = () => {
  useTitle(getTabTitle());
  return ENV.accountingMode === 'accounting' ? (
    <Card.Body>
      <AgreementInfo />
      <BillingRecordsList />
    </Card.Body>
  ) : (
    <Card.Body>
      <AgreementInfo />
      <EstimatedCost />
      {isFeatureVisible('paypal') ? <PayPalInvoicesList /> : <InvoicesList />}
    </Card.Body>
  );
};
