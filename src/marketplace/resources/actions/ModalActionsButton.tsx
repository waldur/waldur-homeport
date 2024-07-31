import { Dropdown } from 'react-bootstrap';

import { TableDropdownToggle } from '@waldur/table/ActionsDropdown';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <Dropdown>
    <TableDropdownToggle labeled={props.labeled} />
    <Dropdown.Menu>
      <ActionsPopover {...props} />
    </Dropdown.Menu>
  </Dropdown>
);
