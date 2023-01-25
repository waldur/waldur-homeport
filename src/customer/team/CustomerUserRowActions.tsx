import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import {
  getUser,
  isOwnerOrStaff as isOwnerOrStaffSelector,
} from '@waldur/workspace/selectors';

import { UserDetailsButton } from './UserDetailsButton';
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
          <UserDetailsButton user={row} />
        ) : null}
        {isOwnerOrStaff ? <UserEditButton editUser={row} /> : null}
        {isOwnerOrStaff ? (
          <UserRemoveButton user={row} refetch={refetch} />
        ) : null}
      </ButtonGroup>
    ) : null;
  };
