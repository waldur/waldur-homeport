import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';

import { CustomerUsersList } from './CustomerUsersList';

export const CustomerUsersTab = () => {
  return <CustomerUsersList filters={<CustomerUsersListFilter />} />;
};
