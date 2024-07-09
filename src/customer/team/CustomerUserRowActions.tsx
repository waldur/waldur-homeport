import { FunctionComponent } from 'react';

import { UserDetailsButton } from '@waldur/user/UserDetailsButton';

import { UserEditButton } from './UserEditButton';
import { UserRemoveButton } from './UserRemoveButton';

interface CustomerUserRowActionsProps {
  refetch;
  row;
}

export const CustomerUserRowActions: FunctionComponent<
  CustomerUserRowActionsProps
> = ({ row, refetch }) => (
  <>
    <UserDetailsButton userId={row.uuid} />
    <UserEditButton customer={row} refetch={refetch} />
    <UserRemoveButton customer={row} refetch={refetch} />
  </>
);
