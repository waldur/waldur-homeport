import {
  CaretDownIcon,
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
import { Variant } from 'react-bootstrap/esm/types';

import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';

import { DropdownActionItemType } from './types';

/**
 * The row-actions menu, on Radix's DropdownMenu rather than
 * react-bootstrap's.
 *
 * ## Why the markup still wears Bootstrap's class names
 *
 * This component is reachable from ~184 files (and ActionItem, its usual
 * child, from ~520), so a rewrite here restyles a large fraction of the
 * app at once if it also changes the visuals. It deliberately does not:
 * Radix supplies behaviour, positioning and accessibility, while
 * `.dropdown-menu`/`.dropdown-item` keep supplying the appearance, exactly
 * as before. One axis at a time — the design-system restyle onto
 * packages/ui's Tailwind DropdownMenu is a separate, reviewable step.
 *
 * That is not a dead end: `.dropdown-menu`/`.dropdown-item` come from
 * Bootstrap's own _dropdown.scss, *not* from Metronic's menu SCSS
 * (src/metronic/sass/core/components/menu/), so keeping them here does not
 * block deleting that ~1345-line menu stylesheet once the `data-kt-menu`
 * popups migrate. The two are unrelated CSS.
 *
 * The measured Bootstrap values this preserves are recorded in
 * docs/tailwind-shadcn-migration-notes.md, so the eventual restyle has a
 * parity target instead of a guess.
 *
 * ## What Radix replaces
 *
 * Two workarounds are gone because Radix does the job natively:
 *
 * - The module-level pub/sub that closed every other open instance. Radix
 *   dismisses an open menu on any outside pointer event, so clicking a
 *   second trigger closes the first on its own.
 * - The manual `createPortal(children, document.body)` around the menu —
 *   RadixDropdownMenu.Portal is the same escape from the table's
 *   overflow/stacking context, and it keeps the menu tied to its trigger
 *   for positioning and focus return.
 *
 * `modal={false}` is a parity choice, not a default: a modal Radix menu
 * blocks outside pointer events (so the click that opens a second menu is
 * swallowed rather than opening it) and locks body scroll. A Bootstrap
 * dropdown does neither.
 */

interface TableDropdownToggleProps {
  label?: ReactNode;
  disabled?: boolean;
  labeled?: boolean;
  variant?: Variant;
  className?: string;
  size?: 'sm' | 'lg';
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
 * `.dropdown-toggle` stays on both variants even though Radix has no use for
 * it. It is not only Bootstrap's caret pseudo-element (which `no-arrow`
 * suppresses anyway): `.disabled-view` hides action toggles wholesale with
 * `table .dropdown-toggle, .dropdown-toggle.btn-icon { display: none }`
 * (src/metronic/sass/custom/_content.scss), so dropping the class makes the
 * row actions reappear in every read-only view. `custom/_table.scss` also
 * hangs a `:before` reset off it. Both are appearance the migration is meant
 * to leave untouched.
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
          'btn dropdown-toggle btn-icon-right no-arrow',
          `btn-${variant}`,
          `btn-${size}`,
          className,
        )}
        disabled={disabled}
        {...rest}
      >
        {label || translate('Actions')}
        <span
          className={`svg-icon svg-icon-${size === 'sm' ? '4' : '2'} rotate-toggle-180`}
        >
          <CaretDownIcon weight="bold" />
        </span>
      </button>
    ) : (
      <button
        ref={ref}
        type="button"
        className={classNames(
          'btn dropdown-toggle btn-text-secondary btn-icon no-arrow',
          `btn-${size}`,
        )}
        disabled={disabled}
        {...rest}
      >
        <DotsThreeVerticalIcon size={22} weight="bold" />
      </button>
    );

    if (tooltipMessage && disabled) {
      // A disabled <button> gets pointer-events: none, so the tooltip only
      // fires from a live wrapper element — same reason the Bootstrap
      // version wrapped it.
      return (
        <Tip label={tooltipMessage} id="actions-dropdown-tip">
          <span className="d-inline-block">{toggle}</span>
        </Tip>
      );
    }

    return toggle;
  },
);
TableDropdownToggle.displayName = 'TableDropdownToggle';

/**
 * A single row in the menu. Exported so call sites that previously rendered
 * a bare react-bootstrap `<Dropdown.Item>` inside an ActionsDropdown can
 * keep their markup and still get real menu semantics — a plain element
 * dropped into a Radix menu renders and clicks, but is invisible to arrow
 * keys and typeahead and will not close the menu on activation.
 *
 * `onSelect` rather than `onClick`: it fires for pointer *and* keyboard
 * activation, and Radix closes the menu afterwards unless the handler
 * calls `event.preventDefault()`.
 */
/**
 * The "+ Add ..." primary-button trigger shared by every team-management
 * dropdown (invite/add-user/add-organization menus) — six near-identical
 * copies of this exact markup existed before this component, one per host
 * file. forwardRef for the same asChild reason as TableDropdownToggle.
 *
 * `size` is left genuinely optional (no default): most call sites passed
 * react-bootstrap's `Dropdown.Toggle size="lg"` explicitly, but
 * proposals/team/TeamDropdownActions.tsx passed no `size` at all, which
 * Bootstrap renders as its default (medium) button with no `btn-sm`/`btn-lg`
 * class — a real, if probably accidental, visual difference from every
 * other call site that this preserves rather than silently normalizes away.
 */
export const AddDropdownToggle = forwardRef<
  HTMLButtonElement,
  { size?: 'sm' | 'lg' } & ComponentPropsWithoutRef<'button'>
>(({ size, className, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    className={classNames(
      'btn dropdown-toggle btn-primary no-arrow btn-icon-right',
      size && `btn-${size}`,
      className,
    )}
    {...rest}
  >
    <span className={`svg-icon svg-icon-${size === 'sm' ? '4' : '2'}`}>
      <PlusCircleIcon weight="bold" />
    </span>
    {translate('Add')}
    <span
      className={`svg-icon svg-icon-${size === 'sm' ? '4' : '2'} rotate-toggle-180`}
    >
      <CaretDownIcon weight="bold" />
    </span>
  </button>
));
AddDropdownToggle.displayName = 'AddDropdownToggle';

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

/** Bootstrap's non-interactive menu row, for group captions and messages. */
export const ActionsDropdownItemText: FunctionComponent<
  PropsWithChildren<{ className?: string }>
> = ({ className, children }) => (
  <span className={classNames('dropdown-item-text', className)}>
    {children}
  </span>
);

/** Bootstrap's menu section caption. */
export const ActionsDropdownHeader: FunctionComponent<
  PropsWithChildren<{ className?: string }>
> = ({ className, children }) => (
  <RadixDropdownMenu.Label className={classNames('dropdown-header', className)}>
    {children}
  </RadixDropdownMenu.Label>
);

/** Bootstrap's menu rule. Radix marks it aria-hidden so it is skipped in
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
        // `show` because Bootstrap's `.dropdown-menu` is display:none until
        // it is present; `position-static` because the Radix popper wrapper
        // is the positioned element here, and leaving `.dropdown-menu`'s own
        // `position: absolute` in place would take the panel out of that
        // wrapper's flow and collapse its measured size.
        className={classNames(
          'dropdown-menu show position-static',
          menuClassName,
        )}
        style={menuStyle}
        {...rest}
      >
        {children}
      </RadixDropdownMenu.Content>
    </RadixDropdownMenu.Portal>
  </RadixDropdownMenu.Root>
);

/**
 * Same trigger/panel shell and Bootstrap classing as ActionsDropdownComponent,
 * on Radix's Popover instead of its DropdownMenu. Use this, not
 * ActionsDropdownComponent, when the panel contains anything the user types
 * into or otherwise interacts with beyond clicking a command row — a search
 * box, a select, a date picker, a form. A DropdownMenu owns focus with a
 * roving tabindex and treats character keys as typeahead over its own item
 * collection; a focused text input sitting in that collection has its
 * keystrokes intermittently stolen the moment one matches an item's
 * typeahead prefix (confirmed empirically, not assumed: typing "alpha..."
 * into a search box next to a menu item literally titled "Alpha" moved focus
 * to that item after the first character, and every keystroke after was
 * lost). Popover has no such collection and no typeahead, so a focused input
 * behaves exactly as it would anywhere else on the page.
 *
 * children here are NOT DropdownMenu.Item-shaped, and ActionsDropdownItem
 * cannot be used inside one: it wraps RadixDropdownMenu.Item, which reads
 * DropdownMenu's own internal collection context specifically (not just
 * "any floating Radix panel") and throws that same "`MenuItem` must be
 * used within `Menu`" error under a Popover too — confirmed empirically,
 * not assumed, after first (wrongly) documenting here that it would work.
 * A command row inside a Popover is ActionsPopoverItem instead.
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
        // Same reasoning as ActionsDropdownComponent's Content — see its
        // own comment on `show`/`position-static`.
        className={classNames(
          'dropdown-menu show position-static',
          menuClassName,
        )}
        style={menuStyle}
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
