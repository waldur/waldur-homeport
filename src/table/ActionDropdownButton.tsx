import { FC, ReactNode } from 'react';
import { DropdownButton } from 'react-bootstrap';
import { ButtonVariant } from 'react-bootstrap/esm/types';

interface ActionDropdownButtonProps {
  /** Dropdown button title/label */
  title: ReactNode;
  /** Bootstrap button variant - defaults to 'tertiary' */
  variant?: ButtonVariant;
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
 * Always renders at large size for visual consistency.
 */
export const ActionDropdownButton: FC<ActionDropdownButtonProps> = ({
  title,
  variant = 'tertiary',
  className,
  disabled,
  align,
  children,
  onToggle,
  id,
}) => (
  <DropdownButton
    id={id}
    title={title}
    variant={variant}
    size="lg"
    className={className}
    disabled={disabled}
    align={align}
    onToggle={onToggle}
  >
    {children}
  </DropdownButton>
);
