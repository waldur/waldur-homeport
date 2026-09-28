import {
  DotsThreeVerticalIcon,
  PlusCircleIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';
import * as RadixPopover from '@radix-ui/react-popover';
import classNames from 'classnames';
import {
  ComponentPropsWithoutRef,
  forwardRef,
  FunctionComponent,
  PropsWithChildren,
  ReactNode,
} from 'react';

import {
  buttonVariants,
  ButtonVariant,
  Tooltip,
  ButtonSize,
  ButtonCaret,
  getButtonIconSize,
} from 'waldur-ui';

import {
  radixDropdownMenuScrollContentStyle,
  radixPopoverScrollContentStyle,
} from '@/core/radixScrollContentStyles';
import { translate } from '@/i18n';

import { DropdownActionItemType } from './types';

/**
 * Row-actions menu component backed by Radix DropdownMenu.
 *
 * ## Toggle Buttons
 *
 * The toggle buttons (TableDropdownToggle, AddDropdownToggle, and
 * ActionDropdownButton.tsx's Toggle) render a raw `<button>` styled with
 * `buttonVariants()` from waldur-ui rather than wrapping in `BaseButton`.
 * This ensures the rotating caret (`.rotate-toggle-180`) remains a direct
 * child of the button for CSS open-state animation (`[data-state='open'] > .rotate-toggle-180`).
 *
 * ## Toggle Button Classes
 *
 * The toggle buttons retain targeted utility classes:
 * - `dropdown-toggle`: Target for caret animation when open, and for
 *   read-only view hiding rules.
 * - `no-arrow`: Suppresses the default `::after` caret pseudo-element,
 *   as these toggles render an explicit Phosphor CaretDownIcon.
 * - `btn-icon`: Present on icon-only toggles to ensure icon buttons outside
 *   tables (e.g. cards and panels) are properly hidden in read-only views.
 *
 * ## Radix Integration
 *
 * - Outside clicks: Radix automatically dismisses an open menu on any outside pointer event.
 * - Portaling: `RadixDropdownMenu.Portal` escapes overflow and stacking contexts while
 *   keeping the menu anchored to its trigger for positioning and focus return.
 * - `modal={false}`: Avoids blocking outside pointer events (allowing a click on a second
 *   trigger to open it directly) and avoids locking body scroll.
 */

interface TableDropdownToggleProps {
  label?: ReactNode;
  disabled?: boolean;
  labeled?: boolean;
  variant?: ButtonVariant;
  className?: string;
  size?: ButtonSize;
  tooltip?: string | boolean;
}

/**
 * The menu shell's own props — everything ActionsDropdownComponent (the
 * Root + Trigger + Content wiring) actually consumes or forwards. Kept
 * deliberately narrower than ActionsDropdownProps below: the remaining
 * fields there (open/loading/error/actions/row/refetch/data) belong to
 * ActionsDropdown's row-actions convenience layer, not to the shell, and
 * `...rest` on ActionsDropdownComponent ends up spread onto
 * RadixDropdownMenu.Content — a real DOM element. Widening this interface
 * to include them would let a caller pass e.g. `data={{}}` straight onto
 * ActionsDropdownComponent and land it as a stray DOM attribute.
 */
interface ActionsDropdownShellProps
  extends
    Omit<ComponentPropsWithoutRef<'div'>, 'onToggle'>,
    TableDropdownToggleProps {
  onToggle?: (isOpen: boolean) => void;
  drop?: 'up' | 'down' | 'start' | 'end';
  align?: 'start' | 'end';
}

interface ActionsDropdownProps extends ActionsDropdownShellProps {
  open?: boolean;
  loading?: boolean;
  error?: any;
  actions?: DropdownActionItemType[];
  row?: any;
  refetch?(): void;
  data?: Record<string, any>;
}

/**
 * forwardRef because this is always rendered under
 * `RadixDropdownMenu.Trigger asChild`: Slot clones it, attaches the ref the
 * popper anchors against, and merges in aria-haspopup/aria-expanded/
 * data-state plus the open-on-click handling. Without the ref the menu has
 * nothing to position against.
 *
 * Renders a raw `<button>` with `buttonVariants({ variant, size })` rather
 * than `BaseButton` so the rotating caret (`.rotate-toggle-180`) stays a direct
 * child of `.dropdown-toggle` for CSS animation (`[data-state='open'] > .rotate-toggle-180`).
 *
 * Retains `dropdown-toggle`, `no-arrow`, and `btn-icon` classes for caret
 * animation, default caret suppression, and read-only view styling rules.
 */
export const TableDropdownToggle = forwardRef<
  HTMLButtonElement,
  TableDropdownToggleProps & ComponentPropsWithoutRef<'button'>
>(
  (
    {
      label = '',
      disabled = false,
      labeled = false,
      variant = 'tertiary',
      className = 'min-w-100px w-100',
      size = 'lg',
      tooltip,
      ...rest
    },
    ref,
  ) => {
    const getTooltipMessage = () => {
      if (typeof tooltip === 'string') return tooltip;
      if (tooltip === true && disabled)
        return translate('There are no available actions');
      return undefined;
    };

    const tooltipMessage = getTooltipMessage();

    const toggle = labeled ? (
      <button
        ref={ref}
        type="button"
        className={classNames(
          buttonVariants({ variant, size }),
          'dropdown-toggle no-arrow',
          className,
        )}
        disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      >
        {label || translate('Actions')}
        <ButtonCaret size={size} />
      </button>
    ) : (
      <button
        ref={ref}
        type="button"
        className={classNames(
          buttonVariants({ variant: 'text-secondary', size, iconOnly: true }),
          'dropdown-toggle btn-icon no-arrow',
        )}
        disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        {...rest}
      >
        <DotsThreeVerticalIcon size={22} weight="bold" />
      </button>
    );

    if (tooltipMessage && disabled) {
      return <Tooltip label={tooltipMessage}>{toggle}</Tooltip>;
    }

    return toggle;
  },
);
TableDropdownToggle.displayName = 'TableDropdownToggle';

/**
 * The "+ Add ..." primary-button trigger shared by team-management
 * dropdowns (invite/add-user/add-organization menus). forwardRef for the same
 * asChild reason as TableDropdownToggle.
 *
 * Renders a raw `<button>` with `buttonVariants({ variant: 'primary', size })`
 * rather than `BaseButton` so the rotating caret remains a direct child of
 * `.dropdown-toggle` for the `[data-state='open'] > .rotate-toggle-180` animation.
 *
 * `size` is optional: most call sites pass `size="lg"` (44px) explicitly, but
 * omitting `size` defaults to buttonVariants()'s `md` tier (36px).
 */
export const AddDropdownToggle = forwardRef<
  HTMLButtonElement,
  { size?: ButtonSize } & ComponentPropsWithoutRef<'button'>
>(({ size, className, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    className={classNames(
      buttonVariants({ variant: 'primary', size }),
      'dropdown-toggle no-arrow',
      className,
    )}
    {...rest}
  >
    <PlusCircleIcon
      weight="bold"
      size={getButtonIconSize(size)}
      className="flex-shrink-0"
    />
    {translate('Add')}
    <ButtonCaret size={size} />
  </button>
));
AddDropdownToggle.displayName = 'AddDropdownToggle';

/**
 * A single row in the menu. Ensures proper menu semantics within Radix:
 * a plain element dropped into a Radix menu renders and clicks, but is
 * invisible to arrow keys and typeahead and will not close the menu on
 * activation.
 *
 * `onSelect` rather than `onClick`: it fires for pointer *and* keyboard
 * activation, and Radix closes the menu afterwards unless the handler
 * calls `event.preventDefault()`.
 */
export const ActionsDropdownItem = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof RadixDropdownMenu.Item>
>(({ className, ...props }, ref) => (
  <RadixDropdownMenu.Item
    ref={ref}
    className={classNames('dropdown-item', className)}
    {...props}
  />
));
ActionsDropdownItem.displayName = 'ActionsDropdownItem';

/**
 * Same `.dropdown-item` look and `onSelect` API as ActionsDropdownItem,
 * but with zero Radix dependency — for a row rendered outside any real
 * Menu/Popover ancestor at all. `RadixDropdownMenu.Item` throws
 * "`MenuItem` must be used within `Menu`" the moment it renders without a
 * `Root`/`Content` above it (confirmed live: ModalActionsDialog's "show
 * all actions" search results, a plain react-bootstrap `Modal`, not a
 * Radix panel — `ActionItem.tsx` reads `ResourceActionMenuContext`'s
 * `notInMenu` flag to switch to this here rather than its usual
 * ActionsDropdownItem default). A native `<button>` gets Enter/Space
 * activation and `disabled` handling for free, so there is no Radix
 * behaviour left to replicate by hand.
 */
export const PlainActionItem = forwardRef<
  HTMLButtonElement,
  ComponentPropsWithoutRef<'button'> & { onSelect?: () => void }
>(({ className, onSelect, onClick, disabled, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    role="menuitem"
    disabled={disabled}
    className={classNames('dropdown-item', className)}
    onClick={(event) => {
      onClick?.(event);
      onSelect?.();
    }}
    {...props}
  />
));
PlainActionItem.displayName = 'PlainActionItem';

/** Non-interactive menu row, for group captions and messages. */
export const ActionsDropdownItemText: FunctionComponent<
  PropsWithChildren<{ className?: string }>
> = ({ className, children }) => (
  <span className={classNames('dropdown-item-text', className)}>
    {children}
  </span>
);

/** Menu section caption. */
export const ActionsDropdownHeader: FunctionComponent<
  PropsWithChildren<{ className?: string }>
> = ({ className, children }) => (
  <RadixDropdownMenu.Label className={classNames('dropdown-header', className)}>
    {children}
  </RadixDropdownMenu.Label>
);

/** Menu separator. Radix marks it aria-hidden so it is skipped in
 * keyboard navigation, which a bare <hr> inside the menu would not be. */
export const ActionsDropdownSeparator: FunctionComponent<{
  className?: string;
}> = ({ className }) => (
  <RadixDropdownMenu.Separator
    className={classNames('dropdown-divider', className)}
  />
);

const DROP_TO_SIDE = {
  up: 'top',
  down: 'bottom',
  start: 'left',
  end: 'right',
} as const;

// `show` makes .dropdown-menu visible; `position-static` allows Radix's
// popper wrapper to control positioning without collapsing measured size.
const ACTIONS_SHELL_CONTENT_CLASSNAME = 'dropdown-menu show position-static';

export const ActionsDropdownComponent: FunctionComponent<
  PropsWithChildren<
    ActionsDropdownShellProps & {
      menuStyle?: React.CSSProperties;
      menuClassName?: string;
    }
  >
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
  drop = 'start',
  align = 'start',
  ...rest
}) => (
  <RadixDropdownMenu.Root modal={false} onOpenChange={onToggle}>
    <RadixDropdownMenu.Trigger asChild disabled={disabled}>
      <TableDropdownToggle
        label={label}
        labeled={labeled}
        disabled={disabled}
        variant={variant}
        className={className}
        size={size}
        tooltip={tooltip}
      />
    </RadixDropdownMenu.Trigger>

    <RadixDropdownMenu.Portal>
      <RadixDropdownMenu.Content
        side={DROP_TO_SIDE[drop]}
        align={align}
        sideOffset={2}
        className={classNames(ACTIONS_SHELL_CONTENT_CLASSNAME, menuClassName)}
        style={{ ...radixDropdownMenuScrollContentStyle, ...menuStyle }}
        {...rest}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  </RadixDropdownMenu.Root>
);

/**
 * Same trigger/panel shell as ActionsDropdownComponent, on Radix Popover
 * instead of DropdownMenu. Use this, not ActionsDropdownComponent, when the
 * panel contains anything the user types into or otherwise interacts with
 * beyond clicking a command row (e.g. search inputs or form fields).
 *
 * Command rows inside a Popover should use ActionsPopoverItem instead of
 * ActionsDropdownItem, as ActionsDropdownItem requires DropdownMenu context.
 */
export const ActionsPopoverComponent: FunctionComponent<
  PropsWithChildren<
    ActionsDropdownShellProps & {
      menuStyle?: React.CSSProperties;
      menuClassName?: string;
    }
  >
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
  drop = 'start',
  align = 'start',
  ...rest
}) => (
  <RadixPopover.Root modal={false} onOpenChange={onToggle}>
    <RadixPopover.Trigger asChild disabled={disabled}>
      <TableDropdownToggle
        label={label}
        labeled={labeled}
        disabled={disabled}
        variant={variant}
        className={className}
        size={size}
        tooltip={tooltip}
      />
    </RadixPopover.Trigger>

    <RadixPopover.Portal>
      <RadixPopover.Content
        side={DROP_TO_SIDE[drop]}
        align={align}
        sideOffset={2}
        className={classNames(ACTIONS_SHELL_CONTENT_CLASSNAME, menuClassName)}
        style={{ ...radixPopoverScrollContentStyle, ...menuStyle }}
        {...rest}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);

/**
 * A command row inside an ActionsPopoverComponent panel — the Popover
 * equivalent of ActionsDropdownItem. Popover has no menu/item concept at
 * all (no roving tabindex, no typeahead, no built-in "activating this
 * closes the panel" behavior), so this is deliberately NOT a Radix
 * primitive wrapper the way ActionsDropdownItem is: it is a plain
 * `.dropdown-item`-classed element, closed on activation via
 * RadixPopover.Close asChild (confirmed to need no forwardRef on its
 * child — Close only merges an onClick, it does not position anything the
 * way Trigger's ref does).
 *
 * `as` composes a different element (e.g. a router Link) as the row itself
 * via RadixPopover.Close's own asChild, the same asChild-composability
 * ActionsDropdownItem offers via Radix's Slot — pass a component here, not
 * a string tag.
 */
export const ActionsPopoverItem: FunctionComponent<
  PropsWithChildren<
    Omit<ComponentPropsWithoutRef<'button'>, 'type'> & {
      /** Swap the rendered element (e.g. a router Link component) — pass a
       * component, not a string tag. Extra props (e.g. that Link's own
       * `state`/`params`) pass through untyped, same latitude ActionItem's
       * own `as` gives its callers. */
      as?: React.ElementType;
      disabled?: boolean;
      [key: string]: any;
    }
  >
> = ({ as: Component = 'button', className, disabled, ...props }) => (
  // `disabled` goes on Component only, not Close: a native disabled button
  // never fires the click Close listens for, so the panel-closing behavior
  // is already blocked at the DOM level regardless of which layer set it —
  // no need to duplicate the prop onto Close itself.
  <RadixPopover.Close asChild>
    <Component
      type={Component === 'button' ? 'button' : undefined}
      className={classNames('dropdown-item', disabled && 'disabled', className)}
      disabled={disabled}
      {...props}
    />
  </RadixPopover.Close>
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
  tooltip,
  ...rest
}) => (
  <ActionsDropdownComponent tooltip={tooltip} {...rest}>
    {open ? (
      loading ? (
        <ActionsDropdownItem disabled>
          <SpinnerIcon
            size={20}
            className="animation-spin me-2"
            weight="bold"
          />
          {translate('Loading actions')}
        </ActionsDropdownItem>
      ) : error ? (
        <ActionsDropdownItem disabled>
          {translate('Unable to load actions')}
        </ActionsDropdownItem>
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
        <ActionsDropdownItem disabled>
          {translate('There are no actions.')}
        </ActionsDropdownItem>
      )
    ) : null}
  </ActionsDropdownComponent>
);
