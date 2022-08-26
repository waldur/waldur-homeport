import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { CustomerUsersList } from './CustomerUsersList';

export const CustomerUsersTab = () => {
  useTitle(translate('Users'));
  return <CustomerUsersList filters={<CustomerUsersListFilter />} />;
};
