import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { ActionsPopover } from './ActionsPopover';

export const ModalActionsButton = (props) => (
  <Dropdown>
    <Dropdown.Toggle
      variant="outline-dark"
      size="sm"
      className="outline-dark btn-outline border-gray-400 btn-active-secondary w-100px px-2"
    >
      {translate('Actions')}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <ActionsPopover {...props} />
    </Dropdown.Menu>
  </Dropdown>
);
