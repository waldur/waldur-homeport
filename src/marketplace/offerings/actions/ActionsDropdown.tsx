import * as React from 'react';
import * as Dropdown from 'react-bootstrap/lib/Dropdown';

import { translate } from '@waldur/i18n';

import { OfferingAction } from './types';

interface ActionsDropdownProps {
  actions?: OfferingAction[];
}

export const ActionsDropdown = ({ actions }: ActionsDropdownProps) => (
  <Dropdown id="offering-actions">
    <Dropdown.Toggle className="btn-sm">
      {translate('Actions')}
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {actions.length === 0 &&
        <li role="presentation">
          <a>{translate('There are no actions.')}</a>
        </li>
      }
      {actions.map((action, index) => (
        <li key={index} className="cursor-pointer" role="presentation">
          <a onClick={action.handler} role="menuitem" tabIndex={-1}>
            {action.label}
          </a>
        </li>
      ))}
    </Dropdown.Menu>
  </Dropdown>
);
