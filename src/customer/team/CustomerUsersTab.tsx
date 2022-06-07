import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { useTeamItems } from '@waldur/navigation/navitems';

import { CustomerUsersList } from './CustomerUsersList';

export const CustomerUsersTab = () => {
  useTeamItems();
  return <CustomerUsersList filters={<CustomerUsersListFilter />} />;
};
