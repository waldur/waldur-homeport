import { CaretDownIcon, PlusCircleIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { InvitationCreateButton } from '@waldur/invitations/actions/create/InvitationCreateButton';
import { GenericInvitationContext } from '@waldur/invitations/types';

import { AddUserButton } from './AddUserButton';

interface TeamDropdownActionsProps extends GenericInvitationContext {
  refetchUsers?(): void;
  refetchInvitations?(): void;
}

export const TeamDropdownActions = ({
  refetchUsers,
  refetchInvitations,
  ...rest
}: TeamDropdownActionsProps) => {
  return (
    <Dropdown placement="bottom-end">
      <Dropdown.Toggle variant="primary" className="no-arrow btn-icon-right">
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>
        {translate('Add')}
        <span className="svg-icon svg-icon-2 rotate-180">
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <Dropdown.Menu flip>
        <InvitationCreateButton refetch={refetchInvitations} {...rest} />
        <AddUserButton refetch={refetchUsers} {...rest} />
      </Dropdown.Menu>
    </Dropdown>
  );
};
