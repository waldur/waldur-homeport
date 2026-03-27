import { FC } from 'react';

import { CustomerListContainer } from '@waldur/customer/list/CustomerListContainer';

import { ReportingTitle } from '../ReportingTitle';

export const MonthlyRevenuePage: FC = () => {
  return (
    <>
      <ReportingTitle reportKey="monthly-revenue" />
      <CustomerListContainer />
    </>
  );
};
