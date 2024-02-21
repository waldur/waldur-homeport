import { UserDetailsButton } from '@waldur/user/UserDetailsButton';

import { EditUserButton } from './EditUserButton';
import { UserRemoveButton } from './UserRemoveButton';

export const ProjectPermisionActions = ({ row, fetch }) => (
  <>
    <UserDetailsButton userId={row.user_uuid} />
    <EditUserButton permission={row} refetch={fetch} />
    <UserRemoveButton permission={row} refetch={fetch} />
  </>
);
