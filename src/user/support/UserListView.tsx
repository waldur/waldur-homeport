import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { useTitle } from '@waldur/navigation/title';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

export const UserListView: FunctionComponent = () => {
  useTitle(translate('Users'));
  return <UserList filters={<UserFilter />} />;
};
