import { DotsThreeVertical, Spinner } from '@phosphor-icons/react';
import { FunctionComponent, PropsWithChildren } from 'react';
import { Dropdown, DropdownProps } from 'react-bootstrap';

import { translate } from '@waldur/i18n';

import { DropdownActionItemType } from './types';

interface ActionsDropdownProps {
  onToggle?: (isOpen: boolean) => void;
  disabled?: boolean;
  open?: boolean;
  labeled?: boolean;
  loading?: boolean;
  error?: any;
  actions?: DropdownActionItemType[];
  row?: any;
  refetch?(): void;
}

export const TableDropdownToggle = ({
  label = '',
  disabled = false,
  labeled = false,
}) => {
  return labeled ? (
    <Dropdown.Toggle
      variant="outline-dark"
      size="sm"
      className="outline-dark btn-outline border-gray-400 btn-active-secondary min-w-100px px-2"
      disabled={disabled}
    >
      {label || translate('Actions')}
    </Dropdown.Toggle>
  ) : (
    <Dropdown.Toggle
      variant="active-light"
      className="btn-icon no-arrow"
      disabled={disabled}
    >
      <DotsThreeVertical size={22} weight="bold" />
    </Dropdown.Toggle>
  );
};

export const ActionsDropdownComponent: FunctionComponent<
  PropsWithChildren<DropdownProps & { label?; labeled?; disabled? }>
> = ({ onToggle, disabled, children, label, labeled, ...rest }) => (
  <Dropdown onToggle={onToggle} {...rest}>
    <TableDropdownToggle label={label} labeled={labeled} disabled={disabled} />
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

export const ActionsDropdown: FunctionComponent<
  PropsWithChildren<ActionsDropdownProps>
> = ({
  open = true,
  loading,
  error,
  actions,
  children,
  row,
  refetch,
  ...rest
}) => (
  <ActionsDropdownComponent {...rest}>
    {open ? (
      loading ? (
        <Dropdown.Item eventKey="1">
          <Spinner size={20} className="fa-spin me-2" />
          {translate('Loading actions')}
        </Dropdown.Item>
      ) : error ? (
        <Dropdown.Item eventKey="1">
          {translate('Unable to load actions')}
        </Dropdown.Item>
      ) : children ? (
        children
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
