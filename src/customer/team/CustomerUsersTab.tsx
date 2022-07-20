import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { useCustomerItems } from '@waldur/customer/utils';

import { CustomerUsersList } from './CustomerUsersList';

export const CustomerUsersTab = () => {
  useCustomerItems();
  return <CustomerUsersList filters={<CustomerUsersListFilter />} />;
};
