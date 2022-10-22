import { FunctionComponent } from 'react';

import { UserFilter } from './UserFilter';
import { UserList } from './UserList';

export const UserListView: FunctionComponent = () => {
  return <UserList filters={<UserFilter />} />;
};
