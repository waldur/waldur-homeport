import { FunctionComponent } from 'react';

import { ENV } from '@/core/config';

import { AgreementInfo } from './AgreementInfo';
import { BillingRecordsList } from './BillingRecordsList';
import { InvoicesList } from './InvoicesList';
import { OverviewLastMonths } from './OverviewLastMonths';

export const BillingTabs: FunctionComponent = () => {
  return ENV.accountingMode === 'accounting' ? (
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
