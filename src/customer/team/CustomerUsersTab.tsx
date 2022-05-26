import { Card } from 'react-bootstrap';

import { CustomerUsersListFilter } from '@waldur/customer/team/CustomerUsersListFilter';
import { useTeamItems } from '@waldur/navigation/navitems';

import { CustomerUsersList } from './CustomerUsersList';

export const CustomerUsersTab = () => {
  useTeamItems();
  return (
    <Card.Body>
      <CustomerUsersListFilter />
      <CustomerUsersList />
    </Card.Body>
  );
};
