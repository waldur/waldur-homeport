import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { UserDetailsButton } from '@waldur/user/UserDetailsButton';
import {
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { UserEditButton } from './UserEditButton';
import { UserRemoveButton } from './UserRemoveButton';

interface CustomerUserRowActionsProps {
  refetch;
  row;
}

export const CustomerUserRowActions: FunctionComponent<CustomerUserRowActionsProps> =
  ({ row, refetch }) => {
    const user = useSelector(getUser);
    const isOwnerOrStaff = useSelector(isOwnerOrStaffSelector);
    return isOwnerOrStaff || user.is_support ? (
      <ButtonGroup>
        {isOwnerOrStaff || user.is_support ? (
          <UserDetailsButton userId={row.uuid} />
        ) : null}
        {isOwnerOrStaff ? <UserEditButton editUser={row} /> : null}
        {isOwnerOrStaff ? (
          <UserRemoveButton user={row} refetch={refetch} />
        ) : null}
      </ButtonGroup>
    ) : null;
  };
