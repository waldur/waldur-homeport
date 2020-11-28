import React from 'react';
import Dropdown from 'react-bootstrap/lib/Dropdown';
import DropdownMenu from 'react-bootstrap/lib/DropdownMenu';
import DropdownToggle from 'react-bootstrap/lib/DropdownToggle';

import { translate } from '@waldur/i18n';

import { OfferingAction } from './types';

interface ActionsDropdownProps {
  actions: OfferingAction[];
}

export const ActionsDropdown = ({ actions }: ActionsDropdownProps) => (
  <Dropdown
    id="offering-actions"
    className={actions.length === 0 ? 'disabled' : undefined}
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
