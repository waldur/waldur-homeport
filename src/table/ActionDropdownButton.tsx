import { CaretDownIcon } from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { FC, forwardRef, ReactNode, useState } from 'react';
import { ButtonVariant } from 'react-bootstrap/esm/types';

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
 * forwardRef because this is rendered under `RadixDropdownMenu.Trigger
 * asChild` — Slot clones it and attaches the ref the popper positions
 * against. See ActionsDropdown.tsx's TableDropdownToggle for the same
 * requirement stated in more detail.
 */
const Toggle = forwardRef<
  HTMLButtonElement,
  {
    title: ReactNode;
    variant: ButtonVariant;
    size: 'sm' | 'lg';
    className?: string;
    disabled?: boolean;
    id?: string;
    isOpen: boolean;
  }
>(({ title, variant, size, className, disabled, id, isOpen }, ref) => (
  <button
    ref={ref}
    id={id}
    type="button"
    disabled={disabled}
    className={classNames(
      'btn dropdown-toggle',
      `btn-${variant}`,
      `btn-${size}`,
      'btn-icon-right no-arrow',
      className,
    )}
  >
    {title}
    <span
      className={classNames(
        `svg-icon svg-icon-${size === 'sm' ? '4' : '2'} ms-2`,
        isOpen && 'rotate-toggle-180',
      )}
    >
      <CaretDownIcon weight="bold" />
    </span>
  </button>
));
Toggle.displayName = 'ActionDropdownButtonToggle';

/**
 * ActionDropdownButton - for panel/card header dropdown menus.
 * Defaults to large size for visual consistency on standard toolbars;
 * pass size="sm" for compact toolbars (e.g. expanded-row toolbars).
 *
 * Uses the Phosphor CaretDown icon as the dropdown indicator and rotates
 * it 180° when the menu is open (replaces the default Bootstrap caret).
 *
 * On Radix's DropdownMenu, not react-bootstrap's — same rationale as
 * ActionsDropdown.tsx (see that file's top-of-file comment): its children
 * are ActionItem-based action components, and ActionItem's default row
 * (ActionsDropdownItem, src/table/ActionsDropdown.tsx) is a Radix menu
 * item that throws "`MenuItem` must be used within `Menu`" outside a real
 * Radix menu context — a react-bootstrap Dropdown doesn't provide one. Kept
 * as its own component rather than folded into ActionsDropdownComponent:
 * the two toggle buttons have always had different visual behavior (this
 * one rotates its caret only while actually open; TableDropdownToggle's
 * labeled variant is permanently rotated), and unifying them is a separate,
 * visual-risk change from this bugfix.
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
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onToggle?.(open);
  };

  return (
    <RadixDropdownMenu.Root modal={false} onOpenChange={handleOpenChange}>
      <RadixDropdownMenu.Trigger asChild disabled={disabled}>
        <Toggle
          title={title}
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
          id={id}
          isOpen={isOpen}
        />
      </RadixDropdownMenu.Trigger>
      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          sideOffset={2}
          collisionPadding={8}
          // See ActionsDropdown.tsx's ActionsDropdownComponent for why
          // `show`/`position-static` are both required here: Radix's
          // popper wrapper is the positioned element, and Bootstrap's own
          // `.dropdown-menu` is display:none until `show` is present.
          className="dropdown-menu show position-static"
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
