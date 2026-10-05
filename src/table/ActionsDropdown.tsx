import {
  DotsThreeVerticalIcon,
  PlusCircleIcon,
  SpinnerIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import {
  ComponentPropsWithoutRef,
  forwardRef,
  FunctionComponent,
  PropsWithChildren,
  cloneElement,
  createContext,
  isValidElement,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';

import {
  buttonVariants,
  ButtonVariant,
  Tooltip,
  ButtonSize,
  ButtonCaret,
  getButtonIconSize,
  Menu,
} from 'waldur-ui';

import { translate } from '@/i18n';

import { DropdownActionItemType } from './types';

/**
 * Action menus: ActionsMenu (a trigger plus a panel, on waldur-ui's Menu),
 * its rows, and ActionsDropdown, which is a row-actions facade over it.
 *
 * ## Toggle Buttons
 *
 * The toggle buttons (TableDropdownToggle and AddDropdownToggle) render a
 * raw `<button>` styled with `buttonVariants()` from waldur-ui rather than
 * wrapping in `BaseButton`. The caret flips while the menu is open: the toggle
 * is a `group/toggle`, and Radix marks it data-state="open" (see waldur-ui's
 * ButtonCaret).
 *
 * ## Behaviour
 *
 * waldur-ui's Menu supplies it: an outside click dismisses the panel, the
 * panel is portaled out of overflow and stacking contexts while staying
 * anchored to its trigger, and `modal={false}` lets a click on a second
 * trigger open that menu directly without locking page scroll.
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

export interface ActionsDropdownProps
  extends
    Omit<ComponentPropsWithoutRef<typeof Menu.Content>, 'look' | 'onToggle'>,
    TableDropdownToggleProps {
  onToggle?: (isOpen: boolean) => void;
  loading?: boolean;
  error?: any;
  actions?: DropdownActionItemType[];
  row?: any;
  refetch?(): void;
  data?: Record<string, any>;
}

/**
 * forwardRef because this is always rendered under a Radix
 * `Trigger asChild`: Slot clones it, attaches the ref the
 * popper anchors against, and merges in aria-haspopup/aria-expanded/
 * data-state plus the open-on-click handling. Without the ref the menu has
 * nothing to position against.
 *
 * Renders a raw `<button>` with `buttonVariants({ variant, size })` rather
 * than `BaseButton` so the rotating caret (`.rotate-toggle-180`) stays a
 * direct child of the toggle for its open-state rotation.
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
          'group/toggle',
          buttonVariants({ variant, size }),
          className,
        )}
        data-testid="actions-toggle"
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
        // No `className`: its default sizes the labeled toggle.
        className={classNames(
          buttonVariants({
            variant: 'text-secondary',
            size,
            iconOnly: true,
          }),
        )}
        aria-label={translate('Actions')}
        data-testid="actions-toggle"
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
 * the toggle for its open-state rotation (see TableDropdownToggle).
 *
 * `size` is optional: most call sites pass `size="lg"` (44px) explicitly, but
 * omitting `size` defaults to buttonVariants()'s `md` tier (36px).
 */
const AddDropdownToggle = forwardRef<
  HTMLButtonElement,
  { size?: ButtonSize } & ComponentPropsWithoutRef<'button'>
>(({ size, className, ...rest }, ref) => (
  <button
    ref={ref}
    type="button"
    className={classNames(
      'group/toggle',
      buttonVariants({ variant: 'primary', size }),
      className,
    )}
    data-testid="actions-toggle"
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

const ActionsUnavailableContext = createContext<string | undefined>(undefined);

/**
 * Makes the action menus inside unavailable, with `reason` as the
 * explanation: each ActionsMenu (and so ActionsDropdown) renders its toggle
 * disabled, with the reason in a tooltip, and doesn't open. Used by the pages
 * of an unavailable offering. Without a `reason` it changes nothing.
 */
export const ActionsUnavailable = ({
  reason,
  children,
}: PropsWithChildren<{ reason?: string }>) => (
  <ActionsUnavailableContext.Provider value={reason}>
    {children}
  </ActionsUnavailableContext.Provider>
);

type ActionsMenuToggle = 'kebab' | 'labeled' | 'add' | ReactElement;

export interface ActionsMenuProps extends Omit<
  ComponentPropsWithoutRef<typeof Menu.Content>,
  'look' | 'onToggle'
> {
  /**
   * The trigger: `kebab` (the icon-only three dots, the default),
   * `labeled` (a button with a caret, "Actions" unless `label` is given),
   * `add` (the primary "+ Add" button) or an element of your own, which
   * must forward its ref.
   */
  toggle?: ActionsMenuToggle;
  label?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The built-in toggle's class names. */
  toggleClassName?: string;
  disabled?: boolean;
  tooltip?: string | boolean;
  onOpenChange?: (open: boolean) => void;
  /** Open on first render (stories, and panels that start open). */
  defaultOpen?: boolean;
}

const renderToggle = ({
  toggle,
  label,
  variant,
  size,
  toggleClassName,
  disabled,
  tooltip,
}: ActionsMenuProps) => {
  if (toggle === 'add') {
    return (
      <AddDropdownToggle
        size={size}
        className={toggleClassName}
        disabled={disabled}
      />
    );
  }
  if (toggle === 'kebab' || toggle === 'labeled' || toggle === undefined) {
    return (
      <TableDropdownToggle
        label={label}
        labeled={toggle === 'labeled'}
        disabled={disabled}
        variant={variant}
        className={toggleClassName}
        size={size}
        tooltip={tooltip}
      />
    );
  }
  return toggle;
};

/**
 * An action menu with its trigger: row actions, "Add" menus and other
 * command lists. Built on waldur-ui's Menu, so it has the actions look,
 * `modal={false}` (a click on another trigger opens that one directly, and
 * the page keeps scrolling) and the `actions-menu` / `action-item` test ids.
 * Fill it with Menu.Item or ActionItem rows.
 */
export const ActionsMenu: FunctionComponent<
  PropsWithChildren<ActionsMenuProps>
> = (props) => {
  const {
    toggle: _toggle,
    label: _label,
    variant: _variant,
    size: _size,
    toggleClassName: _toggleClassName,
    disabled,
    tooltip: _tooltip,
    onOpenChange,
    defaultOpen,
    children,
    side = 'left',
    align = 'start',
    ...contentProps
  } = props;
  const unavailableReason = useContext(ActionsUnavailableContext);
  if (unavailableReason) {
    // The toggle disabled, its reason in a tooltip. The tooltip sits on a
    // wrapper: a disabled button gets no pointer events (and .disabled-view
    // turns them off for every button), so it couldn't open on the button.
    const toggle = renderToggle({
      ...props,
      disabled: true,
      tooltip: undefined,
    });
    return (
      <Tooltip label={unavailableReason}>
        {/* Focusable, so the reason is reachable from the keyboard too. */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
        <span className="inline-flex" tabIndex={0}>
          {isValidElement<{ disabled?: boolean }>(toggle)
            ? cloneElement(toggle, { disabled: true })
            : toggle}
        </span>
      </Tooltip>
    );
  }
  const trigger = renderToggle(props);
  return (
    <Menu onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <Menu.Trigger asChild disabled={disabled}>
        {trigger}
      </Menu.Trigger>
      <Menu.Content look="actions" side={side} align={align} {...contentProps}>
        {children}
      </Menu.Content>
    </Menu>
  );
};

export const ActionsDropdown: FunctionComponent<
  PropsWithChildren<ActionsDropdownProps>
> = ({
  loading,
  error,
  actions,
  children,
  row,
  refetch,
  data = {},
  tooltip,
  labeled,
  className,
  onToggle,
  side = 'left',
  align = 'start',
  ...rest
}) => (
  <ActionsMenu
    toggle={labeled ? 'labeled' : 'kebab'}
    toggleClassName={className}
    onOpenChange={onToggle}
    side={side}
    align={align}
    tooltip={tooltip}
    {...rest}
  >
    {loading ? (
      <Menu.Item
        disabled
        icon={<SpinnerIcon className="animation-spin" weight="bold" />}
      >
        {translate('Loading actions')}
      </Menu.Item>
    ) : error ? (
      <Menu.Item disabled>{translate('Unable to load actions')}</Menu.Item>
    ) : children ? (
      children
    ) : actions ? (
      <>
        {actions.map((ActionComponent, index) => (
          <ActionComponent key={index} row={row} refetch={refetch} {...data} />
        ))}
      </>
    ) : (
      <Menu.Item disabled>{translate('There are no actions.')}</Menu.Item>
    )}
  </ActionsMenu>
);
