import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

export const UserListView: FunctionComponent = () => {
  useTitle(translate('Users'));
  return (
    <Card>
      <Card.Body>
        <UserList filters={<UserFilter />} />
      </Card.Body>
    </Card>
  );
};
