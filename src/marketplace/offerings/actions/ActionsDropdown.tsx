import { FunctionComponent } from 'react';
import { Dropdown } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { OfferingAction } from './types';

interface ActionsDropdownProps {
  actions: OfferingAction[];
  dotted?: Boolean;
}

export const ActionsDropdown: FunctionComponent<ActionsDropdownProps> = ({
  actions,
  dotted,
}) => {
  return (
    <Dropdown id="offering-actions">
      {dotted ? (
        <Dropdown.Toggle
          variant="link"
          bsPrefix="btn-icon btn-bg-light btn-sm btn-active-color-primary"
        >
          <i className="fa fa-ellipsis-h"></i>
        </Dropdown.Toggle>
      ) : (
        <Dropdown.Toggle
          disabled={actions.length === 0}
          variant="light"
          size="sm"
        >
          {translate('Actions')}
        </Dropdown.Toggle>
      )}
      <Dropdown.Menu>
        {actions.map((action, index) => (
          <Dropdown.Item
            key={index}
            onClick={action.handler}
            role="button"
            tabIndex={-1}
          >
            {action.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
