import { DotsThreeVertical, Spinner } from '@phosphor-icons/react';
import { FunctionComponent, PropsWithChildren } from 'react';
import { Dropdown, DropdownProps } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';

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

interface TableDropdownToggleProps {
  label?: string;
  disabled?: boolean;
  labeled?: boolean;
  variant?: Variant;
  className?: string;
}

export const TableDropdownToggle = ({
  label = '',
  disabled = false,
  labeled = false,
  variant = 'outline btn-outline-default',
  className = 'min-w-100px w-100',
}: TableDropdownToggleProps) => {
  return labeled ? (
    <Dropdown.Toggle
      variant={variant}
      size="sm"
      className={className}
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
  PropsWithChildren<DropdownProps & TableDropdownToggleProps>
> = ({
  onToggle,
  disabled,
  children,
  label,
  labeled,
  variant,
  className,
  ...rest
}) => (
  <Dropdown onToggle={onToggle} {...rest}>
    <TableDropdownToggle
      label={label}
      labeled={labeled}
      disabled={disabled}
      variant={variant}
      className={className}
    />
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
