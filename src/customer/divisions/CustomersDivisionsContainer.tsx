import { FunctionComponent } from 'react';

import { CustomersDivisionsChart } from '@waldur/customer/divisions/CustomersDivisionsChart';
import { CustomersDivisionsFilter } from '@waldur/customer/divisions/CustomersDivisionsFilter';

export const CustomersDivisionsContainer: FunctionComponent = () => {
  return (
    <>
      <CustomersDivisionsFilter />
      <CustomersDivisionsChart />
    </>
  );
};
