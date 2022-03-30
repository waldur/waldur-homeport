import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { OfferingAction } from './types';

interface ActionsDropdownProps {
  actions: OfferingAction[];
}

export const ActionsDropdown: FunctionComponent<ActionsDropdownProps> = ({
  actions,
}) => (
  <Dropdown id="offering-actions">
    <Dropdown.Toggle disabled={actions.length === 0} className="btn-sm">
      {translate('Actions')}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {actions.map((action, index) => (
        <Dropdown.Item
          key={index}
          onClick={action.handler}
          role="menuitem"
          tabIndex={-1}
        >
          {action.label}
        </Dropdown.Item>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);
