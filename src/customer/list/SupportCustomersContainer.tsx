import { FunctionComponent } from 'react';

import { SupportCustomerFilter } from '@waldur/customer/list/SupportCustomerFilter';
import { SupportCustomerList } from '@waldur/customer/list/SupportCustomerList';

export const SupportCustomersContainer: FunctionComponent = () => {
  return <SupportCustomerList filters={<SupportCustomerFilter />} />;
};
