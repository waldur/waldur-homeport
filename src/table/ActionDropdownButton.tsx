import { CaretDownIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, ReactNode, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';
import { createPortal } from 'react-dom';

// Render the menu in a body portal so an `overflow: hidden/auto` ancestor
// (e.g. an expanded-row card) can't clip it — same approach as ActionsDropdown
// (WAL-7845). react-bootstrap's Dropdown.Menu does not self-portal.
const PortalDropdown = ({ children }: { children: ReactNode }) =>
  createPortal(children, document.body);

interface ActionDropdownButtonProps {
  /** Dropdown button title/label */
  title: ReactNode;
  /** Bootstrap button variant - defaults to 'tertiary' */
  variant?: ButtonVariant;
  /** Bootstrap button size - defaults to 'lg' */
  size?: 'sm' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Dropdown menu alignment */
  align?: 'start' | 'end';
  /** Dropdown menu items (children) */
  children: ReactNode;
  /** Callback when dropdown is toggled */
  onToggle?: (isOpen: boolean) => void;
  /** Button ID for accessibility */
  id?: string;
}

/**
 * ActionDropdownButton - for panel/card header dropdown menus.
 * Defaults to large size for visual consistency on standard toolbars;
 * pass size="sm" for compact toolbars (e.g. expanded-row toolbars).
 *
 * Uses the Phosphor CaretDown icon as the dropdown indicator and rotates
 * it 180° when the menu is open (replaces the default Bootstrap caret).
 */
export const ActionDropdownButton: FC<ActionDropdownButtonProps> = ({
  title,
  variant = 'tertiary',
  size = 'lg',
  className,
  disabled,
  align,
  children,
  onToggle,
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  return (
    <Dropdown align={align} onToggle={handleToggle}>
      <Dropdown.Toggle
        id={id}
        variant={variant}
        size={size}
        disabled={disabled}
        className={classNames('btn-icon-right no-arrow', className)}
      >
        {title}
        <span
          className={classNames(
            `svg-icon svg-icon-${size === 'sm' ? '4' : '2'} ms-2`,
            isOpen && 'rotate-180',
          )}
        >
          <CaretDownIcon weight="bold" />
        </span>
      </Dropdown.Toggle>
      <PortalDropdown>
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
      </PortalDropdown>
    </Dropdown>
  );
};
