import { Dropdown, DropdownButton } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { UserActivateButton } from './UserActivateButton';
import { UserDetailsButton } from './UserDetailsButton';

const UserActionsDropdown = (props) => {
  return (
    <DropdownButton title={translate('Actions')} className="me-3">
      <Dropdown.Item>
        <UserDetailsButton row={props.row} />
      </Dropdown.Item>
      <Dropdown.Item>
        <UserActivateButton row={props.row} />
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default UserActionsDropdown;
