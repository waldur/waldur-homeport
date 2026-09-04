import {
  CaretDownIcon,
  DotsThreeVerticalIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Dropdown, DropdownProps } from 'react-bootstrap';
import { Variant } from 'react-bootstrap/esm/types';
import { createPortal } from 'react-dom';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { DropdownActionItemType } from './types';

// Module-level coordinator so opening one ActionsDropdownComponent closes
// any other that's currently open. Plain pub/sub avoids DOM custom events
// and the global namespace they require. A counter (instead of useId) is
// used so the React useId sequence is left untouched — useId here would
// shift downstream nested-component ids and break unrelated snapshot tests.
type Listener = (openId: number) => void;
const listeners = new Set<Listener>();
const announceOpen = (id: number) => listeners.forEach((fn) => fn(id));
const subscribe = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
let nextInstanceId = 0;

interface ActionsDropdownProps extends Partial<DropdownProps> {
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
  variant?: Variant;
  size?: 'sm' | 'lg';
  tooltip?: string | boolean;
}

interface TableDropdownToggleProps {
  label?: ReactNode;
  disabled?: boolean;
  labeled?: boolean;
  variant?: Variant;
  className?: string;
  size?: 'sm' | 'lg';
  tooltip?: string | boolean;
}

export const TableDropdownToggle = ({
  label = '',
  disabled = false,
  labeled = false,
  variant = 'tertiary',
  className = 'min-w-100px w-100',
  size = 'lg',
  tooltip,
}: TableDropdownToggleProps) => {
  const getTooltipMessage = () => {
    if (typeof tooltip === 'string') return tooltip;
    if (tooltip === true && disabled)
      return translate('There are no available actions');
    return undefined;
  };

  const tooltipMessage = getTooltipMessage();

  const renderToggle = () =>
    labeled ? (
      <Dropdown.Toggle
        variant={variant}
        size={size}
        className={classNames('btn-icon-right no-arrow', className)}
        disabled={disabled}
      >
        {label || translate('Actions')}
        <span className={`svg-icon svg-icon-${size === 'sm' ? '4' : '2'}`}>
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
    ) : (
      <Dropdown.Toggle
        variant="text-secondary"
        className="btn-icon no-arrow"
        disabled={disabled}
        size={size}
      >
        <DotsThreeVerticalIcon size={22} weight="bold" />
      </Dropdown.Toggle>
    );

  if (tooltipMessage && disabled) {
    return (
      <Tip label={tooltipMessage} id="actions-dropdown-tip">
        <span className="d-inline-block">{renderToggle()}</span>
      </Tip>
    );
  }

  return renderToggle();
};

const PortalDropdown = ({ children }) => {
  return createPortal(children, document.body);
};

export const ActionsDropdownComponent: FunctionComponent<
  PropsWithChildren<DropdownProps & TableDropdownToggleProps> & {
    menuStyle?: React.CSSProperties;
    menuClassName?: string;
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
  menuClassName,
  size,
  tooltip,
  ...rest
}) => {
  const [id] = useState(() => ++nextInstanceId);
  const [show, setShow] = useState(false);

  useEffect(
    () =>
      subscribe((openId) => {
        if (openId !== id) setShow(false);
      }),
    [id],
  );

  const handleToggle = useCallback<NonNullable<DropdownProps['onToggle']>>(
    (nextShow, meta) => {
      if (nextShow) announceOpen(id);
      setShow(nextShow);
      onToggle?.(nextShow, meta);
    },
    [id, onToggle],
  );

  return (
    <Dropdown drop="start" {...rest} show={show} onToggle={handleToggle}>
      <TableDropdownToggle
        label={label}
        labeled={labeled}
        disabled={disabled}
        variant={variant}
        className={className}
        size={size}
        tooltip={tooltip}
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
          className={menuClassName}
        >
          {children}
        </Dropdown.Menu>
      </PortalDropdown>
    </Dropdown>
  );
};

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
  tooltip,
  ...rest
}) => (
  <ActionsDropdownComponent tooltip={tooltip} {...rest}>
    {open ? (
      loading ? (
        <Dropdown.Item eventKey="1">
          <SpinnerIcon
            size={20}
            className="animation-spin me-2"
            weight="bold"
          />
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
