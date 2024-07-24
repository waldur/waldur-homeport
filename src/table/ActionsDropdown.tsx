import { FunctionComponent, PropsWithChildren } from 'react';
import { Dropdown, DropdownProps } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { DropdownActionItemType } from './types';

interface ActionsDropdownProps {
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  loading?: boolean;
  error?: object;
  actions: DropdownActionItemType[];
  row?: any;
  refetch?(): void;
}

export const ActionsDropdownComponent: FunctionComponent<
  PropsWithChildren<DropdownProps & { label?; disabled? }>
> = ({ onToggle, disabled, children, label, ...rest }) => (
  <Dropdown onToggle={onToggle} {...rest}>
    <Dropdown.Toggle
      variant="outline-dark"
      size="sm"
      className="outline-dark btn-outline border-gray-400 btn-active-secondary w-100px px-2"
      disabled={disabled}
    >
      {label || translate('Actions')}
    </Dropdown.Toggle>
    <Dropdown.Menu
      popperConfig={{
        modifiers: [
          {
            name: 'flip',
            options: {
              fallbackPlacements: ['top', 'left', 'bottom'],
            },
          },
        ],
      }}
    >
      {children}
    </Dropdown.Menu>
  </Dropdown>
);

export const ActionsDropdown: FunctionComponent<ActionsDropdownProps> = ({
  open = true,
  loading,
  error,
  actions,
  row,
  refetch,
  ...rest
}) => (
  <ActionsDropdownComponent {...rest}>
    {open ? (
      loading ? (
        <Dropdown.Item eventKey="1">
          {translate('Loading actions')}
        </Dropdown.Item>
      ) : error ? (
        <Dropdown.Item eventKey="1">
          {translate('Unable to load actions')}
        </Dropdown.Item>
      ) : actions ? (
        <>
          {actions.map((ActionComponent, index) => (
            <ActionComponent key={index} row={row} refetch={refetch} />
          ))}
        </>
      ) : (
        <Dropdown.Item eventKey="2">
          {translate('There are no actions.')}
        </Dropdown.Item>
      )
    ) : null}
  </ActionsDropdownComponent>
);
