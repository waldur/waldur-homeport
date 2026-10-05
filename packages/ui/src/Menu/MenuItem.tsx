import { QuestionIcon } from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import { Slot } from '@radix-ui/react-slot';
import {
  ComponentPropsWithoutRef,
  forwardRef,
  MouseEvent,
  ReactNode,
  Ref,
  useId,
} from 'react';

import { cn } from '../cn';
import { Tooltip } from '../Tooltip';

import {
  MenuLook,
  MenuRowOptions,
  useMenuKind,
  useMenuLook,
} from './menuContext';

// The app's focus ring (src/tailwind.css) is drawn outside its element, and
// a menu panel clips what overflows it, so a full-width row lost the ring's
// sides. Rows draw it inset instead, as the page tabs do, so it shows whole
// in every menu.
const MENU_ROW_FOCUS_RING_CLASSNAME =
  'focus-visible:outline-offset-[calc(var(--focus-ring-width)*-1)]';

// A nav row. Its padding and colour come from the nav panel it sits in:
// the panel is a `group/menu` carrying data-density and data-tone (see
// menuRowDataAttributes), and these group variants style the rows from it.
//
// - density default (`.menu-dropdown-default`'s row): 10px x 16px,
//   line-height 1.432.
// - density compact: Metronic's base padding (0.615rem) with the `px-3`
//   (0.75rem) the footer menus and BoxRadioField put on their rows.
// - density base (Metronic's base `.menu-link` padding, 0.615rem x
//   0.923rem): the filter and picker popovers.
//   compact and base rows inherit the panel's line-height.
// - tone default is menu-gray-600; strong is menu-gray-700 (not on disabled
//   rows, which keep their own colour).
//
// A highlighted row (`menu-row-active:`, waldur-design-tokens/variants.css:
// hovered, keyboard-highlighted, an open submenu's trigger, the checked
// radio row or `.active`) is gray-700 on gray-50, Metronic's
// menu-state-bg-gray.
const NAV_MENU_ITEM_CLASSNAME = [
  'flex cursor-pointer items-center no-underline select-none transition-colors duration-200',
  'px-[16px] py-[10px] leading-[1.432] text-[var(--menu-item-text)]',
  'group-data-[density=compact]/menu:px-[9.75px] group-data-[density=compact]/menu:py-[8px] group-data-[density=compact]/menu:leading-[inherit]',
  'group-data-[density=base]/menu:px-[12px] group-data-[density=base]/menu:py-[8px] group-data-[density=base]/menu:leading-[inherit]',
  'group-data-[tone=strong]/menu:not-data-disabled:text-[var(--menu-item-strong-text)]',
  'data-disabled:cursor-not-allowed data-disabled:text-[var(--menu-item-disabled-text)] hover:focus-visible:outline-none',
  '[&_.svg-icon]:inline-flex [&_.svg-icon]:items-center [&_.svg-icon]:justify-center [&_.svg-icon]:size-[20px] [&_.svg-icon]:me-[12px] [&_.svg-icon]:shrink-0 [&_.svg-icon>svg]:size-[20px]',
  '[&>svg:first-child]:me-[12px] [&>svg:first-child]:size-[20px] [&>svg:first-child]:shrink-0',
  MENU_ROW_FOCUS_RING_CLASSNAME,
  'menu-row-active:bg-[var(--menu-item-hover-bg)] menu-row-active:text-[var(--menu-item-hover-text)]',
].join(' ');

/** The data attributes a nav panel sets for its rows' density and tone. */
export const menuRowDataAttributes = ({
  density,
  tone,
}: MenuRowOptions = {}) => ({
  'data-density': density,
  'data-tone': tone,
});

// gray-700, 14px, line-height 1, weight 500, 10px x 16px, no wrapping.
// action-row-active: / action-row-disabled: are defined in
// waldur-design-tokens/variants.css.
const ACTIONS_MENU_ITEM_CLASSNAME = [
  'flex items-center w-full whitespace-nowrap px-[16px] py-[10px] text-start text-[14px] leading-none font-medium',
  'text-[var(--menu-item-strong-text)] no-underline',
  'action-row-active:bg-[var(--menu-item-hover-bg)] action-row-active:text-[var(--menu-item-hover-text)]',
  'action-row-disabled:pointer-events-none action-row-disabled:text-[var(--menu-item-muted-text)]',
  'hover:focus-visible:outline-none',
  '[&_.svg-icon]:inline-flex [&_.svg-icon]:items-center [&_.svg-icon]:justify-center [&_.svg-icon]:size-[20px] [&_.svg-icon]:me-[12px] [&_.svg-icon]:shrink-0 [&_.svg-icon>svg]:size-[20px]',
  '[&>svg:first-child]:me-[12px] [&>svg:first-child]:size-[20px] [&>svg:first-child]:shrink-0',
  MENU_ROW_FOCUS_RING_CLASSNAME,
].join(' ');

/** A menu row in the given look. */
export const menuItem = ({ look = 'nav' }: { look?: MenuLook } = {}) =>
  look === 'actions' ? ACTIONS_MENU_ITEM_CLASSNAME : NAV_MENU_ITEM_CLASSNAME;

/** The row classes for the look of the panel this row sits in. */
export const useMenuItemClassName = (lookOverride?: MenuLook) => {
  const panelLook = useMenuLook();
  return menuItem({ look: lookOverride ?? panelLook });
};

export type MenuItemProps = ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Item
> & {
  /** The row's look, when it differs from its panel's (or it has none). */
  look?: MenuLook;
  /** Leading icon node, centered in a 20×20 container with consistent 12px margin. */
  icon?: ReactNode;
  /** Trailing content (e.g. staff badge, indicator, shortcut, tooltip) pushed to the right edge. */
  trailing?: ReactNode;
  /**
   * Tooltip to show beside the item (e.g. why an action is disabled).
   * Renders a question mark icon in the trailing slot with pointer-events re-enabled,
   * so hovering reveals the explanation even when the item is disabled.
   */
  tooltip?: ReactNode;
};

/**
 * A command row, rendered for what it sits in (see MenuKind): a Radix menu
 * item in a Menu; a `role="menuitem"` button that closes the panel in a
 * MenuPopover; a plain button anywhere else (a list of actions in a dialog,
 * which is no menu, so its rows are no menu items). `onSelect` works the same in all
 * three: it fires on pointer and keyboard activation, and the panel closes
 * afterwards unless the handler calls `event.preventDefault()`. `asChild`
 * composes a link or another element as the row.
 */
export const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(
  (
    { className, look, onSelect, icon, trailing, tooltip, children, ...props },
    ref,
  ) => {
    const kind = useMenuKind();
    const panelLook = useMenuLook();
    const effectiveLook = look ?? panelLook;
    const rowClassName = useMenuItemClassName(look);
    const testId =
      props['data-testid'] ??
      (effectiveLook === 'actions' ? 'action-item' : undefined);

    const descriptionId = useId();
    const hasTextDescription = typeof tooltip === 'string' && Boolean(tooltip);

    const tooltipElement = tooltip ? (
      <Tooltip label={tooltip}>
        <QuestionIcon
          size={20}
          weight="bold"
          aria-hidden="true"
          className={cn(
            'ms-1 text-[var(--menu-item-muted-text)]',
            props.disabled && 'opacity-50',
          )}
        />
      </Tooltip>
    ) : null;

    const effectiveTrailing =
      trailing || tooltipElement ? (
        <>
          {trailing}
          {tooltipElement}
        </>
      ) : undefined;

    const hasSlots = Boolean(icon || effectiveTrailing || hasTextDescription);
    const content =
      hasSlots && !props.asChild ? (
        <>
          {icon && (
            <span className="menu-item-icon inline-flex shrink-0 items-center justify-center size-[20px] me-[12px] [&>svg]:size-[20px] leading-none">
              {icon}
            </span>
          )}
          <span
            className={cn(
              'menu-item-label flex-1 min-w-0',
              props.disabled && 'opacity-50',
            )}
          >
            {children}
          </span>
          {effectiveTrailing && (
            <span className="menu-item-trailing ms-auto ps-3 inline-flex shrink-0 items-center pointer-events-auto">
              {effectiveTrailing}
            </span>
          )}
          {hasTextDescription && (
            <span id={descriptionId} className="sr-only">
              {tooltip}
            </span>
          )}
        </>
      ) : (
        children
      );

    const ariaDescribedBy = hasTextDescription
      ? props['aria-describedby']
        ? `${props['aria-describedby']} ${descriptionId}`
        : descriptionId
      : props['aria-describedby'];

    if (kind === 'menu') {
      return (
        <DropdownMenuPrimitive.Item
          ref={ref}
          data-testid={testId}
          className={cn(rowClassName, className)}
          onSelect={onSelect}
          aria-describedby={ariaDescribedBy}
          {...props}
        >
          {content}
        </DropdownMenuPrimitive.Item>
      );
    }
    const {
      asChild,
      disabled,
      onClick,
      textValue: _textValue,
      'aria-describedby': _ariaDescribedBy,
      ...rest
    } = props;
    const Row = asChild ? Slot : 'button';
    const row = (
      <Row
        ref={ref as unknown as Ref<HTMLButtonElement>}
        type={asChild ? undefined : 'button'}
        role={kind === 'popover' ? 'menuitem' : undefined}
        disabled={disabled}
        data-disabled={disabled ? '' : undefined}
        data-testid={testId}
        className={cn(rowClassName, 'w-full text-start', className)}
        aria-describedby={ariaDescribedBy}
        onClick={(event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event as unknown as MouseEvent<HTMLDivElement>);
          // The synthetic event stands in for Radix's select event: a
          // handler that prevents its default keeps the popover open.
          if (!event.defaultPrevented) onSelect?.(event as unknown as Event);
        }}
        {...(rest as unknown as ComponentPropsWithoutRef<'button'>)}
      >
        {content}
      </Row>
    );
    return kind === 'popover' ? (
      <PopoverPrimitive.Close asChild>{row}</PopoverPrimitive.Close>
    ) : (
      row
    );
  },
);
MenuItem.displayName = 'Menu.Item';
