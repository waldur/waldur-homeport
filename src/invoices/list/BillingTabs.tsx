import { FunctionComponent } from 'react';

import { isAccountingMode } from '@/invoices/accountingMode';

import { AgreementInfo } from './AgreementInfo';
import { BillingRecordsList } from './BillingRecordsList';
import { InvoicesList } from './InvoicesList';
import { OverviewLastMonths } from './OverviewLastMonths';

export const BillingTabs: FunctionComponent = () => {
  return isAccountingMode() ? (
    <div>
      <OverviewLastMonths />
      <AgreementInfo />
      <BillingRecordsList />
    </div>
  ) : (
    <div>
      <OverviewLastMonths />
      <AgreementInfo />
      <InvoicesList />
    </div>
  );
};
