import { FunctionComponent } from 'react';
import { Dropdown, DropdownMenu, DropdownToggle } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { OfferingAction } from './types';

interface ActionsDropdownProps {
  actions: OfferingAction[];
  pullRight: boolean;
}

export const ActionsDropdown: FunctionComponent<ActionsDropdownProps> = ({
  actions,
  pullRight,
}) => (
  <Dropdown
    id="offering-actions"
    disabled={actions.length === 0}
    pullRight={pullRight}
  >
    <DropdownToggle className="btn-sm">{translate('Actions')}</DropdownToggle>
    <DropdownMenu>
      {actions.map((action, index) => (
        <li key={index} className="cursor-pointer" role="presentation">
          <a onClick={action.handler} role="menuitem" tabIndex={-1}>
            {action.label}
          </a>
        </li>
      ))}
    </DropdownMenu>
  </Dropdown>
);

ActionsDropdown.defaultProps = {
  pullRight: true,
};
