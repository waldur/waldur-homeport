import {
  CaretDownIcon,
  DotsThreeVerticalIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import { FunctionComponent, PropsWithChildren } from 'react';
import { Dropdown, DropdownProps } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import { createPortal } from 'react-dom';

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
  data?: Record<string, any>;
}

interface TableDropdownToggleProps {
  label?: string;
  disabled?: boolean;
  labeled?: boolean;
  variant?: Variant;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TableDropdownToggle = ({
  label = '',
  disabled = false,
  labeled = false,
  variant = 'outline btn-outline-default',
  className = 'min-w-100px w-100',
  size = 'sm',
}: TableDropdownToggleProps) => {
  return labeled ? (
    <Dropdown.Toggle
      variant={variant}
      size={size === 'md' ? undefined : size}
      className={className + ' btn-icon-right no-arrow'}
      disabled={disabled}
    >
      {label || translate('Actions')}
      <span className="svg-icon svg-icon-4 rotate-180">
        <CaretDownIcon weight="bold" />
      </span>
    </Dropdown.Toggle>
  ) : (
    <Dropdown.Toggle
      variant="active-light"
      className="btn-icon no-arrow"
      disabled={disabled}
      size={size === 'md' ? undefined : size}
    >
      <DotsThreeVerticalIcon size={22} weight="bold" />
    </Dropdown.Toggle>
  );
};

const PortalDropdown = ({ children }) => {
  return createPortal(children, document.body);
};

export const ActionsDropdownComponent: FunctionComponent<
  PropsWithChildren<DropdownProps & TableDropdownToggleProps> & {
    menuStyle?: React.CSSProperties;
  }
> = ({
  onToggle,
  disabled,
  children,
  label,
  labeled,
  variant,
  className,
  menuStyle,
  size,
  ...rest
}) => (
  <Dropdown onToggle={onToggle} drop="start" align="end" {...rest}>
    <TableDropdownToggle
      label={label}
      labeled={labeled}
      disabled={disabled}
      variant={variant}
      className={className}
      size={size}
    />

    <PortalDropdown>
      <Dropdown.Menu
        popperConfig={
          rest.drop
            ? undefined
            : {
                modifiers: [
                  {
                    name: 'flip',
                    options: {
                      fallbackPlacements: ['top', 'left', 'bottom'],
                    },
                  },
                ],
              }
        }
        style={menuStyle}
      >
        {children}
      </Dropdown.Menu>
    </PortalDropdown>
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
  data = {},
  ...rest
}) => (
  <ActionsDropdownComponent {...rest}>
    {open ? (
      loading ? (
        <Dropdown.Item eventKey="1">
          <SpinnerIcon size={20} className="animation-spin me-2" />
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
            <ActionComponent
              key={index}
              row={row}
              refetch={refetch}
              {...data}
            />
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
