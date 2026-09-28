import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import {
  ComponentPropsWithoutRef,
  FC,
  forwardRef,
  ReactNode,
  useState,
} from 'react';

import {
  buttonVariants,
  ButtonVariant,
  ButtonSize,
  ButtonCaret,
} from 'waldur-ui';

interface ActionDropdownButtonProps {
  /** Dropdown button title/label */
  title: ReactNode;
  /** Design-token button variant - defaults to 'tertiary' */
  variant?: ButtonVariant;
  /** Button size - defaults to 'lg' */
  size?: ButtonSize;
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
 * against, merging in aria-haspopup/aria-expanded/data-state *plus the
 * open-on-click handling* as extra props on this element. Without
 * capturing and spreading those (`...rest` below), Slot's injected
 * onClick/onPointerDown/onKeyDown are silently dropped and the button
 * renders — title, variant, caret all correct — but never actually opens
 * the menu: reported live as every provider card's "Enabled"/"Not
 * configured" toggle on the admin Identity Providers page doing nothing
 * on click. Same underlying `Trigger asChild`/Slot mechanism as
 * ActionsDropdown.tsx's TableDropdownToggle, which already spreads
 * `...rest` and works correctly — comparing the two is how this class of
 * bug was diagnosed here.
 */
const Toggle = forwardRef<
  HTMLButtonElement,
  {
    title: ReactNode;
    variant: ButtonVariant;
    size: ButtonSize;
    className?: string;
    disabled?: boolean;
    id?: string;
    isOpen: boolean;
  } & Omit<ComponentPropsWithoutRef<'button'>, 'title'>
>(({ title, variant, size, className, disabled, id, isOpen, ...rest }, ref) => (
  <button
    ref={ref}
    id={id}
    type="button"
    disabled={disabled}
    className={classNames(
      buttonVariants({ variant, size }),
      'dropdown-toggle no-arrow',
      className,
    )}
    {...rest}
  >
    {title}
    <ButtonCaret size={size} isOpen={isOpen} className="ms-2" />
  </button>
));
Toggle.displayName = 'ActionDropdownButtonToggle';

/**
 * ActionDropdownButton - dropdown menu for panel and card headers.
 *
 * Defaults to size="lg" for visual consistency on standard toolbars;
 * pass size="sm" for compact toolbars (e.g. expanded-row toolbars).
 *
 * Uses the Phosphor CaretDown icon as the dropdown indicator and rotates
 * it 180° when the menu is open.
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
          // `show` makes .dropdown-menu visible; `position-static` lets Radix's
          // popper wrapper handle positioning.
          className="dropdown-menu show position-static"
        >
          {children}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  );
};
